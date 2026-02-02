import { User } from '@libs/database';

/**
 * Result interface for VerifyFaceCommand
 */
export interface VerifyFaceResult {
  success: boolean;
  user?: User;
  similarity?: number;
  message: string;
}
