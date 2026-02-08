import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetTargetsQuery } from './get-targets.query';
import { ITargetRepository } from '../../../../domain/interfaces/target.repository.interface';
import { TargetResponseDto } from '@libs/common';
import { Target } from '../../../../domain/entities/target.entity';

@QueryHandler(GetTargetsQuery)
export class GetTargetsHandler implements IQueryHandler<GetTargetsQuery, TargetResponseDto[]> {
  constructor(@Inject('ITargetRepository') private readonly targetRepository: ITargetRepository) {}

  async execute(query: GetTargetsQuery): Promise<TargetResponseDto[]> {
    const targets = await this.targetRepository.findAll();
    return targets.map((target) => this.mapToDto(target));
  }

  private mapToDto(target: Target): TargetResponseDto {
    return {
      id: target.id,
      name: target.name,
      url: target.url,
      status: target.status,
      createdAt: target.createdAt,
      updatedAt: target.updatedAt,
    };
  }
}
