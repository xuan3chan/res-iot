import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { MenuItemModifier } from './menu-item-modifier.entity';

@Entity('modifier_options')
export class ModifierOption {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  modifierId: string;

  @ManyToOne(() => MenuItemModifier, (modifier) => modifier.options)
  @JoinColumn({ name: 'modifierId' })
  modifier: MenuItemModifier;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 100, nullable: true })
  nameVi: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;

  @Column({ default: false })
  isDefault: boolean;
}
