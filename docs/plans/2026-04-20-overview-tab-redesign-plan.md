# Customer OverviewTab Redesign — Implementation Plan

> **Version:** 1.0
> **Date:** 2026-04-20
> **Design doc:** [2026-04-20-overview-tab-redesign-design.md](./2026-04-20-overview-tab-redesign-design.md)
> **Total effort:** ~5 giờ

Plan chia thành 8 bước tuần tự. Mỗi bước có review checkpoint — xác nhận build/lint sạch trước khi qua bước kế tiếp. Không viết test mới (theo convention project).

---

## Step 0 — Pre-flight checks (~10 phút)

### 0.1 Xác nhận không còn import cũ ở ngoài OverviewTab

Search toàn repo:

- `CustomerInfo` (file `OverviewTab/CustomerInfo.tsx`)
- `FinancialOverview` (file `OverviewTab/FinancialOverview.tsx`)

Expected: chỉ được import trong `src/components/customer/OverviewTab/index.tsx`. Nếu có nơi khác → dừng, confirm với user trước khi tiếp tục.

### 0.2 Xác nhận `refetch` từ `useCustomerData` stable

Đọc `src/components/customer/hooks/useCustomerData.ts`:
- Nếu `refetch` đã bọc `useCallback` → OK.
- Nếu chưa → bọc `useCallback(refetch, [customerId])` trong hook đó.

### 0.3 Verify TwoFADisplay path
Xác nhận `@src/components/TwoFADisplay` tồn tại (hiện `CustomerInfo.tsx` đang import `../../TwoFADisplay`). Giữ cùng path khi di chuyển sang `QuickActions`.

**Checkpoint:** Không có breaking import, `refetch` stable, path `TwoFADisplay` rõ.

---

## Step 1 — `SectionBlock` dùng chung (~45 phút)

### 1.1 Tạo folder

```
src/components/customer/OverviewTab/SectionBlock/
├── index.tsx
└── SectionBlock.less
```

### 1.2 `SectionBlock/index.tsx`

```tsx
import React, { memo } from "react";
import { Skeleton } from "antd";
import "./SectionBlock.less";

export type SectionAccent = "primary" | "success" | "gold" | "purple";

export interface SectionBlockProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  accent?: SectionAccent;
  extra?: React.ReactNode;
  loading?: boolean;
  className?: string;
  children: React.ReactNode;
}

const SectionBlockComponent: React.FC<SectionBlockProps> = ({
  icon,
  title,
  subtitle,
  accent = "primary",
  extra,
  loading = false,
  className,
  children,
}) => {
  return (
    <section
      className={`section-block section-block--${accent}${
        className ? ` ${className}` : ""
      }`}
    >
      <header className="section-block__header">
        <div className="section-block__icon-wrap">{icon}</div>
        <div className="section-block__heading">
          <h3 className="section-block__title">{title}</h3>
          {subtitle && (
            <p className="section-block__subtitle">{subtitle}</p>
          )}
        </div>
        {extra && <div className="section-block__extra">{extra}</div>}
      </header>
      <div className="section-block__body">
        {loading ? <Skeleton active paragraph={{ rows: 3 }} /> : children}
      </div>
    </section>
  );
};

export const SectionBlock = memo(SectionBlockComponent);

export interface SectionSkeletonProps {
  title?: string;
  rows?: number;
}

export const SectionSkeleton: React.FC<SectionSkeletonProps> = ({
  title,
  rows = 4,
}) => (
  <section className="section-block section-block--primary section-block--skeleton">
    <header className="section-block__header">
      <div className="section-block__icon-wrap" />
      <div className="section-block__heading">
        <h3 className="section-block__title">{title || "\u00a0"}</h3>
      </div>
    </header>
    <div className="section-block__body">
      <Skeleton active paragraph={{ rows }} />
    </div>
  </section>
);

export default SectionBlock;
```

### 1.3 `SectionBlock/SectionBlock.less`

