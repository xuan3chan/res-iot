import { Scan } from '../entities/scan.entity';

export interface IScanRepository {
  create(scan: Scan): Promise<Scan>;
  findAll(): Promise<Scan[]>;
  findOne(id: string): Promise<Scan | null>;
  update(scan: Scan): Promise<Scan>;
}
