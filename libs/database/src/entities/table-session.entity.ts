import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Table } from './table.entity';

@Entity('table_sessions')
export class TableSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  tableId: string;

  @ManyToOne(() => Table, (table) => table.sessions)
  @JoinColumn({ name: 'tableId' })
  table: Table;

  @Column({ unique: true })
  token: string;

  @CreateDateColumn()
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  endedAt: Date;

  @Column({ default: true })
  isActive: boolean;
}
