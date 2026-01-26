// Table Types

export enum TableStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  RESERVED = 'reserved',
  CLEANING = 'cleaning',
}

export interface Table {
  id: string;
  number: number;
  capacity: number;
  status: TableStatus;
  qrCode?: string;
  currentSessionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TableSession {
  id: string;
  tableId: string;
  token: string;
  startedAt: Date;
  endedAt?: Date;
  isActive: boolean;
}

export interface CreateTableDto {
  number: number;
  capacity: number;
}

export interface UpdateTableDto {
  number?: number;
  capacity?: number;
  status?: TableStatus;
}

export interface CallWaiterRequest {
  tableId: string;
  sessionId: string;
  reason?: string;
}
