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
import { User } from './user.entity';
import { ScanSession } from './scan-session.entity';

export enum TargetEnvironment {
  STAGING = 'STAGING',
  PROD = 'PROD',
}

@Entity('targets')
export class Target {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column()
  url: string;

  @Column({ nullable: true })
  verificationToken: string;

  @Column({ default: false })
  isVerified: boolean;

  @Column({
    type: 'enum',
    enum: TargetEnvironment,
    default: TargetEnvironment.STAGING,
  })
  environment: TargetEnvironment;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => ScanSession, (scanSession) => scanSession.target)
  scanSessions: ScanSession[];
}
