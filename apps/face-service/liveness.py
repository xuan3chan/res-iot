import numpy as np
import cv2
from typing import List, Tuple
from utils import calculate_frame_sharpness

from constants import LivenessThreshold, LivenessScore

class LivenessDetector:
    def __init__(self):
        # Thresholds
        self.LIVENESS_THRESHOLD = LivenessThreshold.PASS_SCORE.value
        self.VARIANCE_THRESHOLD = LivenessThreshold.MIN_VARIANCE.value
        
    def check_liveness(self, frames: List[np.ndarray], challenge_passed: bool) -> Tuple[bool, float]:
        """
        Perform liveness detection on a sequence of frames.
        Returns: (is_live, score)
        """
        print(f"[Liveness] Checking liveness: challenge_passed={challenge_passed}, num_frames={len(frames)}")
        
        if not challenge_passed:
            print("[Liveness] FAILED: challenge_passed is False")
            return False, 0.0
            
        if len(frames) < 10:
            print(f"[Liveness] FAILED: Not enough frames ({len(frames)} < 10)")
            return False, 0.0
            
        # 1. Variance Check (Anti-static photo)
        # Check if frames are identical (screen replay / static photo)
        variance_score = self._calculate_sequence_variance(frames)
        print(f"[Liveness] Variance score: {variance_score:.2f} (threshold: {self.VARIANCE_THRESHOLD})")
        
        if variance_score < self.VARIANCE_THRESHOLD:
            print(f"[Liveness] FAILED: Variance too low ({variance_score:.2f} < {self.VARIANCE_THRESHOLD})")
            return False, LivenessScore.STATIC_PENALTY.value  # Low score for static input
            
        # 2. Challenge Verification (Client passed basic check, we verify consistency)
        # In a full implementation, we would re-verify the specific challenge (e.g. detect blink)
        # For now, we trust the client's challenge_passed but weight it with variance
        
        # Calculate final score
        # Base score starts high if challenge passed
        score = LivenessScore.BASE_PASS.value if challenge_passed else 0.0
        
        # Add boost for variance (natural movement)
        if variance_score > LivenessThreshold.HIGH_VARIANCE.value:
            score += LivenessScore.BOOST_HIGH.value
            print(f"[Liveness] Added {LivenessScore.BOOST_HIGH.value} boost for high variance (>{LivenessThreshold.HIGH_VARIANCE.value})")
        elif variance_score > LivenessThreshold.MIN_VARIANCE.value:
            score += LivenessScore.BOOST_MODERATE.value
            print(f"[Liveness] Added {LivenessScore.BOOST_MODERATE.value} boost for moderate variance (>{LivenessThreshold.MIN_VARIANCE.value})")
            
        # Cap score at 1.0
        score = min(score, 1.0)
        
        is_live = score >= self.LIVENESS_THRESHOLD
        print(f"[Liveness] Final score: {score:.2f}, threshold: {self.LIVENESS_THRESHOLD}, is_live: {is_live}")
        
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
