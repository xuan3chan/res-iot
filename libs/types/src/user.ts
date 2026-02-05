// User & Auth Types

export interface User {
  id: string;
  email: string;
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  accessToken: string;
  user: Omit<User, 'password'>;
}

export interface TableSessionAuth {
  sessionId: string;
  tableId: string;
  tableNumber: number;
  token: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role?: string; // Optional, only present for admin tokens
  iat?: number;
  exp?: number;
}

export interface TableSessionPayload {
  sessionId: string;
  tableId: string;
  tableNumber: number;
  iat?: number;
  exp?: number;
}
