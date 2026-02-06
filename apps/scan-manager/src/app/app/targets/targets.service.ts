import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Target, TargetEnvironment } from '@libs/database';
import { CreateTargetDto } from '@libs/common';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TargetsService {
  private readonly logger = new Logger(TargetsService.name);

  constructor(
    @InjectRepository(Target)
    private readonly targetRepository: Repository<Target>,
    private readonly httpService: HttpService
  ) {}

  async create(userId: string, dto: CreateTargetDto): Promise<Target> {
    const target = this.targetRepository.create({
      ...dto,
      userId,
      verificationToken: uuidv4(),
      isVerified: false,
    });
    return this.targetRepository.save(target);
  }

  async findAll(userId: string): Promise<Target[]> {
    return this.targetRepository.find({ where: { userId } });
  }

  async findOne(id: string, userId: string): Promise<Target> {
    const target = await this.targetRepository.findOne({ where: { id, userId } });
    if (!target) {
      throw new NotFoundException('Target not found');
    }
    return target;
  }

  async remove(id: string, userId: string): Promise<void> {
    const target = await this.findOne(id, userId);
    await this.targetRepository.remove(target);
  }

  async verify(id: string, userId: string): Promise<Target> {
    const target = await this.findOne(id, userId);

    if (target.isVerified) {
      return target;
    }

    const verificationUrl = `${target.url.replace(/\/$/, '')}/.well-known/dast-verify.txt`;

    try {
      this.logger.log(`Verifying target ${target.id} at ${verificationUrl}`);
      const response = await firstValueFrom(this.httpService.get(verificationUrl));

      const content =
        typeof response.data === 'string'
          ? response.data.trim()
          : JSON.stringify(response.data).trim();

      if (content === target.verificationToken) {
        target.isVerified = true;
        return this.targetRepository.save(target);
      } else {
        throw new BadRequestException('Verification token does not match');
      }
    } catch (error) {
      this.logger.error(`Verification failed for target ${target.id}`, error);
      throw new BadRequestException(`Verification failed: ${error.message}`);
    }
  }
}
