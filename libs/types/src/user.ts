// User & Auth Types

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  KITCHEN_STAFF = 'kitchen_staff',
  WAITER = 'waiter',
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
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
  role?: UserRole;
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
  role: UserRole;
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
