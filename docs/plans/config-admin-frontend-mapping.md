# Cấu Hình Hệ Thống - Tài liệu Frontend

## API Endpoint

```
GET /admin/config/get-all-config
```

## Schema Response

Mỗi config item có cấu trúc:

| Field | Type | Mô tả |
|-------|------|-------|
| `id` | `number` | ID cấu hình (khóa chính) |
| `name` | `string \| null` | Tên khóa cấu hình |
| `val` | `string \| null` | Giá trị hiện tại (luôn là string, FE cần parse theo `type`) |
| `type` | `string \| null` | Kiểu dữ liệu: `number`, `boolean`, `string` |
| `description` | `string \| null` | Mô tả hiển thị cho người dùng |
| `createdAt` | `number \| null` | Thời gian tạo (Unix timestamp, ms) |
| `updatedAt` | `number \| null` | Thời gian cập nhật (Unix timestamp, ms) |

---

## 1. Cấu Hình Lệnh Giao Dịch (Order)

| Khóa Cấu Hình | Kiểu | Nhãn Hiển Thị | Mô Tả | Loại Input |
|---------------|------|---------------|-------|------------|
| `CONFIG_PROFIT` | number | Ngưỡng Lợi Nhuận (%) | Ngưỡng lợi nhuận tối thiểu để đóng lệnh tự động | Number Input |

---

## 2. Cấu Hình Nạp Tiền (Deposit)

| Khóa Cấu Hình | Kiểu | Nhãn Hiển Thị | Mô Tả | Loại Input |
|---------------|------|---------------|-------|------------|
| `MIN_DEPOSIT_AMOUNT` | number | Số Tiền Nạp Tối Thiểu | Số tiền nạp tối thiểu cho mỗi giao dịch | Number Input |
| `TELEGRAM_NOTIFICATION_DEPOSIT_BOT_API_KEY` | string | API Key Bot Telegram (Nạp Tiền) | Khóa API của Telegram Bot dùng để gửi thông báo nạp tiền | Password Input |
| `TELEGRAM_NOTIFICATION_DEPOSIT_CHAT_ID` | string | Chat ID Telegram (Nạp Tiền) | ID của nhóm/cá nhân Telegram nhận thông báo nạp tiền | Text Input |

---

## 3. Cấu Hình Rút Tiền (Withdraw)

| Khóa Cấu Hình | Kiểu | Nhãn Hiển Thị | Mô Tả | Loại Input |
|---------------|------|---------------|-------|------------|
| `WITHDRAW_FEE` | number | Phí Rút Tiền (%) | Phần trăm phí áp dụng cho mỗi lệnh rút tiền | Number Input |
| `MAX_DAILY_WITHDRAW` | number | Hạn Mức Rút Tiền Tối Đa / Ngày | Tổng số tiền rút tối đa mà người dùng có thể thực hiện trong một ngày | Number Input |
| `MAX_DAILY_INTERNAL_TRANSFER` | number | Hạn Mức Chuyển Khoản Nội Bộ Tối Đa / Ngày | Tổng số tiền chuyển khoản nội bộ tối đa trong một ngày | Number Input |
| `TELEGRAM_NOTIFICATION_WITHDRAW_BOT_API_KEY` | string | API Key Bot Telegram (Rút Tiền) | Khóa API của Telegram Bot dùng để gửi thông báo rút tiền | Password Input |
| `TELEGRAM_NOTIFICATION_WITHDRAW_CHAT_ID` | string | Chat ID Telegram (Rút Tiền) | ID của nhóm/cá nhân Telegram nhận thông báo rút tiền | Text Input |

---

## 4. Cấu Hình Xác Minh Danh Tính (KYC)

