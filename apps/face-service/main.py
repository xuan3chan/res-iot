import os
import io
import numpy as np
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import cv2
from insightface.app import FaceAnalysis

app = FastAPI(
    title="Face Service API",
    description="Face embedding extraction service using InsightFace",
    version="1.0.0"
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

@app.post("/extract-vector")
async def extract_vector(file: UploadFile = File(...)):
    """
    Extract face embedding vector from uploaded image.
    
    Returns:
        - vectors: List of 512-dim embedding vectors (one per detected face)
        - count: Number of faces detected
    """
    if face_app is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    # Read image file
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if img is None:
        raise HTTPException(status_code=400, detail="Invalid image file")
    
    # Detect faces and extract embeddings
    faces = face_app.get(img)
    
    if len(faces) == 0:
        return JSONResponse(
            status_code=200,
            content={
                "vectors": [],
                "count": 0,
                "message": "No face detected in the image"
            }
        )
    
    # Extract embeddings from all detected faces
    vectors = []
    for face in faces:
        embedding = face.embedding.tolist()
        vectors.append(embedding)
    
    return {
        "vectors": vectors,
        "count": len(vectors),
        "message": f"Successfully extracted {len(vectors)} face(s)"
    }

@app.post("/compare-vectors")
async def compare_vectors(vector1: list[float], vector2: list[float]):
    """
    Compare two face vectors using cosine similarity.
    
    Returns:
        - similarity: Cosine similarity score (0-1, higher is more similar)
        - distance: Cosine distance (0-2, lower is more similar)
    """
    if len(vector1) != 512 or len(vector2) != 512:
        raise HTTPException(status_code=400, detail="Vectors must be 512-dimensional")
    
    v1 = np.array(vector1)
    v2 = np.array(vector2)
    
    # Cosine similarity
    similarity = np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2))
    distance = 1 - similarity
    
    return {
        "similarity": float(similarity),
        "distance": float(distance),
        "is_same_person": distance < 0.4  # Threshold for same person
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
