import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Target } from './target.entity';
import { Vulnerability } from './vulnerability.entity';

export enum ScanStatus {
  QUEUED = 'QUEUED',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum ScanProfile {
  QUICK = 'QUICK',
  FULL = 'FULL',
}

@Entity('scan_sessions')
export class ScanSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  targetId: string;

  @Column({
    type: 'enum',
    enum: ScanStatus,
    default: ScanStatus.QUEUED,
  })
  status: ScanStatus;

  @Column({
    type: 'enum',
    enum: ScanProfile,
    default: ScanProfile.QUICK,
  })
  profile: ScanProfile;

  @Column({ type: 'timestamp', nullable: true })
  startTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  endTime: Date;

  @Column({ type: 'int', default: 0 })
  riskScore: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Target, (target) => target.scanSessions)
  @JoinColumn({ name: 'targetId' })
  target: Target;

  @OneToMany(() => Vulnerability, (vulnerability) => vulnerability.scanSession)
  vulnerabilities: Vulnerability[];
}
