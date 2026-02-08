import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IScanRepository } from '../../domain/interfaces/scan.repository.interface';
import { Scan } from '../../domain/entities/scan.entity';

@Injectable()
export class ScanRepository implements IScanRepository {
  constructor(
    @InjectRepository(Scan)
    private readonly repository: Repository<Scan>
  ) {}

  async create(scan: Scan): Promise<Scan> {
    return this.repository.save(scan);
  }

  async findAll(): Promise<Scan[]> {
    return this.repository.find({ relations: ['vulnerabilities'] });
  }

  async findOne(id: string): Promise<Scan | null> {
    return this.repository.findOne({ where: { id }, relations: ['vulnerabilities'] });
  }

  async update(scan: Scan): Promise<Scan> {
    return this.repository.save(scan);
  }
}
