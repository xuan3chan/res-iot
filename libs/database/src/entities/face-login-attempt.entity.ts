import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Admin } from './admin.entity';

export enum FaceLoginResult {
  SUCCESS = 'SUCCESS',
  REQUIRE_STEP_UP = 'REQUIRE_STEP_UP',
  LIVENESS_FAIL = 'LIVENESS_FAIL',
  NO_MATCH = 'NO_MATCH',
  ERROR = 'ERROR',
}

@Entity('face_login_attempts')
export class FaceLoginAttempt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  userId: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'userId' })
  user: User | null;

  @Column({ nullable: true })
  adminId: string | null;

  @ManyToOne(() => Admin, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'adminId' })
  admin: Admin | null;

  @Column({ length: 50 })
  ipAddress: string;

  @Column({ length: 255, nullable: true })
  deviceId: string | null;

  @Column({ type: 'float' })
  livenessScore: number;

  @Column({ type: 'float', nullable: true })
  similarityScore: number | null;

  @Column({ type: 'float', nullable: true })
  distance: number | null;

  @Column({
    type: 'enum',
    enum: FaceLoginResult,
  })
  result: FaceLoginResult;

  @CreateDateColumn()
  createdAt: Date;
}
