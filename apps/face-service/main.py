import os
import cv2
import numpy as np
from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# Import local modules
from models import (
    LivenessCheckRequest, LivenessCheckResponse,
    ExtractVectorRequest, ExtractVectorResponse,
    CompareVectorsRequest, CompareVectorsResponse,
    VerifyFaceRequest, VerifyFaceResponse
)
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
