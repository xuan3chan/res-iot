from typing import List, Literal, Optional
from pydantic import BaseModel, Field

class LivenessCheckRequest(BaseModel):
    frames: List[str] = Field(..., min_length=10, description="List of base64 encoded frames (minimum 10)")
    challenge_type: Literal["BLINK", "TURN_HEAD", "OPEN_MOUTH", "READ_NUMBER"]
    challenge_passed: bool

class LivenessCheckResponse(BaseModel):
    is_live: bool
    liveness_score: float

class ExtractVectorRequest(BaseModel):
    frames: List[str] = Field(..., min_length=1, description="List of base64 encoded frames")

class ExtractVectorResponse(BaseModel):
    vector: List[float] = Field(..., description="512-dimensional face embedding")
    frame_index: int = Field(..., description="Index of the frame used for extraction")

class CompareVectorsRequest(BaseModel):
    vector1: List[float] = Field(..., min_length=512, max_length=512)
    vector2: List[float] = Field(..., min_length=512, max_length=512)

class CompareVectorsResponse(BaseModel):
    similarity: float
    distance: float
    match: bool
    is_same_person: bool # keeping for backward compatibility if needed, but match covers it

class VerifyFaceRequest(BaseModel):
    frames: List[str] = Field(..., min_length=10)
    challenge_type: Literal["BLINK", "TURN_HEAD", "OPEN_MOUTH", "READ_NUMBER"]
    challenge_passed: bool
    stored_vector: List[float] = Field(..., min_length=512, max_length=512)

class VerifyFaceResponse(BaseModel):
    is_live: bool
    liveness_score: float
    similarity: float
    distance: float
    match: bool
    decision: Literal["LOGIN_SUCCESS", "REQUIRE_STEP_UP", "DENY"]
