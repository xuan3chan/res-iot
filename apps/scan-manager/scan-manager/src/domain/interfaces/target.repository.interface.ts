import { Target } from '../entities/target.entity';

export interface ITargetRepository {
  create(target: Target): Promise<Target>;
  findAll(): Promise<Target[]>;
  findOne(id: string): Promise<Target | null>;
  update(target: Target): Promise<Target>;
}
