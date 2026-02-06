# System Architecture & Data Flow

## 1. High-Level Design

```
[ Client / CI-CD ] ---> [ Gateway API ] ---> [ Kafka ]
                               |
                               v
                       [ Scan Manager Service ] <---> [ PostgreSQL ]
                               |
                           (Kafka Topic: scan.trigger)
                               |
                               v
                       [ Scanner Engine (Python) ] ---> [ Target Website ]
```

## 2. Data Flow Chi tiết

### Luồng A: User Thêm & Xác thực Target (Sync via HTTP)

1.  **User** request `POST /targets` tới `gateway-api`.
2.  `gateway-api` forward tới `scan-manager`.
3.  `scan-manager` lưu target vào DB (Status: `UNVERIFIED`) và trả về `verification_token`.
4.  **User** cấu hình DNS/File lên server của họ.
5.  **User** request `POST /targets/:id/verify`.
6.  `scan-manager` thực hiện HTTP Request tới Target để check token. Nếu OK -> Update DB `VERIFIED`.

### Luồng B: Thực hiện Scan (Async via Kafka)

1.  **User** request `POST /scans` (kèm `target_id`, `profile`).
2.  `scan-manager`:
    - Check `auth-service` (nếu cần check quota).
    - Check `target.is_verified`.
    - Tạo bản ghi `ScanHistory` (Status: `QUEUED`).
    - Publish event `scan.created` vào Kafka topic.
3.  `scanner-engine` (Python Consumer):
    - Subscribe topic `scan.created`.
    - Nhận job, cập nhật status -> `RUNNING` (bắn event ngược lại `scan.status`).
    - Gọi subprocess (ZAP CLI / Nuclei) để quét.
    - Parse kết quả quét (JSON) -> Chuẩn hóa data.
    - Publish event `scan.completed` kèm danh sách vulnerabilities vào Kafka.
4.  `scan-manager`:
    - Consume `scan.completed`.
    - Lưu danh sách lỗ hổng vào bảng `Vulnerabilities` (sử dụng `libs/database`).

## 3. Topic Definition (Kafka)

- `scan.cmd.start`: Lệnh bắt đầu quét.
- `scan.event.status_changed`: Cập nhật trạng thái (Queued -> Running -> Completed).
- `scan.event.result_ready`: Kết quả quét thô.
