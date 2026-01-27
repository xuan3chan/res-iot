import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from '@libs/database';
import { IAdminRepository } from '../interfaces/admin.repository.interface';

@Injectable()
export class AdminTypeOrmRepository implements IAdminRepository {
  constructor(
    @InjectRepository(Admin)
    private readonly repository: Repository<Admin>
  ) {}

  async findByEmail(email: string): Promise<Admin | null> {
    return this.repository.findOne({ where: { email } });
  }

  async findByUsername(username: string): Promise<Admin | null> {
    return this.repository.findOne({ where: { username } });
  }

  async create(admin: Partial<Admin>): Promise<Admin> {
    const newAdmin = this.repository.create(admin);
    return this.repository.save(newAdmin);
  }

  async findById(id: string): Promise<Admin | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findAll(): Promise<Admin[]> {
    return this.repository.find();
  }

  async update(id: string, admin: Partial<Admin>): Promise<Admin> {
    await this.repository.update(id, admin);
    const updatedAdmin = await this.findById(id);
    if (!updatedAdmin) {
      throw new Error(`Admin with id ${id} not found`);
    }
    return updatedAdmin;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
