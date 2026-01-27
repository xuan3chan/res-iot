import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetAdminQuery } from './get-admin.query';
import { IAdminRepository } from '../../../../infrastructure/interfaces/admin.repository.interface';
import { GetAdminResult } from './get-admin.result';

@QueryHandler(GetAdminQuery)
export class GetAdminHandler implements IQueryHandler<GetAdminQuery, GetAdminResult> {
  constructor(
    @Inject('IAdminRepository')
    private readonly adminRepository: IAdminRepository
  ) {}

  async execute(query: GetAdminQuery): Promise<GetAdminResult> {
    const { id } = query;
    const admin = await this.adminRepository.findById(id);
    if (!admin) {
      throw new NotFoundException(`Admin with ID ${id} not found`);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = admin;
    return result as GetAdminResult;
  }
}
