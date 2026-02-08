import { Order, OrderItem, OrderStatus, OrderItemStatus, Table, TableStatus } from '@libs/types';

// Event Names
export const SocketEvents = {
  // Connection events
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',

  // Order events
  ORDER_CREATED: 'order:created',
  ORDER_UPDATED: 'order:updated',
  ORDER_CANCELLED: 'order:cancelled',
  ORDER_ITEM_UPDATED: 'order:item:updated',

  // Table events
  TABLE_STATUS_CHANGED: 'table:status:changed',
  TABLE_SESSION_STARTED: 'table:session:started',
  TABLE_SESSION_ENDED: 'table:session:ended',
  TABLE_CALL_WAITER: 'table:call-waiter',
  TABLE_CALL_WAITER_RESOLVED: 'table:call-waiter:resolved',

  // Kitchen events
  KITCHEN_NEW_ORDER: 'kitchen:new-order',
  KITCHEN_ORDER_READY: 'kitchen:order-ready',

  // Room events (for joining specific rooms)
  JOIN_TABLE_ROOM: 'join:table',
  JOIN_KITCHEN_ROOM: 'join:kitchen',
  JOIN_ADMIN_ROOM: 'join:admin',
  LEAVE_ROOM: 'leave:room',
} as const;

// Event Payloads
export interface OrderCreatedPayload {
  order: Order;
  tableNumber: number;
}

export interface OrderUpdatedPayload {
  orderId: string;
  status: OrderStatus;
  updatedAt: Date;
}

export interface OrderCancelledPayload {
  orderId: string;
  reason?: string;
  cancelledAt: Date;
}

export interface OrderItemUpdatedPayload {
  orderId: string;
  orderItem: OrderItem;
  status: OrderItemStatus;
}

export interface TableStatusChangedPayload {
  tableId: string;
  tableNumber: number;
  previousStatus: TableStatus;
  newStatus: TableStatus;
}

export interface TableSessionStartedPayload {
  tableId: string;
  tableNumber: number;
  sessionId: string;
}

export interface TableSessionEndedPayload {
  tableId: string;
  tableNumber: number;
  sessionId: string;
}

export interface CallWaiterPayload {
  tableId: string;
  tableNumber: number;
  sessionId: string;
  reason?: string;
  timestamp: Date;
}

export interface CallWaiterResolvedPayload {
  tableId: string;
  tableNumber: number;
  resolvedBy: string;
  resolvedAt: Date;
}

export interface JoinRoomPayload {
  roomId: string;
  token?: string;
}

// Room naming conventions
export const RoomNames = {
  table: (tableId: string) => `table:${tableId}`,
  kitchen: () => 'kitchen',
  admin: () => 'admin',
  orders: () => 'orders',
} as const;

export type SocketEventName = (typeof SocketEvents)[keyof typeof SocketEvents];
