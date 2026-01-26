import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  KITCHEN_STAFF = 'kitchen_staff',
  WAITER = 'waiter',
  CUSTOMER = 'customer',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column()
  password: string;

  @Column({ length: 100 })
  name: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.WAITER,
  })
  role: UserRole;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  faceVector: number[] | null;

  @Column({ default: false })
  hasFaceRegistered: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
