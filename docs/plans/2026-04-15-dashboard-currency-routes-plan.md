# Dashboard Currency & Routes Refactoring Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Chuyển đổi currency từ ₹ sang USDT, đổi date locale từ en-IN sang vi-VN, và di chuyển hardcoded routes sang env variables.

**Architecture:** Tạo centralized config file để tập trung tất cả dashboard settings, sau đó cập nhật các components sử dụng config này.

**Tech Stack:** React, TypeScript, Ant Design, DVA

---

### Task 1: Tạo Dashboard Config File

**Files:**

- Create: `src/components/dashboard/config.ts`

**Step 1: Tạo file config**

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

**Step 2: Verify TypeScript compiles**

Run: `yarn type-check`
Expected: PASS

---

### Task 2: Cập nhật TransactionTable Currency

**Files:**

- Modify: `src/components/dashboard/TransactionTable.tsx:1`

**Step 1: Thêm import**

```typescript
import { DASHBOARD_CONFIG } from "./config";
```

**Step 2: Cập nhật currency display (line 113)**

```typescript
// Before
Tổng: {new Intl.NumberFormat("en-US").format(totalAmount)} ₹

// After
Tổng: {new Intl.NumberFormat(DASHBOARD_CONFIG.currency.locale).format(totalAmount)} {DASHBOARD_CONFIG.currency.symbol}
```

**Step 3: Verify TypeScript compiles**

Run: `yarn type-check`
Expected: PASS

---

### Task 3: Cập nhật Dashboard Date Format & Routes

**Files:**

- Modify: `src/components/dashboard/index.tsx:1`

**Step 1: Thêm import**

```typescript
import { DASHBOARD_CONFIG } from "./config";
```

**Step 2: Cập nhật date format (lines 33-34)**

```typescript
// Before
defaultDates[0].toLocaleDateString("en-IN"),
defaultDates[1].toLocaleDateString("en-IN"),

// After
defaultDates[0].toLocaleDateString(DASHBOARD_CONFIG.dateFormat),
defaultDates[1].toLocaleDateString(DASHBOARD_CONFIG.dateFormat),
```

**Step 3: Cập nhật deposit navigation handlers (lines 197-207)**

```typescript
const handleDepositPendingClick = () => {
  history.push(
    `${DASHBOARD_CONFIG.routes.depositList}${DASHBOARD_CONFIG.queryParams.deposit}`,
  );
};

const handleDepositCompletedClick = () => {
  history.push(
    `${DASHBOARD_CONFIG.routes.depositList}${DASHBOARD_CONFIG.queryParams.deposit}`,
  );
};

const handleDepositFailedClick = () => {
  history.push(
    `${DASHBOARD_CONFIG.routes.depositList}${DASHBOARD_CONFIG.queryParams.deposit}`,
  );
};
```

**Step 4: Cập nhật withdrawal navigation handlers (lines 210-220)**

```typescript
const handleWithdrawalPendingClick = () => {
  history.push(
    `${DASHBOARD_CONFIG.routes.withdrawalList}${DASHBOARD_CONFIG.queryParams.withdrawal}`,
  );
};

const handleWithdrawalCompletedClick = () => {
  history.push(
    `${DASHBOARD_CONFIG.routes.withdrawalList}${DASHBOARD_CONFIG.queryParams.withdrawal}`,
  );
};

const handleWithdrawalFailedClick = () => {
  history.push(
    `${DASHBOARD_CONFIG.routes.withdrawalList}${DASHBOARD_CONFIG.queryParams.withdrawal}`,
  );
};
```

**Step 5: Verify TypeScript compiles**

Run: `yarn type-check`
Expected: PASS

---

### Task 4: Thêm Environment Variables

**Files:**

- Modify: `.env`
- Modify: `.env.dev`
- Modify: `.env.host.dev`
- Modify: `.env.prod`

**Step 1: Thêm vào .env**

```bash
REACT_APP_ROUTE_DEPOSIT_LIST=/list
REACT_APP_ROUTE_WITHDRAWAL_LIST=/list
```

**Step 2: Thêm vào .env.dev**

```bash
REACT_APP_ROUTE_DEPOSIT_LIST=/list
REACT_APP_ROUTE_WITHDRAWAL_LIST=/list
```

**Step 3: Thêm vào .env.host.dev**

```bash
REACT_APP_ROUTE_DEPOSIT_LIST=/list
REACT_APP_ROUTE_WITHDRAWAL_LIST=/list
```

**Step 4: Thêm vào .env.prod**

```bash
REACT_APP_ROUTE_DEPOSIT_LIST=/list
REACT_APP_ROUTE_WITHDRAWAL_LIST=/list
```

---

### Task 5: Verify & Commit

**Step 1: Run type check**

Run: `yarn type-check`
Expected: PASS

**Step 2: Run lint**

Run: `yarn lint`
Expected: PASS (or fix any issues)

**Step 3: Commit changes**

```bash
git add src/components/dashboard/config.ts
git add src/components/dashboard/index.tsx
git add src/components/dashboard/TransactionTable.tsx
git add .env .env.dev .env.host.dev .env.prod
git commit -m "refactor(dashboard): convert currency to USDT and externalize routes

- Add centralized dashboard config
- Change currency from ₹ to USDT
- Change date locale from en-IN to vi-VN
- Move hardcoded routes to env variables"
```