```less
@import '~antd/lib/style/themes/default.less';

.section-block {
  background: @component-background;
  border: 1px solid @border-color-split;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  padding: 20px;

  + .section-block {
    margin-top: 20px;
  }

  &__header {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 16px;
  }

  &__icon-wrap {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    flex-shrink: 0;
  }

  &__heading {
    flex: 1;
    min-width: 0;
  }

  &__title {
    font-size: 15px;
    font-weight: 600;
    color: @heading-color;
    margin: 0;
    line-height: 1.4;
  }

  &__subtitle {
    font-size: 12px;
    color: @text-color-secondary;
    margin: 2px 0 0;
  }

  &__extra {
    flex-shrink: 0;
  }

  &__body {
    font-variant-numeric: tabular-nums;
  }

  // Accents
  &--primary &__icon-wrap {
    background: fade(@primary-color, 10%);
    color: @primary-color;
  }
  &--success &__icon-wrap {
    background: fade(@success-color, 10%);
    color: @success-color;
  }
  &--gold &__icon-wrap {
    background: fade(@gold-6, 12%);
    color: @gold-6;
  }
  &--purple &__icon-wrap {
    background: fade(@purple-6, 10%);
    color: @purple-6;
  }
}

@media (max-width: @screen-md) {
  .section-block {
    padding: 16px;
    + .section-block { margin-top: 16px; }
  }
}
```

**Checkpoint:** `SectionBlock` render độc lập được; TypeScript/ESLint sạch.

---

## Step 2 — `AccountInfoSection` (~30 phút)

### 2.1 Tạo file

```
src/components/customer/OverviewTab/AccountInfoSection/
├── index.tsx
└── AccountInfoSection.less
```

### 2.2 `AccountInfoSection/index.tsx`

```tsx
import React, { memo } from "react";
import { UserOutlined } from "@ant-design/icons";
import { SectionBlock } from "../SectionBlock";
import { Customer, Inviter } from "../../types/customer.types";
import { formatDate } from "../../utils/formatters";
import "./AccountInfoSection.less";

interface AccountInfoSectionProps {
  customer: Pick<Customer, "nickname" | "inviteCode" | "createdAt">;
  inviter?: Inviter;
}

const AccountInfoSectionComponent: React.FC<AccountInfoSectionProps> = ({
  customer,
  inviter,
}) => {
  const fields = [
    { label: "Nickname", value: customer.nickname, mono: false },
    { label: "Mã mời", value: customer.inviteCode, mono: true },
    { label: "Người mời", value: inviter?.nickname || "Chưa có", mono: false },
    {
      label: "Ngày tham gia",
      value: formatDate(customer.createdAt, "DISPLAY_DATE"),
      mono: false,
    },
  ];

  return (
    <SectionBlock
      icon={<UserOutlined />}
      title="Thông tin tài khoản"
      subtitle="Định danh khách hàng trong hệ thống"
      accent="primary"
    >
      <div className="account-info-grid">
        {fields.map((f) => (
          <div key={f.label} className="account-info-field">
            <span className="account-info-field__label">{f.label}</span>
            <span
              className={`account-info-field__value${
                f.mono ? " account-info-field__value--mono" : ""
              }`}
            >
              {f.value}
            </span>
          </div>
        ))}
      </div>
    </SectionBlock>
  );
};

export default memo(AccountInfoSectionComponent);
```

### 2.3 `AccountInfoSection.less`

```less
@import '~antd/lib/style/themes/default.less';

.account-info-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px 32px;
}

.account-info-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;

  &__label {
    font-size: 11px;
    font-weight: 500;
    color: @text-color-secondary;
    text-transform: uppercase;
    letter-spacing: 0.4px;
  }

  &__value {
    font-size: 14px;
    font-weight: 600;
    color: @text-color;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    &--mono {
      font-family: 'SFMono-Regular', 'Consolas', monospace;
      font-size: 13px;
      background: @background-color-light;
      padding: 3px 8px;
      border-radius: 4px;
      align-self: flex-start;
      font-weight: 500;
    }
  }
}

@media (max-width: @screen-sm) {
  .account-info-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}
```

**Checkpoint:** Section render 4 field 2×2, mã mời hiển thị mono chip.

---

## Step 3 — `WalletSection` (~50 phút)

### 3.1 Tạo folder

```
src/components/customer/OverviewTab/WalletSection/
├── index.tsx
├── UsdtBlock.tsx
├── RewardsBlock.tsx
└── WalletSection.less
```

### 3.2 `WalletSection/index.tsx`