| Khóa Cấu Hình | Kiểu | Nhãn Hiển Thị | Mô Tả | Loại Input |
|---------------|------|---------------|-------|------------|
| `TELEGRAM_NOTIFICATION_KYC_BOT_API_KEY` | string | API Key Bot Telegram (KYC) | Khóa API của Telegram Bot dùng để gửi thông báo xác minh danh tính | Password Input |
| `TELEGRAM_NOTIFICATION_KYC_CHAT_ID` | string | Chat ID Telegram (KYC) | ID của nhóm/cá nhân Telegram nhận thông báo xác minh danh tính | Text Input |

---

## Gợi Ý Giao Diện Bảng Hiển Thị

```
┌─────────────────────────────────────────────────────────────────────────┐
│ ⚙️ Cấu Hình Lệnh Giao Dịch                                              │
├──────────────────────┬──────────┬───────────────────────┬───────────────┤
│ Tên Cấu Hình         │ Kiểu     │ Giá Trị Hiện Tại      │ Thao Tác      │
├──────────────────────┼──────────┼───────────────────────┼───────────────┤
│ Ngưỡng Lợi Nhuận (%) │ number   │ [______]              │ [Lưu]         │
│   CONFIG_PROFIT      │          │                       │               │
└──────────────────────┴──────────┴───────────────────────┴───────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ 💰 Cấu Hình Nạp Tiền                                                    │
├──────────────────────┬──────────┬───────────────────────┬───────────────┤
│ Tên Cấu Hình         │ Kiểu     │ Giá Trị Hiện Tại      │ Thao Tác      │
├──────────────────────┼──────────┼───────────────────────┼───────────────┤
│ Số Tiền Nạp Tối Thiểu│ number   │ [______]              │ [Lưu]         │
│   MIN_DEPOSIT_AMOUNT │          │                       │               │
├──────────────────────┼──────────┼───────────────────────┼───────────────┤
│ API Key Bot Telegram │ string   │ [••••••••]            │ [Lưu]         │
│   (Nạp Tiền)         │          │                       │               │
├──────────────────────┼──────────┼───────────────────────┼───────────────┤
│ Chat ID Telegram     │ string   │ [______]              │ [Lưu]         │
│   (Nạp Tiền)         │          │                       │               │
└──────────────────────┴──────────┴───────────────────────┴───────────────┘

(Tương tự cho Cấu Hình Rút Tiền và Cấu Hình KYC)
```

---

## Hướng Dẫn Triển Khai Frontend

### 1. Parse Giá Trị

```typescript
const parseValue = (val: string | null, type: string | null) => {
  if (!val) return '';
  switch (type) {
    case 'number': return Number(val);
    case 'boolean': return val === 'true';
    default: return val;
  }
}
```

### 2. Thứ Tự Ưu Tiên Hiển Thị Nhãn

1. Ưu tiên dùng `description` từ API (nếu có)
2. Fallback: dùng bảng mapping ở trên
3. Fallback cuối: hiển thị raw `name`

### 3. Ánh Xạ Loại Input

| `type` từ Config | Loại Input FE | Ghi Chú |
|------------------|---------------|---------|
| `number` | `<input type="number" />` | Cho phép nhập số |
| `boolean` | `<Switch />` hoặc `<Select>` | true/false |
| `string` (chứa `API_KEY`) | `<input type="password" />` | Có nút ẩn/hiện mật khẩu |
| `string` (khác) | `<input type="text" />` | Nhập văn bản thông thường |

### 4. Tổ Chức Tabs/Sections

- Dùng **Tabs** hoặc **Collapsible Sections** cho 4 nhóm:
  - Cấu Hình Lệnh Giao Dịch
  - Cấu Hình Nạp Tiền
  - Cấu Hình Rút Tiền
  - Cấu Hình Xác Minh Danh Tính
- Mỗi nhóm là 1 bảng riêng với tiêu đề rõ ràng

### 5. Luồng Lưu Dữ Liệu

- Mỗi dòng có nút **Lưu** riêng hoặc dùng **Lưu Tất Cả** cho toàn nhóm
- Gọi API update tương ứng (cần tạo thêm endpoint update nếu chưa có)
