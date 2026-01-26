// Menu Types

export interface Category {
  id: string;
  name: string;
  nameVi?: string;
  description?: string;
  image?: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  nameVi?: string;
  description?: string;
  descriptionVi?: string;
  price: number;
  image?: string;
  isAvailable: boolean;
  preparationTime?: number; // in minutes
  modifiers?: MenuItemModifier[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MenuItemModifier {
  id: string;
  menuItemId: string;
  name: string;
  nameVi?: string;
  price: number;
  isRequired: boolean;
  maxSelections?: number;
  options: ModifierOption[];
}

export interface ModifierOption {
  id: string;
  modifierId: string;
  name: string;
  nameVi?: string;
  price: number;
  isDefault: boolean;
}

export interface CreateCategoryDto {
  name: string;
  nameVi?: string;
  description?: string;
  image?: string;
  order?: number;
}

export interface UpdateCategoryDto extends Partial<CreateCategoryDto> {
  isActive?: boolean;
}

export interface CreateMenuItemDto {
  categoryId: string;
  name: string;
  nameVi?: string;
  description?: string;
  descriptionVi?: string;
  price: number;
  image?: string;
  preparationTime?: number;
}

export interface UpdateMenuItemDto extends Partial<CreateMenuItemDto> {
  isAvailable?: boolean;
}
