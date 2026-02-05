from pydantic import BaseModel
from typing import List, Optional

# --- Liveness Schemas ---
class LivenessCheckRequest(BaseModel):
    frames: List[str]
    challenge_passed: bool

class LivenessCheckResponse(BaseModel):
    is_live: bool
    liveness_score: float

# --- Vector Schemas ---
class ExtractVectorRequest(BaseModel):
    frames: List[str]

class ExtractVectorResponse(BaseModel):
    vector: List[float]
    frame_index: int

class CompareVectorsRequest(BaseModel):
    vector1: List[float]
    vector2: List[float]

class CompareVectorsResponse(BaseModel):
    similarity: float
    distance: float
    match: bool
    is_same_person: bool

# --- Verification Schemas ---
class VerifyFaceRequest(BaseModel):
    frames: List[str]
    challenge_passed: bool
    stored_vector: List[float]

class VerifyFaceResponse(BaseModel):
    is_live: bool
    liveness_score: float
    similarity: float
    distance: float
    match: bool
    decision: str

# --- NEW: Stateful Schemas ---
class RegisterFaceRequest(BaseModel):
    frames: List[str]
    external_id: str
    type: str  # 'USER' or 'ADMIN'

class RegisterFaceResponse(BaseModel):
    success: bool
    face_id: str
    external_id: str

class IdentifyFaceRequest(BaseModel):
    frames: List[str]
    challenge_passed: bool = True # Default to True for simple identify, or require liveness

class IdentifyFaceResponse(BaseModel):
    success: bool
    external_id: Optional[str] = None
    type: Optional[str] = None
    similarity: float
    distance: float
    is_live: bool
