# Restaurant IoT - Architecture Guide

> Tài liệu này dành cho AI agents để hiểu cấu trúc source code và patterns được sử dụng trong project.

## 1. Tổng Quan Project

**Tech Stack:**

- **Monorepo**: Nx
- **Framework**: NestJS
- **Database**: PostgreSQL + TypeORM
- **Messaging**: Kafka
- **Language**: TypeScript

**Mục đích**: Hệ thống IoT cho nhà hàng - quản lý đặt món, bàn, menu, xác thực khuôn mặt.

---

## 2. Cấu Trúc Thư Mục

```
res-iot/
├── apps/                    # Microservices
│   ├── auth-service/        # Port 3001 - Authentication, Users, Face recognition
│   ├── face-service/        # Face recognition processing
│   ├── gateway-api/         # Port 3000 - API Gateway (proxy to services)
│   ├── menu-service/        # Port 3002 - Categories, Menu items
│   ├── order-service/       # Port 3003 - Orders, Kitchen
│   └── table-service/       # Port 3004 - Tables, Sessions
│
├── libs/                    # Shared Libraries
│   ├── api-client/          # HTTP client utilities
│   ├── common/              # Guards, Filters, DTOs, Decorators
│   ├── config/              # Configuration modules
│   ├── database/            # TypeORM entities
│   ├── socket-events/       # WebSocket event definitions
│   └── types/               # Shared TypeScript types
│
└── .agent/                  # Agent documentation & workflows
```

---

## 3. Clean Architecture Pattern

Mỗi microservice tuân theo Clean Architecture với 4 layers:

```
apps/<service>/src/
├── main.ts                  # Entry point
├── app.module.ts            # Root module
│
├── presentation/            # Layer 1: Controllers, HTTP handlers
│   └── controllers/
│       └── <feature>/
│           ├── <feature>.controller.ts
│           └── <feature>.module.ts
│
├── application/             # Layer 2: Use cases, Business logic
│   ├── commands/            # CQRS Commands (mutations)
│   │   └── <feature>/
│   │       └── <action>/
│   │           ├── <action>.command.ts
│   │           └── <action>.handler.ts
│   └── queries/             # CQRS Queries (read-only)
│       └── <feature>/
│           └── <query>/
│               ├── <query>.query.ts
│               └── <query>.handler.ts
│
├── infrastructure/          # Layer 3: External services, DB, Kafka
│   ├── repositories/        # TypeORM implementations
│   ├── interfaces/          # Repository interfaces
│   └── kafka/               # Kafka producers/consumers
│
└── domain/                  # Layer 4: Entities, Value objects (minimal)
```

**Ví dụ auth-service:**

```
auth-service/src/
├── presentation/controllers/auth/auth.controller.ts
├── application/commands/auth/
│   ├── register-admin/
│   │   ├── register-admin.command.ts
│   │   └── register-admin.handler.ts
│   └── login-admin/
│       ├── login-admin.command.ts
│       └── login-admin.handler.ts
├── infrastructure/repositories/
│   ├── admin.repository.ts
│   └── user.repository.ts
└── infrastructure/interfaces/
    ├── admin.repository.interface.ts
    └── user.repository.interface.ts
```

---

## 4. CQRS Pattern

### Commands (Mutations)

```typescript
// <action>.command.ts - Data structure
export class RegisterAdminCommand {
  constructor(
    public readonly email: string,
    public readonly password: string,
    public readonly name: string
  ) {}
}

// <action>.handler.ts - Logic
@CommandHandler(RegisterAdminCommand)
export class RegisterAdminHandler implements ICommandHandler<RegisterAdminCommand> {
  async execute(command: RegisterAdminCommand) {
    // Business logic here
  }
}
```

### Queries (Read-only)

```typescript
// <query>.query.ts
export class FindUserByIdQuery {
  constructor(public readonly id: string) {}
}

// <query>.handler.ts
@QueryHandler(FindUserByIdQuery)
export class FindUserByIdHandler implements IQueryHandler<FindUserByIdQuery> {
  async execute(query: FindUserByIdQuery) {
    return this.repository.findById(query.id);
  }
}
```

