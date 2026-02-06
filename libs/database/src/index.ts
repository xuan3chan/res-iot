// Database entities
export * from './entities/user.entity';
export * from './entities/admin.entity';
export * from './entities/category.entity';
export * from './entities/menu-item.entity';
export * from './entities/menu-item-modifier.entity';
export * from './entities/modifier-option.entity';
export * from './entities/table.entity';
export * from './entities/table-session.entity';
export * from './entities/order.entity';
export * from './entities/order-item.entity';
export * from './entities/face-login-attempt.entity';
export * from './entities/target.entity';
export * from './entities/scan-session.entity';
export * from './entities/vulnerability.entity';

// Re-export all entities as array for TypeORM
import { User } from './entities/user.entity';
import { Admin } from './entities/admin.entity';
import { Category } from './entities/category.entity';
import { MenuItem } from './entities/menu-item.entity';
import { MenuItemModifier } from './entities/menu-item-modifier.entity';
import { ModifierOption } from './entities/modifier-option.entity';
import { Table } from './entities/table.entity';
import { TableSession } from './entities/table-session.entity';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { FaceLoginAttempt } from './entities/face-login-attempt.entity';
import { Target } from './entities/target.entity';
import { ScanSession } from './entities/scan-session.entity';
import { Vulnerability } from './entities/vulnerability.entity';

export const entities = [
  User,
  Admin,
  Category,
  MenuItem,
  MenuItemModifier,
  ModifierOption,
  Table,
  TableSession,
  Order,
  OrderItem,
  FaceLoginAttempt,
  Target,
  ScanSession,
  Vulnerability,
];
