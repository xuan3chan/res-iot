# Restaurant IoT - Nx Monorepo

IoT Restaurant Ordering System built with Nx monorepo architecture and microservices.

## Project Structure

```
├── apps/
│   ├── auth-service/           # Authentication Service (port 3001)
│   ├── menu-service/           # Menu Management Service (port 3002)
│   ├── order-service/          # Order & Kitchen Service (port 3003)
│   ├── table-service/          # Table Management Service (port 3004)

├── libs/
│   ├── database/               # Shared TypeORM entities
│   ├── common/                 # Shared guards, filters, decorators
│   ├── types/                  # Shared TypeScript types
│   ├── socket-events/          # WebSocket event definitions

├── nx.json                     # Nx workspace configuration
├── tsconfig.base.json          # Base TypeScript configuration
└── package.json                # Root package.json
```

## Prerequisites

- Node.js >= 18.0.0
- Yarn 1.22+
- PostgreSQL

## Getting Started

### Install dependencies

```bash
yarn install
```

### Environment Setup

Create `.env` file in the root:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/restaurant_iot
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1d
NODE_ENV=development
```

### Run microservices

Start all backend services:

```bash
nx run-many --target=serve --projects=auth-service,menu-service,order-service,table-service
```

Or start individual services:

```bash
nx serve auth-service    # Port 3001
nx serve menu-service    # Port 3002
nx serve order-service   # Port 3003
nx serve table-service   # Port 3004
```

## Microservices Architecture

| Service       | Port | Responsibility                    |
| ------------- | ---- | --------------------------------- |
| auth-service  | 3001 | Authentication, JWT, Users        |
| menu-service  | 3002 | Categories, Menu items, Modifiers |
| order-service | 3003 | Orders, Kitchen, WebSocket        |
| table-service | 3004 | Tables, Sessions                  |

## Common Commands

| Command             | Description                   |
| ------------------- | ----------------------------- |
| `nx serve <app>`    | Start dev server for an app   |
| `nx build <app>`    | Build an app for production   |
| `nx test <project>` | Run tests for a project       |
| `nx lint <project>` | Run ESLint for a project      |
| `nx affected:build` | Build only affected projects  |
| `nx affected:test`  | Test only affected projects   |
| `nx graph`          | Show project dependency graph |

## Shared Libraries

| Library               | Description                                 |
| --------------------- | ------------------------------------------- |
| `@libs/database`      | TypeORM entities (User, Order, Table, etc.) |
| `@libs/common`        | Guards, Filters, Decorators                 |
| `@libs/types`         | TypeScript interfaces                       |
| `@libs/socket-events` | WebSocket event definitions                 |

## API Documentation

Each service has Swagger documentation available at:

- Auth: http://localhost:3001/api/auth/docs
- Menu: http://localhost:3002/api/menu/docs
- Order: http://localhost:3003/api/orders/docs
- Table: http://localhost:3004/api/tables/docs

## License

MIT
