import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { KAFKA_TOPICS } from '@libs/common';

import { LoginCommand } from '../../application/commands/auth/login/login.command';
import { CreateUserCommand } from '../../application/commands/user/create-user/create-user.command';
import { UpdateUserCommand } from '../../application/commands/user/update-user/update-user.command';
import { DeleteUserCommand } from '../../application/commands/user/delete-user/delete-user.command';
import { GetUserQuery } from '../../application/queries/user/get-user/get-user.query';
import { GetUsersQuery } from '../../application/queries/user/get-users/get-users.query';
import { RegisterFaceCommand } from '../../application/commands/face/register-face/register-face.command';
import { VerifyFaceCommand } from '../../application/commands/face/verify-face/verify-face.command';

@Controller()
export class KafkaController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
    ) { }

    // Auth handlers
    @MessagePattern(KAFKA_TOPICS.AUTH.LOGIN)
    async handleLogin(@Payload() data: { email: string; password: string }) {
        try {
            return await this.commandBus.execute(new LoginCommand(data));
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
}
