# Implementation Tasks

Hiện tại đã có `auth-service` và base project. Các bước tiếp theo để hoàn thiện DAST:

## Phase 1: Infrastructure & Database (libs)

- [ ] **Database:** Tạo các file Entity mới (`target.entity.ts`, `scan-session.entity.ts`, `vulnerability.entity.ts`) trong `libs/database`.
- [ ] **DTOs:** Định nghĩa DTO request/response trong `libs/common/src/dtos` (tương tự `create-user.dto.ts`).
  - `create-target.dto.ts`
  - `trigger-scan.dto.ts`

## Phase 2: Backend Services (NestJS)

- [ ] **Generate App:** Chạy lệnh `nx g @nx/nest:app scan-manager`.
- [ ] **Controller:** Tạo `ScanController` và `TargetController`.
- [ ] **Service:** Implement `TargetService` (CRUD + Verification Logic).
- [ ] **Kafka Producer:** Cấu hình Kafka Client trong `scan-manager` để bắn message scan.

## Phase 3: Scanner Engine (Python)

- [ ] **Generate App:** Tạo folder `apps/scanner-engine` (Clone cấu trúc từ `apps/face-service`).
- [ ] **Kafka Consumer:** Viết script Python (`main.py`) sử dụng thư viện `kafka-python` hoặc `confluent-kafka` để lắng nghe lệnh quét.
- [ ] **Tool Integration:**
  - Cài đặt OWASP ZAP hoặc Nuclei trong Dockerfile của service này.
  - Viết hàm wrapper để gọi tool bằng `subprocess`.
  - Viết hàm parser để đọc file JSON report từ tool và gửi về Kafka.

## Phase 4: Integration

- [ ] **Gateway:** Khai báo route mới trong `apps/gateway-api` để forward request tới `scan-manager`.
- [ ] **Auth:** Áp dụng `JwtAuthGuard` (đã có trong `libs/common`) cho các API tạo scan.
