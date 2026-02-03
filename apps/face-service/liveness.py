import numpy as np
import cv2
from typing import List, Tuple
from utils import calculate_frame_sharpness

class LivenessDetector:
    def __init__(self):
        # Thresholds
        self.LIVENESS_THRESHOLD = 0.7
        self.VARIANCE_THRESHOLD = 100.0  # Minimum pixel variance between frames
        
    def check_liveness(self, frames: List[np.ndarray], challenge_passed: bool) -> Tuple[bool, float]:
        """
        Perform liveness detection on a sequence of frames.
        Returns: (is_live, score)
        """
        if not challenge_passed:
            return False, 0.0
            
        if len(frames) < 10:
            return False, 0.0
            
        # 1. Variance Check (Anti-static photo)
        # Check if frames are identical (screen replay / static photo)
        variance_score = self._calculate_sequence_variance(frames)
        if variance_score < self.VARIANCE_THRESHOLD:
            return False, 0.1  # Low score for static input
            
        # 2. Challenge Verification (Client passed basic check, we verify consistency)
        # In a full implementation, we would re-verify the specific challenge (e.g. detect blink)
        # For now, we trust the client's challenge_passed but weight it with variance
        
        # Calculate final score
        # Base score starts high if challenge passed
        score = 0.6 if challenge_passed else 0.0
        
        # Add boost for variance (natural movement)
        if variance_score > 500:
            score += 0.3
        elif variance_score > 200:
            score += 0.15
            
        # Cap score at 1.0
        score = min(score, 1.0)
        
        is_live = score >= self.LIVENESS_THRESHOLD
        
        return is_live, score
        
    def _calculate_sequence_variance(self, frames: List[np.ndarray]) -> float:
        """
        Calculate pixel variance across frames to detect static images.
        """
        # subsample frames to save partial processing time
        selected_frames = frames[::2] 
        if len(selected_frames) < 2:
            return 0.0
            
        diffs = []
        for i in range(len(selected_frames) - 1):
            f1 = cv2.cvtColor(selected_frames[i], cv2.COLOR_BGR2GRAY)
            f2 = cv2.cvtColor(selected_frames[i+1], cv2.COLOR_BGR2GRAY)
            
            # Resize for speed
            f1 = cv2.resize(f1, (100, 100))
            f2 = cv2.resize(f2, (100, 100))
            
            diff = cv2.absdiff(f1, f2)
            diffs.append(np.mean(diff))
            
        return sum(diffs) / len(diffs) if diffs else 0.0

liveness_detector = LivenessDetector()

def anti_spoof_check(frames: List[np.ndarray], challenge_passed: bool) -> Tuple[bool, float]:
    """Helper wrapper for liveness detector"""
    return liveness_detector.check_liveness(frames, challenge_passed)
