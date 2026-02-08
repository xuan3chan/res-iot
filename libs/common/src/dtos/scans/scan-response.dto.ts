import { ApiProperty } from '@nestjs/swagger';
import { TargetResponseDto } from './target-response.dto';

export class ScanResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  targetId: string;

  @ApiProperty()
  profileId: string;

  @ApiProperty()
  status: string;

  @ApiProperty({ required: false, type: () => TargetResponseDto })
  target?: TargetResponseDto;

  @ApiProperty({ required: false })
  resultSummary?: any;

  @ApiProperty()
  startedAt: Date;

  @ApiProperty({ required: false })
  finishedAt: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
