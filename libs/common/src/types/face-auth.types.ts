/**
 * Result interface for Face Login with Liveness Detection
 */
export interface FaceLoginResult {
  success: boolean;
  decision: 'LOGIN_SUCCESS' | 'REQUIRE_STEP_UP' | 'DENY';

  // NEW: JWT token and user info (only on success)
  accessToken?: string;
  user?: {
    id: string;
    email: string;
    username?: string;
    name: string;
    role: string;
    hasFaceRegistered?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  };

  // Keep for backward compatibility
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
  // NEW: Full user info (internal use for JWT generation)
  user?: {
    id: string;
    email: string;
    username?: string;
    name: string;
    role: string;
    hasFaceRegistered?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  };
}
