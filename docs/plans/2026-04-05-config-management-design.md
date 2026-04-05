# Config Management Page - Design

**Date**: 2026-04-05
**Status**: Approved

## Overview

Admin page cho phép xem và chỉnh sửa các cấu hình hệ thống, phân loại theo 4 nhóm: Order, Deposit, Withdraw, KYC.

## API

| Method | Endpoint                           | Mô tả                                                                                  |
| ------ | ---------------------------------- | -------------------------------------------------------------------------------------- |
| GET    | `/api/admin/config/get-all-config` | Lấy toàn bộ config, trả về `{ configOrder, configDeposit, configWithdraw, configKyc }` |
| POST   | `/api/admin/config/edit-config`    | Cập nhật 1 config, body: `{ name, value }`                                             |

### Response Schema (GET)

```json
{
  "code": 0,
  "message": "string",
  "data": {
    "configOrder": [{ "id": 1, "name": "CONFIG_PROFIT", "val": "100", "type": "number", "description": "...", "createdAt": 123, "updatedAt": 456 }],
    "configDeposit": [...],
    "configWithdraw": [...],
    "configKyc": [...]
  }
}
```

### Response Schema (POST)

```json
{ "code": 0, "message": "string" }
```

## Architecture

```
/main/config (route)
  └── ConfigPage (DVA-connected, Tabs layout)
       ├── Tab: Order    → ConfigTable (group="configOrder")
       ├── Tab: Deposit  → ConfigTable (group="configDeposit")
       ├── Tab: Withdraw → ConfigTable (group="configWithdraw")
       └── Tab: KYC      → ConfigTable (group="configKyc")
```

## Files

### Tạo mới

| File                                    | Mô tả                                            |
| --------------------------------------- | ------------------------------------------------ |
| `src/services/configService.ts`         | `getAllConfig()`, `editConfig(name, value)`      |
| `src/models/config.ts`                  | DVA model: namespace `config`                    |
| `src/routes/main/config/index.tsx`      | Route page: Tabs layout, dispatch fetch on mount |
| `src/components/Config/ConfigTable.tsx` | Inline-editable table cho 1 nhóm config          |

### Sửa đổi

| File                       | Thay đổi               |
| -------------------------- | ---------------------- |
| `src/routes/main/index.js` | Thêm route `/config`   |
| `src/index.tsx`            | Register `configModel` |

## Data Flow

1. `ConfigPage` mount → `dispatch('config/fetchAllConfig')`
2. Effect → `configService.getAllConfig()` → API GET
3. Reducer → lưu vào state: `{ order: [], deposit: [], withdraw: [], kyc: [], loading: false }`
4. Tabs render `ConfigTable` cho từng nhóm
5. User edit inline → click Save → `dispatch('config/editConfig', { name, value })`
6. Effect → `configService.editConfig()` → API POST
7. Success → `message.success` → `dispatch('config/fetchAllConfig')` reload

## UI Components

### ConfigTable Columns

| Column      | Width | Content                                                                |
| ----------- | ----- | ---------------------------------------------------------------------- |
| Name        | 200px | `config.name` (monospace style)                                        |
| Description | flex  | `config.description` (tooltip nếu dài)                                 |
| Value       | 200px | **Inline editable**: `<InputNumber>` / `<Switch>` / `<Input>` tùy type |
| Updated At  | 150px | Format `DD/MM/YYYY HH:mm`                                              |
| Action      | 80px  | Save button (disabled khi chưa thay đổi)                               |

### Input mapping theo type

| Config type | Component         | Validation        |
| ----------- | ----------------- | ----------------- |
| `number`    | `<InputNumber />` | Chỉ nhận số       |
| `boolean`   | `<Switch />`      | Toggle true/false |
| `string`    | `<Input />`       | Text input        |

## Error Handling

- API lỗi → `message.error` với message từ backend
- Loading: Table hiển thị `loading` spinner
- Edit thất bại → giữ nguyên giá trị cũ, hiển thị lỗi

## State Shape (DVA Model)

```typescript
interface ConfigState {
  order: ConfigItem[];
  deposit: ConfigItem[];
  withdraw: ConfigItem[];
  kyc: ConfigItem[];
  loading: boolean;
  editing: Record<string, boolean>; // track row đang edit
}

interface ConfigItem {
  id: number;
  name: string | null;
  val: string | null;
  type: string | null;
  description: string | null;
  createdAt: number | null;
  updatedAt: number | null;
}
```

## Effects (DVA)

| Effect           | Mô tả                                          |
| ---------------- | ---------------------------------------------- |
| `fetchAllConfig` | GET all config, lưu vào state theo 4 nhóm      |
| `editConfig`     | POST edit 1 config, reload data nếu thành công |

## Reducers

| Reducer             | Mô tả                                                     |
| ------------------- | --------------------------------------------------------- |
| `setConfigData`     | Lưu data từ API vào state theo nhóm                       |
| `setLoading`        | Toggle loading state                                      |
| `updateConfigValue` | Cập nhật giá trị 1 config trong state (optimistic update) |