```tsx
import React, { memo } from "react";
import { CustomerMoney } from "../../types/customer.types";
import UsdtBlock from "./UsdtBlock";
import RewardsBlock from "./RewardsBlock";
import "./WalletSection.less";

interface WalletSectionProps {
  customerMoney: CustomerMoney;
}

const WalletSection: React.FC<WalletSectionProps> = ({ customerMoney }) => (
  <>
    <UsdtBlock
      balanceUSDT={customerMoney.balanceUSDT}
      totalDeposit={customerMoney.totalDeposit}
      totalWithdraw={customerMoney.totalWithdraw}
      usdtAddress={customerMoney.usdtAddress}
    />
    <RewardsBlock
      totalCommission={customerMoney.totalCommission}
      totalRewardFirstDeposit={customerMoney.totalRewardFirstDeposit}
      totalRewardMembersFirstDeposit={
        customerMoney.totalRewardMembersFirstDeposit
      }
      totalDailyQuestRewards={customerMoney.totalDailyQuestRewards}
      totalRefundTradeAmount={customerMoney.totalRefundTradeAmount}
    />
  </>
);

export default memo(WalletSection);
```

### 3.3 `UsdtBlock.tsx`

```tsx
import React, { memo, useCallback } from "react";
import { Button, message, Typography } from "antd";
import {
  WalletOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  CopyOutlined,
} from "@ant-design/icons";
import { SectionBlock } from "../SectionBlock";
import { formatCurrency } from "../../utils/formatters";
import { truncateAddress, copyToClipboard } from "../../utils/helpers";

const { Text } = Typography;

interface UsdtBlockProps {
  balanceUSDT: number;
  totalDeposit: number;
  totalWithdraw: number;
  usdtAddress?: string;
}

const USDT_METRICS = [
  { key: "balance", label: "Số dư USDT", icon: null },
  { key: "deposit", label: "Tổng nạp", icon: <ArrowUpOutlined /> },
  { key: "withdraw", label: "Tổng rút", icon: <ArrowDownOutlined /> },
] as const;

const UsdtBlock: React.FC<UsdtBlockProps> = ({
  balanceUSDT,
  totalDeposit,
  totalWithdraw,
  usdtAddress,
}) => {
  const handleCopy = useCallback(async () => {
    if (!usdtAddress) return;
    const ok = await copyToClipboard(usdtAddress);
    if (ok) message.success("Đã sao chép địa chỉ USDT");
    else message.error("Không thể sao chép địa chỉ");
  }, [usdtAddress]);

  const values: Record<string, number> = {
    balance: balanceUSDT,
    deposit: totalDeposit,
    withdraw: totalWithdraw,
  };

  return (
    <SectionBlock
      icon={<WalletOutlined />}
      title="Ví USDT"
      subtitle="Dòng tiền nạp/rút chính"
      accent="success"
    >
      <div className="usdt-metrics">
        {USDT_METRICS.map((m) => (
          <div key={m.key} className="usdt-metric">
            <div className="usdt-metric__label">
              {m.icon}
              <span>{m.label}</span>
            </div>
            <div className="usdt-metric__value">
              {formatCurrency(values[m.key], "USDT")}
            </div>
          </div>
        ))}
      </div>

      {usdtAddress && (
        <div className="usdt-address">
          <span className="usdt-address__label">Địa chỉ</span>
          <Text code className="usdt-address__value">
            {truncateAddress(usdtAddress)}
          </Text>
          <Button
            type="text"
            size="small"
            icon={<CopyOutlined />}
            onClick={handleCopy}
            className="usdt-address__copy"
            aria-label="Copy USDT address"
          />
        </div>
      )}
    </SectionBlock>
  );
};

export default memo(UsdtBlock);
```

### 3.4 `RewardsBlock.tsx`

```tsx
import React, { memo } from "react";
import {
  GiftOutlined,
  DollarOutlined,
  RocketOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  RollbackOutlined,
} from "@ant-design/icons";
import { SectionBlock } from "../SectionBlock";
import { formatCurrency } from "../../utils/formatters";

interface RewardsBlockProps {
  totalCommission: number;
  totalRewardFirstDeposit: number;
  totalRewardMembersFirstDeposit: number;
  totalDailyQuestRewards: number;
  totalRefundTradeAmount: number;
}

const FIELDS = [
  { key: "totalCommission", label: "Tổng hoa hồng", icon: <DollarOutlined /> },
  { key: "totalRewardFirstDeposit", label: "Thưởng nạp đầu", icon: <RocketOutlined /> },
  { key: "totalRewardMembersFirstDeposit", label: "Thưởng F1 nạp đầu", icon: <TeamOutlined /> },
  { key: "totalDailyQuestRewards", label: "Daily Quest", icon: <CheckCircleOutlined /> },
  { key: "totalRefundTradeAmount", label: "Hoàn trả", icon: <RollbackOutlined /> },
] as const;

const RewardsBlock: React.FC<RewardsBlockProps> = (props) => {
  return (
    <SectionBlock
      icon={<GiftOutlined />}
      title="Hoa hồng & Thưởng"
      subtitle="Tổng các khoản thưởng hệ thống đã ghi nhận"
      accent="gold"
    >
      <ul className="rewards-list">
        {FIELDS.map((f) => (
          <li key={f.key} className="rewards-list__item">
            <span className="rewards-list__icon">{f.icon}</span>
            <span className="rewards-list__label">{f.label}</span>
            <span className="rewards-list__value">
              {formatCurrency((props as any)[f.key])}
            </span>
          </li>
        ))}
      </ul>
    </SectionBlock>
  );
};

export default memo(RewardsBlock);
```

