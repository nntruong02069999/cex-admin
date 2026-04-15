# Dashboard Currency & Routes Refactoring Design

## Overview

Chuyển đổi đơn vị tiền tệ từ Ấn Độ (₹) sang USDT và di chuyển hardcode routes sang env variables.

## Requirements

- Đổi currency symbol từ ₹ (Rupee) sang USDT
- Đổi date locale từ en-IN sang vi-VN (DD/MM/YYYY)
- Di chuyển hardcoded navigation routes sang .env variables

## Approach

Centralized config file - tạo `src/components/dashboard/config.ts` để tập trung tất cả settings.

## Design

### 1. Config File: `src/components/dashboard/config.ts`

```typescript
export const DASHBOARD_CONFIG = {
  currency: {
    symbol: "USDT",
    locale: "en-US",
  },
  dateFormat: "vi-VN",
  routes: {
    depositList: process.env.REACT_APP_ROUTE_DEPOSIT_LIST || "/list",
    withdrawalList: process.env.REACT_APP_ROUTE_WITHDRAWAL_LIST || "/list",
  },
  queryParams: {
    deposit: "?page=311",
    withdrawal: "?page=313",
  },
};
```

### 2. Currency & Date Format Changes

**TransactionTable.tsx:113**

```typescript
// Before
Tổng: {new Intl.NumberFormat("en-US").format(totalAmount)} ₹

// After
Tổng: {new Intl.NumberFormat(DASHBOARD_CONFIG.currency.locale).format(totalAmount)} {DASHBOARD_CONFIG.currency.symbol}
```

**index.tsx:33-34**

```typescript
// Before
defaultDates[0].toLocaleDateString("en-IN"),
defaultDates[1].toLocaleDateString("en-IN"),

// After
defaultDates[0].toLocaleDateString(DASHBOARD_CONFIG.dateFormat),
defaultDates[1].toLocaleDateString(DASHBOARD_CONFIG.dateFormat),
```

### 3. Route Changes

**index.tsx:197-219**

```typescript
// Before
const handleDepositPendingClick = () => {
  history.push("/list?page=311");
};

// After
const handleDepositPendingClick = () => {
  history.push(
    `${DASHBOARD_CONFIG.routes.depositList}${DASHBOARD_CONFIG.queryParams.deposit}`,
  );
};
```

Áp dụng cho tất cả 6 navigation handlers.

### 4. Environment Variables

Thêm vào các file .env:

```
REACT_APP_ROUTE_DEPOSIT_LIST=/list
REACT_APP_ROUTE_WITHDRAWAL_LIST=/list
```

## Files Modified

- `src/components/dashboard/config.ts` (new)
- `src/components/dashboard/index.tsx`
- `src/components/dashboard/TransactionTable.tsx`
- `.env`, `.env.dev`, `.env.host.dev`, `.env.prod`
