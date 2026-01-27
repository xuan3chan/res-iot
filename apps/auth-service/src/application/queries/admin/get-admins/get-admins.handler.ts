import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetAdminsQuery } from './get-admins.query';
import { IAdminRepository } from '../../../../infrastructure/interfaces/admin.repository.interface';
import { GetAdminsResult } from './get-admins.result';
import { AdminResponseDto } from '@libs/common';

@QueryHandler(GetAdminsQuery)
export class GetAdminsHandler implements IQueryHandler<GetAdminsQuery, GetAdminsResult> {
  constructor(
    @Inject('IAdminRepository')
    private readonly adminRepository: IAdminRepository
  ) {}

  async execute(): Promise<GetAdminsResult> {
    const admins = await this.adminRepository.findAll();
    return admins.map((admin) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = admin;
      return result as AdminResponseDto;
    });
  }
}