### 3.5 `WalletSection.less`

```less
@import '~antd/lib/style/themes/default.less';

.usdt-metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
  margin-bottom: 16px;
}

.usdt-metric {
  display: flex;
  flex-direction: column;
  gap: 4px;

  &__label {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    font-weight: 500;
    color: @text-color-secondary;
    text-transform: uppercase;
    letter-spacing: 0.4px;

    .anticon { font-size: 12px; }
  }

  &__value {
    font-size: 20px;
    font-weight: 600;
    color: @text-color;
  }
}

.usdt-address {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px dashed @border-color-split;

  &__label {
    font-size: 12px;
    color: @text-color-secondary;
  }

  &__value {
    flex: 1;
    min-width: 0;
    background: @background-color-light;
    font-size: 12px;
  }

  &__copy {
    color: @primary-color;
  }
}

.rewards-list {
  list-style: none;
  margin: 0;
  padding: 0;

  &__item {
    display: grid;
    grid-template-columns: 20px 1fr auto;
    align-items: center;
    gap: 12px;
    padding: 10px 0;
    border-bottom: 1px solid @border-color-split;

    &:last-child { border-bottom: none; }
  }

  &__icon {
    color: @gold-6;
    font-size: 14px;
    display: inline-flex;
    justify-content: center;
  }

  &__label {
    font-size: 13px;
    color: @text-color;
  }

  &__value {
    font-size: 14px;
    font-weight: 600;
    color: @text-color;
  }
}

@media (max-width: @screen-sm) {
  .usdt-metrics {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}
```

**Checkpoint:** USDT block 3 cột + địa chỉ inline; Rewards 5 dòng list có icon.

---

## Step 4 — `HierarchyTreeSection` + `HierarchySummary` (~40 phút)

### 4.1 Cập nhật signature `HierarchyTreeSection`

File: `src/components/customer/OverviewTab/HierarchyTreeSection/index.tsx`

- Thêm 2 props optional:
  ```tsx
  interface HierarchyTreeSectionProps {
    customerId: number;
    customer?: Customer;
    customerVip?: CustomerVip;
  }
  ```
- Truyền xuống `<HierarchySummary customer={customer} customerVip={customerVip} ... />`.

### 4.2 Cập nhật `HierarchySummary`

File: `src/components/customer/OverviewTab/HierarchyTreeSection/HierarchySummary.tsx`

- Nhận thêm `customer?: Pick<Customer, "totalMember" | "totalMemberVip" | "totalMemberVip1">` và `customerVip?: CustomerVip`.
- Render thêm 4 KPI trước/sau summary backend:
  - Members → `customer.totalMember`
  - VIP → `customer.totalMemberVip` (accent purple)
  - F1 → `customer.totalMemberVip1` (accent blue)
  - Cấp hiện tại → `customerVip?.currentVipLevel ?? 0` (accent gold)
- Dùng cùng pattern "border-left 2px accent" thay full background (đồng bộ design section 4.2 visual spec).

### 4.3 Style

Sửa `HierarchyTreeSection.less`:
- Thay `.stat-item` (nếu có) sang pattern `border-left` accent.
- Tận dụng biến `@purple-6`, `@blue-6`, `@gold-6`, `@primary-color`.

### 4.4 Memo

- `memo(HierarchySummary)` nếu chưa memo.
- Bảo đảm `customer` prop pass ổn định (OverviewTab container memo đã giúp cấp cha).

**Checkpoint:** HierarchySummary hiện 4 KPI mới đúng data + các stats cũ; UI đồng nhất section shell.

---

## Step 5 — `OverviewTab/index.tsx` + styles (~25 phút)

### 5.1 Rewrite container

