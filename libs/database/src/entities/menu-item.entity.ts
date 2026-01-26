import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Category } from './category.entity';
import { MenuItemModifier } from './menu-item-modifier.entity';

@Entity('menu_items')
export class MenuItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  categoryId: string;

  @ManyToOne(() => Category, (category) => category.menuItems)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column({ length: 150 })
  name: string;

  @Column({ length: 150, nullable: true })
  nameVi: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  descriptionVi: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ nullable: true })
  image: string;

  @Column({ default: true })
  isAvailable: boolean;

  @Column({ nullable: true })
  preparationTime: number;

  @OneToMany(() => MenuItemModifier, (modifier) => modifier.menuItem)
  modifiers: MenuItemModifier[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
