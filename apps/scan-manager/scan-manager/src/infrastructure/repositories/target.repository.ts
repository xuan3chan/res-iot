import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ITargetRepository } from '../../domain/interfaces/target.repository.interface';
import { Target } from '../../domain/entities/target.entity';

@Injectable()
export class TargetRepository implements ITargetRepository {
  constructor(
    @InjectRepository(Target)
    private readonly repository: Repository<Target>
  ) {}

  async create(target: Target): Promise<Target> {
    return this.repository.save(target);
  }

  async findAll(): Promise<Target[]> {
    return this.repository.find();
  }

  async findOne(id: string): Promise<Target | null> {
    return this.repository.findOneBy({ id });
  }

  async update(target: Target): Promise<Target> {
    return this.repository.save(target);
  }
}
