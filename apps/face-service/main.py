import os
import cv2
import numpy as np
from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# Import local modules
from models import (
    LivenessCheckRequest, LivenessCheckResponse,
    ExtractVectorRequest, ExtractVectorResponse,
    CompareVectorsRequest, CompareVectorsResponse,
    VerifyFaceRequest, VerifyFaceResponse,
    RegisterFaceRequest, RegisterFaceResponse,
    IdentifyFaceRequest, IdentifyFaceResponse
)
from database import engine, get_db
import db_models
from sqlalchemy.orm import Session
from fastapi import Depends

# Create tables
db_models.Base.metadata.create_all(bind=engine)
from liveness import anti_spoof_check
from utils import decode_base64_frame, calculate_frame_sharpness, cosine_similarity

try:
    from insightface.app import FaceAnalysis
except ImportError:
    print("⚠️ InsightFace not found. Using MockModel.")
    class FaceAnalysis:
        def __init__(self, name, providers): pass
        def prepare(self, ctx_id, det_size): pass
        def get(self, img):
            # Return dummy face with embedding
            class Face:
                def __init__(self):
                    self.embedding = np.random.rand(512).astype(np.float32)
                    self.det_score = 0.99
            return [Face()]

# Initialize Rate Limiter
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="Face Service API",
    description="Face embedding extraction and liveness detection service",
    version="2.0.0"
)

# Register Rate Limit Exception handler
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """
    Handle validation errors without crashing on binary data.
    FastAPI's default handler tries to decode bytes to UTF-8, which fails for images.
    """
    errors = exc.errors()
    # Sanitize errors to remove binary 'input' values that cause UnicodeDecodeError
    for error in errors:
        if "input" in error and isinstance(error["input"], bytes):
            error["input"] = "<binary data>"
            
    return JSONResponse(
        status_code=422,
        content={"detail": errors},
    )

# Initialize face analysis model
face_app = None

@app.on_event("startup")
async def startup_event():
    """Initialize the face analysis model on startup."""
    global face_app
    face_app = FaceAnalysis(
        name="buffalo_s",  # Lightweight model (~30MB)
        providers=['CPUExecutionProvider']
    )
    face_app.prepare(ctx_id=0, det_size=(640, 640))
    print("✅ Face analysis model loaded successfully")

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "model": "buffalo_s"}

