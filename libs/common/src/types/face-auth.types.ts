/**
 * Result interface for Face Login with Liveness Detection
 */
export interface FaceLoginResult {
  success: boolean;
  decision: 'LOGIN_SUCCESS' | 'REQUIRE_STEP_UP' | 'DENY';
  userId?: string;
  userName?: string;
  role?: string;
  isLive: boolean;
  livenessScore: number;
  similarity?: number;
  distance?: number;
  message: string;
}

/**
 * Result interface for Face Verification with Liveness
 */
export interface VerifyWithLivenessResult {
  success: boolean;
  decision: 'LOGIN_SUCCESS' | 'REQUIRE_STEP_UP' | 'DENY';
  userId?: string;
  userName?: string;
  role?: string;
  isLive: boolean;
  livenessScore: number;
  similarity?: number;
  distance?: number;
  message: string;
}
