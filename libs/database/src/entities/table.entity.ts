import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { TableSession } from './table-session.entity';
import { Order } from './order.entity';

export enum TableStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  RESERVED = 'reserved',
  CLEANING = 'cleaning',
}

@Entity('tables')
export class Table {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  number: number;

  @Column({ default: 4 })
  capacity: number;

  @Column({
    type: 'enum',
    enum: TableStatus,
    default: TableStatus.AVAILABLE,
  })
  status: TableStatus;

  @Column({ nullable: true })
  qrCode: string;

  @Column('uuid', { nullable: true })
  currentSessionId: string;

  @OneToMany(() => TableSession, (session) => session.table)
  sessions: TableSession[];

  @OneToMany(() => Order, (order) => order.table)
  orders: Order[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
