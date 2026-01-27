import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { DeleteAdminCommand } from './delete-admin.command';
import { IAdminRepository } from '../../../../infrastructure/interfaces/admin.repository.interface';

@CommandHandler(DeleteAdminCommand)
export class DeleteAdminHandler implements ICommandHandler<DeleteAdminCommand, void> {
  constructor(
    @Inject('IAdminRepository')
    private readonly adminRepository: IAdminRepository
  ) {}

  async execute(command: DeleteAdminCommand): Promise<void> {
    const { id } = command;
    const admin = await this.adminRepository.findById(id);
    if (!admin) {
      throw new NotFoundException(`Admin with ID ${id} not found`);
    }
    await this.adminRepository.delete(id);
  }
}