File: `src/components/customer/OverviewTab/index.tsx`

```tsx
import React, { memo, Suspense, lazy } from "react";
import AccountInfoSection from "./AccountInfoSection";
import WalletSection from "./WalletSection";
import { SectionSkeleton } from "./SectionBlock";
import { CustomerDetailData } from "../types/customer.types";
import "./OverviewTab.less";

const HierarchyTreeSection = lazy(() => import("./HierarchyTreeSection"));

interface OverviewTabProps {
  customerId: number;
  customerData: CustomerDetailData;
  onDataUpdate: () => void;
}

const OverviewTab: React.FC<OverviewTabProps> = ({
  customerId,
  customerData,
}) => {
  return (
    <div className="overview-tab">
      <AccountInfoSection
        customer={customerData.customer}
        inviter={customerData.inviter}
      />
      <WalletSection customerMoney={customerData.customerMoney} />
      <Suspense fallback={<SectionSkeleton title="Cây phả hệ" rows={5} />}>
        <HierarchyTreeSection
          customerId={customerId}
          customer={customerData.customer}
          customerVip={customerData.customerVip}
        />
      </Suspense>
    </div>
  );
};

export default memo(OverviewTab);
```

> `onDataUpdate` vẫn nhận từ prop (để tránh phá interface của `TabContainer`), nhưng không dùng trong Overview — có thể đánh dấu unused hoặc thêm `// eslint-disable-next-line` nếu linter phàn nàn. Ưu tiên giữ signature để không gợn.

### 5.2 Rewrite `OverviewTab.less` cho gọn

Chỉ giữ container:

```less
.overview-tab {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
```

Tất cả styles của `CustomerInfo`, `FinancialOverview`, `QuickActions` cũ → **xoá** khỏi file này. Styles `.quick-actions` sẽ di chuyển ra `QuickActions.less` ở Step 6 (hoặc giữ inline nếu chưa có file less).

### 5.3 Xoá file cũ

- `src/components/customer/OverviewTab/CustomerInfo.tsx`
- `src/components/customer/OverviewTab/FinancialOverview.tsx`

**Checkpoint:** Overview render đúng 3 section; không còn import tới 2 file bị xoá.

---

## Step 6 — `QuickActions` thêm Bảo mật 2FA (~25 phút)

### 6.1 Thêm imports

File: `src/components/customer/OverviewTab/QuickActions.tsx`

```tsx
import { QrcodeOutlined, SafetyOutlined } from "@ant-design/icons";
import TwoFADisplay from "../../TwoFADisplay";
```

### 6.2 State + handlers

Trong component:

```tsx
const [twoFAModalVisible, setTwoFAModalVisible] = useState(false);

const canViewTwoFA =
  !!customerData.customer.twoFAEnabled &&
  !!customerData.customer.twoFASecret;
```

### 6.3 Section "Bảo mật" (render sau Email Activation, trước Balance)

```tsx
{canViewTwoFA && (
  <>
    <div className="quick-actions__section">
      <h4 className="quick-actions__section-title">
        <SafetyOutlined /> Bảo mật
      </h4>
      <Button
        icon={<QrcodeOutlined />}
        block
        size="small"
        onClick={() => setTwoFAModalVisible(true)}
      >
        Xem mã 2FA
      </Button>
    </div>
    <Divider className="quick-actions__divider" />
  </>
)}
```

### 6.4 Modal ở cuối JSX

```tsx
{canViewTwoFA && (
  <TwoFADisplay
    twoFASecret={customerData.customer.twoFASecret}
    customerEmail={customerData.customer.email}
    visible={twoFAModalVisible}
    onClose={() => setTwoFAModalVisible(false)}
  />
)}
```

### 6.5 Styles (nếu cần)

Nếu `QuickActions` chưa có file less riêng và styles đang nằm trong `OverviewTab.less` — chọn 1 trong 2:
- **Option A (minimal):** để lại styles `.quick-actions*` trong `OverviewTab.less` (chỉ xoá styles của CustomerInfo/FinancialOverview).
- **Option B (cleaner):** tách ra `QuickActions.less` và `import` trong `QuickActions.tsx`.

→ Chọn **Option A** để giữ PR gọn, chỉ xoá styles không còn dùng (customer-info-card, financial-overview-card, network-hierarchy-card). Tên file `OverviewTab.less` giữ nguyên.

**Checkpoint:** Nếu 2FA bật → nút mở modal hoạt động từ sidebar; Overview không còn nút 2FA.