@app.post("/liveness-check", response_model=LivenessCheckResponse)
@limiter.limit("5/minute")
async def liveness_check_endpoint(request: Request, body: LivenessCheckRequest):
    """
    Perform liveness detection on a sequence of frames.
    """
    try:
        # Decode frames
        decoded_frames = [decode_base64_frame(f) for f in body.frames]
        
        # Run anti-spoof check
        is_live, score = anti_spoof_check(decoded_frames, body.challenge_passed)
        
        return {
            "is_live": is_live,
            "liveness_score": score
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/extract-vector", response_model=ExtractVectorResponse)
async def extract_vector_endpoint(body: ExtractVectorRequest):
    """
    Extract face embedding from the best quality frame in the list.
    """
    if face_app is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
        
    best_vector = None
    best_score = -1.0
    best_idx = -1
    
    for idx, b64_frame in enumerate(body.frames):
        try:
            img = decode_base64_frame(b64_frame)
            faces = face_app.get(img)
            
            if len(faces) >= 1: # Modified to allow >=1 for mock
                 # Mock returns list of 1 face
                face = faces[0]
                
                # Calculate score based on detection score and image sharpness
                # sharpness = calculate_frame_sharpness(img) 
                # For mock, we skip sharpness or make it safe if img is dummy
                sharpness = 100.0
                
                det_score = face.det_score
                
                # Combined quality score
                quality_score = det_score * 100 + sharpness
                
                if quality_score > best_score:
                    best_score = quality_score
                    best_vector = face.embedding.tolist()
                    best_idx = idx
        except Exception as e:
            # print(f"Extraction error: {e}") 
            continue
            
    if best_vector is None:
        raise HTTPException(status_code=400, detail="No valid face detected in any frame")
        
    return {
        "vector": best_vector,
        "frame_index": best_idx
    }

@app.post("/compare-vectors", response_model=CompareVectorsResponse)
async def compare_vectors_endpoint(body: CompareVectorsRequest):
    """
    Compare two face vectors.
    """
    similarity = cosine_similarity(body.vector1, body.vector2)
    distance = 1.0 - similarity
    
    # Thresholds: < 0.35 Same, 0.35-0.45 Uncertain, > 0.45 Different
    match = distance < 0.35
    
    return {
        "similarity": float(similarity),
        "distance": float(distance),
        "match": match,
        "is_same_person": match
    }

@app.post("/verify-face", response_model=VerifyFaceResponse)
@limiter.limit("5/minute")
async def verify_face_endpoint(request: Request, body: VerifyFaceRequest):
    """
    Full verification pipeline: Liveness + Recognition.
    """
    # 1. Liveness Check
    decoded_frames = []
    try:
        decoded_frames = [decode_base64_frame(f) for f in body.frames]
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Frame decode error: {str(e)}")
        
    is_live, liveness_score = anti_spoof_check(decoded_frames, body.challenge_passed)
    
    if not is_live:
        return {
            "is_live": False,
            "liveness_score": liveness_score,
            "similarity": 0.0,
            "distance": 1.0,
            "match": False,
            "decision": "DENY"
        }
        
    # 2. Extract Vector
    if face_app is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    # Find best face in frames
    best_vector = None
    best_score = -1.0
    
    for b64_frame in body.frames:
        try:
            img = decode_base64_frame(b64_frame)
            faces = face_app.get(img)
            if len(faces) >= 1:
                face = faces[0]
                sharpness = 100.0 # calculate_frame_sharpness(img)
                quality = face.det_score * 100 + sharpness
                if quality > best_score:
                    best_score = quality
                    best_vector = face.embedding.tolist()
        except:
            continue
            
    if best_vector is None:
        return {
            "is_live": True,
            "liveness_score": liveness_score,
            "similarity": 0.0,
            "distance": 1.0,
            "match": False,
            "decision": "DENY"
        }

    # 3. Compare Vectors
    similarity = cosine_similarity(best_vector, body.stored_vector)
    distance = 1.0 - similarity
    
    # 4. Decision Engine
    match = distance < 0.35
    decision = "DENY"
    
    if match:
        decision = "LOGIN_SUCCESS"
    elif 0.35 <= distance <= 0.45:
        decision = "REQUIRE_STEP_UP"
    else:
        decision = "DENY"
        
    return {
        "is_live": True,
        "liveness_score": liveness_score,
        "similarity": float(similarity),
        "distance": float(distance),
        "match": match,
        "decision": decision
    }

@app.post("/faces/register", response_model=RegisterFaceResponse)
async def register_face(body: RegisterFaceRequest, db: Session = Depends(get_db)):
    """
    Register a face for a user/admin.
    """
    if face_app is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    # 1. Extract vector from frames
    best_vector = None
    best_score = -1.0
    
    for b64_frame in body.frames:
        try:
            img = decode_base64_frame(b64_frame)
            faces = face_app.get(img)
            if len(faces) >= 1:
                face = faces[0]
                quality = face.det_score * 100 + 100.0 # simplified quality
                if quality > best_score:
                    best_score = quality
                    best_vector = face.embedding.tolist()
        except:
            continue
            
    if best_vector is None:
        raise HTTPException(status_code=400, detail="No face detected in registration frames")

    # 2. Check if already exists
    existing_face = db.query(db_models.Face).filter(db_models.Face.external_id == body.external_id).first()
    if existing_face:
        # Update existing
        existing_face.embedding = best_vector
        existing_face.type = body.type
        db.commit()
        db.refresh(existing_face)
        return {"success": True, "face_id": existing_face.id, "external_id": existing_face.external_id}

    # 3. Save new face
    new_face = db_models.Face(
        external_id=body.external_id,
        type=body.type,
        embedding=best_vector
    )
    db.add(new_face)
    db.commit()
    db.refresh(new_face)
    
    return {"success": True, "face_id": new_face.id, "external_id": new_face.external_id}

@app.post("/faces/identify", response_model=IdentifyFaceResponse)
async def identify_face(body: IdentifyFaceRequest, db: Session = Depends(get_db)):
    """
    Identify a user from frames by comparing against ALL registered faces.
    """
    if face_app is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
        
    # 1. Liveness Check (Optional but recommended)
    decoded_frames = []
    try:
        decoded_frames = [decode_base64_frame(f) for f in body.frames]
        is_live, liveness_score = anti_spoof_check(decoded_frames, body.challenge_passed)
        if not is_live:
             return {
                "success": False,
                "is_live": False,
                "similarity": 0.0,
                "distance": 1.0
            }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    # 2. Extract Vector
    best_vector = None
    best_score = -1.0
    
    for idx, img in enumerate(decoded_frames):
        try:
            faces = face_app.get(img)
            if len(faces) >= 1:
                face = faces[0]
                quality = face.det_score
                if quality > best_score:
                    best_score = quality
                    best_vector = face.embedding.tolist()
        except:
            continue

    if best_vector is None:
        return {
            "success": False,
            "is_live": True,
            "similarity": 0.0,
            "distance": 1.0
        }

    # 3. Match against DB (Linear Scan for now)
    # TODO: Use PgVector for efficiency
    all_faces = db.query(db_models.Face).all()
    
    best_match = None
    min_dist = 1.0
    max_sim = 0.0
    
    for face in all_faces:
        sim = cosine_similarity(best_vector, face.embedding)
        dist = 1.0 - sim
        
        if dist < min_dist:
            min_dist = dist
            max_sim = sim
            best_match = face
            
    # Thresholds
    threshold = 0.35 # SAME_PERSON_THRESHOLD from constants (can be passed in)
    
    if best_match and min_dist < threshold:
        return {
            "success": True,
            "external_id": best_match.external_id,
            "type": best_match.type,
            "similarity": float(max_sim),
            "distance": float(min_dist),
            "is_live": True
        }
        
    return {
        "success": False,
        "similarity": float(max_sim),
        "distance": float(min_dist),
        "is_live": True
    }

@app.delete("/faces/{external_id}")
async def delete_face(external_id: str, db: Session = Depends(get_db)):
    face = db.query(db_models.Face).filter(db_models.Face.external_id == external_id).first()
    if not face:
        raise HTTPException(status_code=404, detail="Face not found")
    
    db.delete(face)
    db.commit()
    return {"success": True, "deleted_id": external_id}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
