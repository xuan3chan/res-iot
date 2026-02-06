# Project Overview: DAST Security Platform

## 1. Giới thiệu

Hệ thống DAST (Dynamic Application Security Testing) được xây dựng dưới dạng Microservices trong mô hình Nx Monorepo.
Hệ thống cung cấp khả năng quét lỗ hổng bảo mật tự động cho các ứng dụng web, tích hợp vào quy trình CI/CD.

## 2. Tech Stack & Architecture

Hệ thống kế thừa kiến trúc của `res-iot` hiện tại:

- **Monorepo Tool:** Nx
- **API Gateway:** NestJS (Proxy request, Authentication Guard)
- **Backend Services:**
  - **Auth Service:** NestJS + CQRS Pattern (Đã có sẵn, dùng để quản lý User/API Key).
  - **Scan Manager Service (New):** NestJS. Quản lý Target, Lên lịch quét, Lưu kết quả.
  - **Scanner Worker (New):** Python. Wrapper cho các tool như OWASP ZAP/Nuclei (Tương tự cấu trúc `apps/face-service`).
- **Communication:** Kafka (Event-driven giữa Manager và Worker).
- **Database:** PostgreSQL (Shared library `libs/database`).
- **Containerization:** Docker & Docker Compose.

## 3. Core Modules (Apps)

1.  `apps/gateway-api`: Entry point, xác thực request từ User/CI Pipeline.
2.  `apps/auth-service`: Quản lý User, Role, Permissions.
3.  `apps/scan-manager` (Sẽ tạo): Service chính xử lý nghiệp vụ quét.
4.  `apps/scanner-engine` (Sẽ tạo): Service Python chạy các công cụ quét thực tế.

## 4. Quy tắc nghiệp vụ (Business Rules)

- **Verification:** Target phải được xác thực (DNS/File upload) trước khi `scan-manager` gửi lệnh xuống Kafka.
- **Isolation:** `scanner-engine` chạy trong môi trường cô lập, mỗi lần quét là một process/container riêng biệt nếu có thể.
- **Idempotency:** Các event Kafka phải được xử lý để đảm bảo không quét lặp lại nếu worker restart.
