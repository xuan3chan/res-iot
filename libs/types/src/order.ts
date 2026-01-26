// Order Types

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  READY = 'ready',
  SERVED = 'served',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum OrderItemStatus {
  PENDING = 'pending',
  PREPARING = 'preparing',
  READY = 'ready',
  SERVED = 'served',
  CANCELLED = 'cancelled',
}

export interface Order {
  id: string;
  tableId: string;
  tableNumber: number;
  sessionId: string;
  status: OrderStatus;
  items: OrderItem[];
  totalAmount: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  menuItemId: string;
  menuItemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: OrderItemStatus;
  notes?: string;
  selectedModifiers?: SelectedModifier[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SelectedModifier {
  modifierId: string;
  modifierName: string;
  optionId: string;
  optionName: string;
  price: number;
}

export interface CreateOrderDto {
  tableId: string;
  items: CreateOrderItemDto[];
  notes?: string;
}

export interface CreateOrderItemDto {
  menuItemId: string;
  quantity: number;
  notes?: string;
  selectedModifiers?: {
    modifierId: string;
    optionId: string;
  }[];
}

export interface UpdateOrderStatusDto {
  status: OrderStatus;
}

export interface UpdateOrderItemStatusDto {
  status: OrderItemStatus;
}
