import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Target } from './target.entity';
import { Vulnerability } from './vulnerability.entity';

@Entity()
export class Scan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  targetId: string;

  @ManyToOne(() => Target, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'targetId' })
  target: Target;

  @Column({ default: 'default' })
  profileId: string;

  @Column({ default: 'PENDING' })
  status: string;

  @OneToMany(() => Vulnerability, (vulnerability) => vulnerability.scan, {
    cascade: true,
  })
  vulnerabilities: Vulnerability[];

  @Column('jsonb', { nullable: true })
  resultSummary: any;

  @CreateDateColumn()
  startedAt: Date;

  @Column({ nullable: true })
  finishedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
