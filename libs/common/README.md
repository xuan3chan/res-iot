# Common Library Structure

This library contains shared code used across all microservices.

## Directory Structure

```
libs/common/src/
├── constants/          # Shared constants (Kafka topics, etc.)
├── decorators/         # Custom decorators
├── dtos/              # Data Transfer Objects
├── filters/           # Exception filters
├── guards/            # Auth guards
├── interceptors/      # Request/Response interceptors
├── interfaces/        # Shared interfaces (currently empty - service-specific interfaces stay in services)
└── types/             # Shared TypeScript types
    └── face-auth.types.ts  # Face authentication result types
```

## Usage

### Importing from Common Library

```typescript
// Import DTOs
import { FaceLoginDto, CreateUserDto } from '@libs/common';

// Import Constants
import { KAFKA_TOPICS } from '@libs/common';

// Import Types
import { FaceLoginResult, VerifyWithLivenessResult } from '@libs/common';
```

## Guidelines

### What Goes in Common?

✅ **Should be in common:**

- DTOs used across multiple services
- Kafka topic constants
- Shared result/response types
- Cross-service interfaces
- Shared decorators, guards, filters

❌ **Should NOT be in common:**

- Service-specific repository interfaces
- Service-specific business logic
- Database entities (these belong in `libs/database`)

### Adding New Shared Code

1. **DTOs**: Add to `dtos/` directory
2. **Types**: Add to `types/` directory
3. **Constants**: Add to `constants/` directory
4. **Export**: Update the respective `index.ts` file
