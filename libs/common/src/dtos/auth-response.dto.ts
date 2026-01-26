import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from './user-response.dto';

export class AuthResponseDto {
    @ApiProperty()
    accessToken: string;

    @ApiProperty()
    user: UserResponseDto;
}
