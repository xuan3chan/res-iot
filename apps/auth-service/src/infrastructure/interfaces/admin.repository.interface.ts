import { Admin } from '@libs/database';

export interface IAdminRepository {
  findByEmail(email: string): Promise<Admin | null>;
  findByUsername(username: string): Promise<Admin | null>;
  create(admin: Partial<Admin>): Promise<Admin>;
  findById(id: string): Promise<Admin | null>;
  findAll(): Promise<Admin[]>;
  update(id: string, admin: Partial<Admin>): Promise<Admin>;
  delete(id: string): Promise<void>;
}
