import base64
import cv2
import numpy as np

def decode_base64_frame(base64_string: str) -> np.ndarray:
    """
    Decode base64 string to OpenCV image.
    """
    try:
        if "," in base64_string:
            base64_string = base64_string.split(",")[1]
        
        image_data = base64.b64decode(base64_string)
        nparr = np.frombuffer(image_data, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        return img
    except Exception as e:
        raise ValueError(f"Invalid base64 string: {str(e)}")

def calculate_frame_sharpness(img: np.ndarray) -> float:
    """
    Calculate image sharpness using Laplacian variance.
    Higher value means sharper image.
    """
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    return cv2.Laplacian(gray, cv2.CV_64F).var()

def cosine_similarity(v1: list[float], v2: list[float]) -> float:
    """
    Calculate cosine similarity between two vectors.
    """
    a = np.array(v1)
    b = np.array(v2)
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))
