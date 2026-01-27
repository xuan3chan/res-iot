import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { KAFKA_TOPICS } from '@libs/common';
import { LoginAdminCommand } from '../../application/commands/auth/login-admin/login-admin.command';
import { LoginUserCommand } from '../../application/commands/auth/login-user/login-user.command';
import { RegisterUserCommand } from '../../application/commands/auth/register-user/register-user.command';
import { CreateUserCommand } from '../../application/commands/user/create-user/create-user.command';
import { UpdateUserCommand } from '../../application/commands/user/update-user/update-user.command';
import { DeleteUserCommand } from '../../application/commands/user/delete-user/delete-user.command';
import { GetUserQuery } from '../../application/queries/user/get-user/get-user.query';
import { GetUsersQuery } from '../../application/queries/user/get-users/get-users.query';
import { RegisterFaceCommand } from '../../application/commands/face/register-face/register-face.command';
import { VerifyFaceCommand } from '../../application/commands/face/verify-face/verify-face.command';
import { GetAdminQuery } from '../../application/queries/admin/get-admin/get-admin.query';
import { GetAdminsQuery } from '../../application/queries/admin/get-admins/get-admins.query';
import { CreateAdminCommand } from '../../application/commands/admin/create-admin/create-admin.command';
import { UpdateAdminCommand } from '../../application/commands/admin/update-admin/update-admin.command';
import { DeleteAdminCommand } from '../../application/commands/admin/delete-admin/delete-admin.command';
import { RegisterAdminCommand } from '../../application/commands/auth/register-admin/register-admin.command';

@Controller()
export class KafkaController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  // Auth handlers
  @MessagePattern(KAFKA_TOPICS.AUTH.LOGIN)
  async handleLogin(@Payload() data: { email: string; password: string }) {
    try {
      return await this.commandBus.execute(new LoginAdminCommand(data));
    } catch (error) {
      return { error: error.message, statusCode: error.status || 500 };
    }
  }

  @MessagePattern(KAFKA_TOPICS.AUTH.REGISTER)
  async handleRegister(@Payload() data: any) {
    try {
      return await this.commandBus.execute(new RegisterAdminCommand(data));
    } catch (error) {
      return { error: error.message, statusCode: error.status || 500 };
    }
  }

  @MessagePattern(KAFKA_TOPICS.AUTH.USER_LOGIN)
  async handleUserLogin(@Payload() data: any) {
    try {
      return await this.commandBus.execute(new LoginUserCommand(data));
    } catch (error) {
      return { error: error.message, statusCode: error.status || 500 };
    }
  }

  @MessagePattern(KAFKA_TOPICS.AUTH.USER_REGISTER)
  async handleUserRegister(@Payload() data: any) {
    try {
      return await this.commandBus.execute(new RegisterUserCommand(data));
    } catch (error) {
      return { error: error.message, statusCode: error.status || 500 };
    }
  }

  @MessagePattern(KAFKA_TOPICS.AUTH.LOGOUT)
  async handleLogout() {
    return { message: 'Logged out successfully' };
  }

  // User handlers
  @MessagePattern(KAFKA_TOPICS.USER.CREATE)
  async handleCreateUser(@Payload() data: any) {
    try {
      return await this.commandBus.execute(new CreateUserCommand(data));
    } catch (error) {
      return { error: error.message, statusCode: error.status || 500 };
    }
  }

  @MessagePattern(KAFKA_TOPICS.USER.FIND_ALL)
  async handleFindAllUsers() {
    try {
      return await this.queryBus.execute(new GetUsersQuery());
    } catch (error) {
      return { error: error.message, statusCode: error.status || 500 };
    }
  }

  @MessagePattern(KAFKA_TOPICS.USER.FIND_ONE)
  async handleFindOneUser(@Payload() data: { id: string }) {
    try {
      return await this.queryBus.execute(new GetUserQuery(data.id));
    } catch (error) {
      return { error: error.message, statusCode: error.status || 500 };
    }
  }

  @MessagePattern(KAFKA_TOPICS.USER.UPDATE)
  async handleUpdateUser(@Payload() data: { id: string; [key: string]: any }) {
    try {
      const { id, ...updateData } = data;
      return await this.commandBus.execute(new UpdateUserCommand(id, updateData));
    } catch (error) {
      return { error: error.message, statusCode: error.status || 500 };
    }
  }

  @MessagePattern(KAFKA_TOPICS.USER.DELETE)
  async handleDeleteUser(@Payload() data: { id: string }) {
    try {
      await this.commandBus.execute(new DeleteUserCommand(data.id));
      return { message: 'User deleted successfully' };
    } catch (error) {
      return { error: error.message, statusCode: error.status || 500 };
    }
  }

  @MessagePattern(KAFKA_TOPICS.USER.REGISTER_FACE)
  async handleRegisterFace(@Payload() data: { id: string; file: any }) {
    try {
      return await this.commandBus.execute(new RegisterFaceCommand(data.id, data.file));
    } catch (error) {
      return { error: error.message, statusCode: error.status || 500 };
    }
  }

  @MessagePattern(KAFKA_TOPICS.USER.VERIFY_FACE)
  async handleVerifyFace(@Payload() data: { file: any }) {
    try {
      return await this.commandBus.execute(new VerifyFaceCommand(data.file));
    } catch (error) {
      return { error: error.message, statusCode: error.status || 500 };
    }
  }

  // Admin handlers
  @MessagePattern(KAFKA_TOPICS.ADMIN.CREATE)
  async handleCreateAdmin(@Payload() data: any) {
    try {
      return await this.commandBus.execute(new CreateAdminCommand(data));
    } catch (error) {
      return { error: error.message, statusCode: error.status || 500 };
    }
  }

  @MessagePattern(KAFKA_TOPICS.ADMIN.FIND_ALL)
  async handleFindAllAdmins() {
    try {
      return await this.queryBus.execute(new GetAdminsQuery());
    } catch (error) {
      return { error: error.message, statusCode: error.status || 500 };
    }
  }

  @MessagePattern(KAFKA_TOPICS.ADMIN.FIND_ONE)
  async handleFindOneAdmin(@Payload() data: { id: string }) {
    try {
      return await this.queryBus.execute(new GetAdminQuery(data.id));
    } catch (error) {
      return { error: error.message, statusCode: error.status || 500 };
    }
  }

  @MessagePattern(KAFKA_TOPICS.ADMIN.UPDATE)
  async handleUpdateAdmin(@Payload() data: { id: string; [key: string]: any }) {
    try {
      const { id, ...updateData } = data;
      return await this.commandBus.execute(new UpdateAdminCommand(id, updateData));
    } catch (error) {
      return { error: error.message, statusCode: error.status || 500 };
    }
  }

  @MessagePattern(KAFKA_TOPICS.ADMIN.DELETE)
  async handleDeleteAdmin(@Payload() data: { id: string }) {
    try {
      await this.commandBus.execute(new DeleteAdminCommand(data.id));
      return { message: 'Admin deleted successfully' };
    } catch (error) {
      return { error: error.message, statusCode: error.status || 500 };
    }
  }
}
