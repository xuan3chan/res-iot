import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { UpdateAdminCommand } from './update-admin.command';
import { IAdminRepository } from '../../../../infrastructure/interfaces/admin.repository.interface';
import { UpdateAdminResult } from './update-admin.result';
import * as bcrypt from 'bcrypt';

@CommandHandler(UpdateAdminCommand)
export class UpdateAdminHandler implements ICommandHandler<UpdateAdminCommand, UpdateAdminResult> {
  constructor(
    @Inject('IAdminRepository')
    private readonly adminRepository: IAdminRepository
  ) {}

  async execute(command: UpdateAdminCommand): Promise<UpdateAdminResult> {
    const { id, updateAdminDto } = command;
    const admin = await this.adminRepository.findById(id);
    if (!admin) {
      throw new NotFoundException(`Admin with ID ${id} not found`);
    }

    if (updateAdminDto.password) {
      const salt = await bcrypt.genSalt();
      updateAdminDto.password = await bcrypt.hash(updateAdminDto.password, salt);
    }

    const updatedAdmin = await this.adminRepository.update(id, updateAdminDto);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = updatedAdmin;
    return result as UpdateAdminResult;
  }
}
