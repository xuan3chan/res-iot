import { ICommand } from '@nestjs/cqrs';

export class DeleteAdminCommand {
  constructor(public readonly id: string) {}
}
