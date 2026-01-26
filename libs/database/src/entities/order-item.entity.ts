import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { MenuItem } from './menu-item.entity';

export enum OrderItemStatus {
  PENDING = 'pending',
  PREPARING = 'preparing',
  READY = 'ready',
  SERVED = 'served',
  CANCELLED = 'cancelled',
}

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  orderId: string;

  @ManyToOne(() => Order, (order) => order.items)
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @Column('uuid')
  menuItemId: string;

  @ManyToOne(() => MenuItem)
  @JoinColumn({ name: 'menuItemId' })
  menuItem: MenuItem;

  @Column({ length: 150 })
  menuItemName: string;

  @Column({ default: 1 })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalPrice: number;

  @Column({
    type: 'enum',
    enum: OrderItemStatus,
    default: OrderItemStatus.PENDING,
  })
  status: OrderItemStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'jsonb', nullable: true })
  selectedModifiers: {
    modifierId: string;
    modifierName: string;
    optionId: string;
    optionName: string;
    price: number;
  }[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