---

## 5. Kafka Communication

### Topics (libs/common/src/constants/kafka.constants.ts)

```typescript
KAFKA_TOPICS = {
  AUTH: {
    LOGIN: 'auth.login',
    LOGOUT: 'auth.logout',
    REGISTER: 'auth.register',
  },
  USER: {
    CREATE: 'user.create',
    FIND_ALL: 'user.findAll',
    REGISTER_FACE: 'user.register-face',
    VERIFY_FACE: 'user.verify-face',
  },
};
```

### Gateway → Service Communication

```typescript
// Gateway gửi message
@Post('register')
async register(@Body() dto: RegisterDto) {
    return this.kafkaClient.send(KAFKA_TOPICS.AUTH.REGISTER, dto);
}

// Service nhận message
@MessagePattern(KAFKA_TOPICS.AUTH.REGISTER)
async handleRegister(@Payload() dto: RegisterDto) {
    return this.commandBus.execute(new RegisterCommand(dto));
}
```

---

## 6. Database Entities

**Location**: `libs/database/src/entities/`

| Entity             | Table               | Mô tả                                      |
| ------------------ | ------------------- | ------------------------------------------ |
| `User`             | users               | Nhân viên (waiter, kitchen_staff, manager) |
| `Admin`            | admins              | Admin hệ thống                             |
| `Category`         | categories          | Danh mục menu                              |
| `MenuItem`         | menu_items          | Món ăn                                     |
| `MenuItemModifier` | menu_item_modifiers | Liên kết món với modifier                  |
| `ModifierOption`   | modifier_options    | Tùy chọn modifier (size, topping)          |
| `Order`            | orders              | Đơn hàng                                   |
| `OrderItem`        | order_items         | Chi tiết đơn hàng                          |
| `Table`            | tables              | Bàn                                        |
| `TableSession`     | table_sessions      | Phiên khách ngồi bàn                       |

### Import Entities

```typescript
import { User, Admin, Order } from '@libs/database';
```

---

## 7. Shared Libraries

| Library               | Import                            | Nội dung           |
| --------------------- | --------------------------------- | ------------------ |
| `@libs/database`      | Entities, entities array          | TypeORM entities   |
| `@libs/common`        | DTOs, Guards, Filters, Decorators | Shared utilities   |
| `@libs/types`         | TypeScript interfaces             | Type definitions   |
| `@libs/socket-events` | Event names, payloads             | WebSocket events   |
| `@libs/config`        | Config modules                    | Environment config |

---

## 8. Coding Conventions

### Naming

- **Files**: `kebab-case.ts` (ví dụ: `register-admin.handler.ts`)
- **Classes**: `PascalCase` (ví dụ: `RegisterAdminHandler`)
- **Interfaces**: `I` prefix (ví dụ: `IUserRepository`)
- **DTOs**: `PascalCaseDto` (ví dụ: `RegisterAdminDto`)

### File Placement

- **New Entity** → `libs/database/src/entities/<name>.entity.ts`
- **New DTO** → `libs/common/src/dtos/<name>.dto.ts`
- **New Feature Controller** → `apps/<service>/src/presentation/controllers/<feature>/`
- **New Command** → `apps/<service>/src/application/commands/<domain>/<action>/`

### Module Registration

Khi tạo entity mới:

1. Export từ `libs/database/src/entities/index.ts`
2. Add vào `entities` array trong `libs/database/src/index.ts`
3. Import trong `app.module.ts` của service cần dùng

---

## 9. Quick Commands

```bash
# Start services
yarn start auth-service
yarn start gateway-api

# Build
yarn build auth-service

# Run all services
nx run-many --target=serve --projects=auth-service,menu-service,order-service,table-service

# Generate Nx graph
nx graph
```

---

## 10. Service Ports

| Service       | Port | Swagger          |
| ------------- | ---- | ---------------- |
| gateway-api   | 3000 | /api/docs        |
| auth-service  | 3001 | /api/auth/docs   |
| menu-service  | 3002 | /api/menu/docs   |
| order-service | 3003 | /api/orders/docs |
| table-service | 3004 | /api/tables/docs |
