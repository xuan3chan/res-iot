# Database Schema (TypeORM Entities)

Dựa trên cấu trúc `libs/database/src/entities`, chúng ta sẽ thêm các entity sau:

## 1. Entity: `Target`

- File: `libs/database/src/entities/target.entity.ts`
- Fields:
  - `id`: uuid (PK)
  - `userId`: uuid (FK -> User)
  - `url`: varchar
  - `verificationToken`: varchar
  - `isVerified`: boolean (default: false)
  - `environment`: enum (STAGING, PROD)

## 2. Entity: `ScanSession`

- File: `libs/database/src/entities/scan-session.entity.ts`
- Fields:
  - `id`: uuid (PK)
  - `targetId`: uuid (FK -> Target)
  - `status`: enum (QUEUED, RUNNING, COMPLETED, FAILED)
  - `profile`: enum (QUICK, FULL)
  - `startTime`: timestamp
  - `endTime`: timestamp
  - `riskScore`: int

## 3. Entity: `Vulnerability`

- File: `libs/database/src/entities/vulnerability.entity.ts`
- Fields:
  - `id`: uuid (PK)
  - `scanSessionId`: uuid (FK -> ScanSession)
  - `name`: varchar (e.g., 'SQL Injection')
  - `severity`: enum (CRITICAL, HIGH, MEDIUM, LOW)
  - `description`: text
  - `evidence`: jsonb (Lưu request/response gây lỗi)
  - `solution`: text

## 4. Quan hệ (Relations)

- `User` (One) -> (Many) `Target`
- `Target` (One) -> (Many) `ScanSession`
- `ScanSession` (One) -> (Many) `Vulnerability`
