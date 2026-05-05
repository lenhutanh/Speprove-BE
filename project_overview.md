# Speprove Backend - Project Overview

## 1. Thông tin chung
- **Tên dự án:** Speprove Backend (`speprove-be`)
- **Phiên bản:** 1.0.0
- **Môi trường:** Node.js
- **Ngôn ngữ:** TypeScript
- **Framework:** Express (v5)
- **Trình quản lý gói:** pnpm (v10.26.2)

## 2. Kiến trúc (Architecture)
Dự án sử dụng kiến trúc **Modular Monolith** kết hợp với **Layered Pattern** và **Dependency Injection**:
- **Layered Pattern**:
  - **Controllers**: Xử lý HTTP request, xác thực đầu vào, trả về response (Giao việc cho Services).
  - **Services**: Xử lý logic nghiệp vụ (Business logic), gọi Repositories và các Service khác.
  - **Repositories**: Tương tác trực tiếp với cơ sở dữ liệu.
- **Dependency Injection (DI)**: Sử dụng thư viện `tsyringe` để inject các dependencies (Services, Repositories).

## 3. Công nghệ cốt lõi (Core Technologies)
- **Cơ sở dữ liệu (Database)**: MongoDB với Mongoose (`mongoose@9.0.2`).
- **Background Jobs (Hàng đợi/Tác vụ nền)**: BullMQ (`bullmq@5.70.1`) và Redis (`ioredis@5.10.0`). Cung cấp UI quản lý thông qua `@bull-board`.
- **Xác thực dữ liệu (Validation)**: Zod (`zod@4.2.1`).
- **Xác thực người dùng**: JWT (`jsonwebtoken`).
- **Mã hóa (Encryption)**: Bcrypt.
- **Dịch vụ bên thứ ba (Third-party integrations)**:
  - Email: Brevo (`@getbrevo/brevo`).
  - Thanh toán: PayOS (`@payos/node`).
  - Storage: Cloudinary.
  - LLM/AI: Groq (`groq-sdk`).
  - Speech Services: Microsoft Cognitive Services Speech SDK, Edge TTS.
- **Bảo mật và tiện ích khác**: Helmet, CORS, Morgan (log), Winston (log), Multer (upload).

## 4. Cấu trúc thư mục (Directory Structure)

### `src/common/`
Chứa các thành phần dùng chung trên toàn bộ ứng dụng:
- `base/`: Chứa các base class như `BaseRepository`, `BaseMapper`.
- `config/`: Cấu hình ứng dụng (Environment, Database, Swagger, v.v.).
- `constants/`: Các hằng số, Enum, Error codes, Injection tokens.
- `errors/`: Custom error classes (ví dụ: `AppError`).
- `interfaces/`, `types/`: Định nghĩa kiểu dữ liệu dùng chung.
- `middlewares/`: Các Express middleware (Auth, Error handling, Validation).
- `utils/`: Các hàm hỗ trợ (Helpers).

### `src/infrastructure/`
Quản lý các kết nối đến hệ thống bên ngoài và cơ sở hạ tầng chung:
- `cache/`, `redis/`: Cơ chế caching.
- `event-bus/`: Hệ thống pub/sub nội bộ.
- `logging/`: Cấu hình logger (Winston).
- `providers/`: Tích hợp service ngoại (LLM, Mail, Speech, Storage, v.v.).
- `queues/`, `workers/`: Thiết lập hàng đợi xử lý nền (BullMQ).
- `rate-limiter/`: Giới hạn yêu cầu HTTP.
- `security/`: Xử lý bảo mật bổ sung.

### `src/modules/`
Đây là nơi chứa các domain/nghiệp vụ chính của dự án. Mỗi module tự đóng gói độc lập bao gồm Controller, Service, Repository, Model, DTO, Mapper, Routes và tập tin DI:
- **Tài khoản và Phân quyền**: `account`, `auth`, `permission`, `permission-group`.
- **Thanh toán & Tín dụng**: `payment`, `credit-package`, `credit-log`.
- **Dữ liệu ôn luyện (IELTS/Speaking)**: `forecast`, `forecast-topic`, `forecast-question`, `topic`, `question`, `question-audio`, `instruction-audio`.
- **Phiên học/Luyện tập**: `session`, `speaking-session`, `attempt`.
- **Nhóm người dùng**: `group`.
- **Âm thanh/Giọng nói**: `speech`, `voice`.
- **Tiện ích khác**: `file`, `mail`.

### `src/routes/`
Tập hợp toàn bộ định tuyến API chính của hệ thống.

## 5. Quy tắc lập trình (Coding Conventions)
1. **Xử lý lỗi (Error Handling)**: Ném ra `AppError` trong Service đối với lỗi nghiệp vụ (Business error). `errorMiddleware` sẽ bắt và định dạng format trả về.
2. **Validation**: Khai báo Zod schemas trong `*.validation.ts`. Dùng `validateMiddleware` trong routes để kiểm tra dữ liệu đầu vào.
3. **Data Transfer (Giao tiếp dữ liệu)**: Dùng DTOs (`*.dto.ts`) cho request và Mappers (`*.mapper.ts`) để map giữa dữ liệu DB và phản hồi API.
4. **Cơ sở dữ liệu**: Kế thừa `BaseRepository`. Sử dụng `session` cho transactions khi cập nhật nhiều document cùng lúc.
5. **Types**: Tận dụng tối đa khả năng type-checking của TypeScript, hạn chế dùng `any`.
6. **Dependency Injection**: Áp dụng decorator (`@singleton()`, `@injectable()`) từ `tsyringe` và đăng ký cụ thể trong các file `*.di.ts`.

## 6. Các tập lệnh NPM (NPM Scripts)
- `pnpm dev`: Khởi động ứng dụng bằng `nodemon` cho quá trình phát triển (auto-reload).
- `pnpm build`: Biên dịch TypeScript ra thư mục `dist`.
- `pnpm start`: Chạy file biên dịch `dist/index.js`.
- `pnpm lint`, `pnpm lint:fix`: Kiểm tra và sửa lỗi cú pháp theo cấu hình ESLint.
- `pnpm format`, `pnpm check`: Định dạng lại source code với Prettier.
- `pnpm db:seed`: Khởi chạy script tạo dữ liệu mẫu (Seeding).
