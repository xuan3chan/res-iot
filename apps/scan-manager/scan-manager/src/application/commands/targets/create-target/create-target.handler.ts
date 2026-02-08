import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateTargetCommand } from './create-target.command';
import { ITargetRepository } from '../../../../domain/interfaces/target.repository.interface';
import { TargetResponseDto } from '@libs/common';
import { Target } from '../../../../domain/entities/target.entity';

@CommandHandler(CreateTargetCommand)
export class CreateTargetHandler implements ICommandHandler<
  CreateTargetCommand,
  TargetResponseDto
> {
  constructor(@Inject('ITargetRepository') private readonly targetRepository: ITargetRepository) {}

  async execute(command: CreateTargetCommand): Promise<TargetResponseDto> {
    const { createTargetDto } = command;
    const target = new Target();
    target.name = createTargetDto.name;
    target.url = createTargetDto.url;
    target.status = 'UNVERIFIED';

    const savedTarget = await this.targetRepository.create(target);
    return this.mapToDto(savedTarget);
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
