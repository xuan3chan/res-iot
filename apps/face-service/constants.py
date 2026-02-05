from enum import Enum

class LivenessThreshold(float, Enum):
    PASS_SCORE = 0.7
    MIN_VARIANCE = 3.0    # Increased from 3.0 - require more natural movement
    HIGH_VARIANCE = 10.0  # Increased from 8.0

class LivenessScore(float, Enum):
    BASE_PASS = 0.6
    BOOST_HIGH = 0.3
    BOOST_MODERATE = 0.15
    STATIC_PENALTY = 0.1