---

## Step 7 — `TabContainer` lazy-load tabs (~20 phút)

File: `src/components/customer/TabContainer/index.tsx`

### 7.1 Đổi import sang lazy

```tsx
import React, { useState, Suspense, lazy } from "react";
import { Tabs, Spin } from "antd";
import { /* icons */ } from "@ant-design/icons";
import OverviewTab from "../OverviewTab";
// ...

const DepositsWithdrawalsTab = lazy(() => import("../DepositsWithdrawalsTab"));
const TransactionsTab = lazy(() => import("../TransactionsTab"));
const TradingHistoryTab = lazy(() => import("../TradingHistoryTab"));
const VipCommissionTab = lazy(() => import("../VipCommissionTab"));
```

> OverviewTab **không** lazy — nó là tab mặc định, lazy sẽ gây flash.

### 7.2 Helper fallback

```tsx
const TabFallback: React.FC = () => (
  <div className="tab-container__fallback">
    <Spin />
  </div>
);
```

### 7.3 Bọc Suspense trong mỗi TabPane không phải Overview

```tsx
<TabPane key="deposits-withdrawals" tab={...}>
  <Suspense fallback={<TabFallback />}>
    <DepositsWithdrawalsTab customerId={customerId} />
  </Suspense>
</TabPane>
```

Apply cho cả 4 tab non-Overview.

### 7.4 Style fallback (thêm vào `TabContainer.less`)

```less
.tab-container__fallback {
  display: flex;
  justify-content: center;
  padding: 40px 0;
}
```

**Checkpoint:** DevTools → Network → chuyển tab load chunk mới; tab Overview mở ngay không chờ.

---

## Step 8 — Polish + QA (~45 phút)

### 8.1 Run linter + typecheck

```bash
yarn lint
yarn tsc --noEmit
# hoặc lệnh tương đương của project
```

Fix mọi warning/error mới do thay đổi.

### 8.2 Manual QA checklist

1. ✅ Open customer detail → 3 section Overview render với data thật.
2. ✅ Block USDT: số dư / tổng nạp / tổng rút hiển thị đúng; copy address bấm được, show toast.
3. ✅ Address ẩn khi `usdtAddress` trống.
4. ✅ Rewards 5 dòng hiển thị đủ, icon màu gold, số thẳng cột.
5. ✅ HierarchySummary hiển thị Members / VIP / F1 / Level khớp `customer` / `customerVip`.
6. ✅ QuickActions "Xem mã 2FA" mở `TwoFADisplay` khi `twoFAEnabled && twoFASecret`.
7. ✅ Overview không còn nút 2FA; StatusBar 2FA tag vẫn còn.
8. ✅ Chuyển sang tab Nạp/Rút, Giao dịch, Lịch sử cược, VIP & Hoa hồng → Network chunk mới load.
9. ✅ Quay lại Overview → state tree/search/collapse của Hierarchy giữ nguyên.
10. ✅ QuickActions cộng balance → verify `FinancialSummary` refresh.
11. ✅ < 768px: grid 2×2 fallback về 1 cột; USDT 3 cột fallback về 1 cột; không vỡ layout.
12. ✅ Không có warning React trong console.

### 8.3 Bundle verification (optional)

Chạy `yarn build --analyze` (nếu có) để confirm 4 tab ngoài Overview nằm ở chunks riêng.

### 8.4 Cleanup commit

Đảm bảo commit hiện đã xoá:
- `CustomerInfo.tsx`
- `FinancialOverview.tsx`
- Styles cũ không còn dùng trong `OverviewTab.less`

**Checkpoint cuối:** QA pass hết → sẵn sàng PR.

---

## Effort summary

| Step | Thời gian |
|---|---|
| 0. Pre-flight | ~10p |
| 1. SectionBlock | ~45p |
| 2. AccountInfoSection | ~30p |
| 3. WalletSection | ~50p |
| 4. HierarchySummary update | ~40p |
| 5. OverviewTab container rewrite | ~25p |
| 6. QuickActions + 2FA | ~25p |
| 7. TabContainer lazy | ~20p |
| 8. Polish + QA | ~45p |
| **Total** | **~4h 50p** |

## Rollback plan

Nếu có vấn đề trên prod:
1. Revert PR.
2. Vì plan chỉ đụng folder `OverviewTab/` + 1 file `TabContainer/index.tsx` + hooks không đổi, revert là clean single-commit.
3. Không có migration DB / service — revert FE là đủ.
