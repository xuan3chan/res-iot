import { RegisterAdminDto } from '@libs/common';

export class RegisterAdminCommand {
  constructor(public readonly registerDto: RegisterAdminDto) {}
}
