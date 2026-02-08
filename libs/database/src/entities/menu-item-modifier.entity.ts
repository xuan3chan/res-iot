import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { MenuItem } from './menu-item.entity';
import { ModifierOption } from './modifier-option.entity';

@Entity('menu_item_modifiers')
export class MenuItemModifier {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  menuItemId: string;

  @ManyToOne(() => MenuItem, (menuItem) => menuItem.modifiers)
  @JoinColumn({ name: 'menuItemId' })
  menuItem: MenuItem;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 100, nullable: true })
  nameVi: string;

  @Column({ default: false })
  isRequired: boolean;

  @Column({ nullable: true })
  maxSelections: number;

  @OneToMany(() => ModifierOption, (option) => option.modifier)
  options: ModifierOption[];
}
