# Customer OverviewTab Redesign — Design

**Date:** 2026-04-20
**Scope:** `src/components/customer/OverviewTab/**` + lazy-load integration in `src/components/customer/TabContainer/index.tsx`
**Status:** Approved design, ready for implementation planning

## 1. Context & Problem

`CustomerDetail` > OverviewTab hiện gồm 3 khối lớn (`CustomerInfo`, `FinancialOverview`, `HierarchyTreeSection`) và nằm dưới 2 thành phần đã render sẵn ở trang (`CustomerHeader`, `StatusBar`, `FinancialSummary`).

Các vấn đề quan sát được:

- **Trùng lặp dữ liệu giữa nhiều khối**
  - `FinancialOverview.Balance` (Balance / Frozen / Total / Demo) trùng 100% với `FinancialSummary` đã hiển thị ngay trên Overview.
  - Ngày tham gia hiển thị ở cả `CustomerHeader` và `CustomerInfo`.
  - VIP level xuất hiện ở `CustomerHeader` (tag), `CustomerInfo` (stat "Cấp hiện tại") và `QuickActions` (section VIP).
  - 2FA hiển thị ở `StatusBar` (tag) và `CustomerInfo` (nút "Xem mã 2FA").
  - 4 stats mạng lưới (`totalMember`, `totalMemberVip`, `totalMemberVip1`, `currentVipLevel`) trong `CustomerInfo` đã được `HierarchyTreeSection` cover lại.
- **Mật độ thị giác cao, cảm giác "basic"** — các `<Card>` antd giống hệt nhau, nhiều grid phẳng kế tiếp, không có hierarchy thị giác, cột nào cũng có nền xám hoặc border — nhìn mệt.
- **Phạm vi "Overview" bị kéo dãn** — Trading stats/P&L, Rewards breakdown thực chất thuộc tab *Lịch sử cược* / *VIP & Hoa hồng*, không phải "tổng quan".
- **Bundle & render** — `TabContainer` mount đủ 5 tab từ đầu (`destroyInactiveTabPane={false}`), HierarchyTreeSection (nặng nhất) luôn tải cùng Overview.

## 2. Goals (user-approved)

1. **Declutter** — chỉ giữ ở Overview những thông tin thật sự là "overview"; bỏ trùng lặp.
2. **Visual upgrade** — chuyển sang sectioned clean/minimal, có typography scale + spacing rõ, tránh nhiều card phẳng giống nhau.
3. **Performance** — lazy-load tab không phải Overview, lazy-load riêng HierarchyTreeSection, memo sub-components, stable callbacks cho QuickActions.

**Non-goals**

- Không tách thêm tab mới.
- Không đổi API / service layer.
- Không viết thêm test cho feature mới.
- Không đụng vào `CustomerHeader`, `StatusBar`, `FinancialSummary`.

## 3. Approved Scope Decisions

### 3.1 Nội dung giữ/bỏ trong OverviewTab

| Khối hiện tại | Quyết định |
|---|---|
| CustomerInfo — nickname, invite code, inviter, ngày tham gia | **Giữ** (gom vào `AccountInfoSection`) |
| CustomerInfo — 4 network stats (Members/VIP/F1/Level) | **Bỏ**, gộp vào `HierarchySummary` |
| CustomerInfo — nút "Xem mã 2FA" | **Chuyển sang** `QuickActions` (sidebar) |
| FinancialOverview — Balance grid | **Bỏ** (đã có `FinancialSummary`) |
| FinancialOverview — USDT block (số dư + nạp/rút + address) | **Giữ** (đưa vào `WalletSection > UsdtBlock`) |
| FinancialOverview — Trading stats + P&L | **Bỏ khỏi Overview** (thuộc tab Lịch sử cược) |
| FinancialOverview — Rewards & Commission (5 dòng) | **Giữ** (đưa vào `WalletSection > RewardsBlock`) |
| HierarchyTreeSection | **Giữ**, bổ sung network stats vào Summary |

### 3.2 Visual direction

**Sectioned clean/minimal**: dùng 1 section shell thống nhất (`SectionBlock`), khác biệt thị giác đến từ typography + spacing + accent màu (1-2 điểm/section), không phải từ nhiều khung viền.

- Section shell: header tự build (icon tròn fade 8% + title 15/600 + subtitle 12/secondary + extra), divider mảnh tuỳ chọn, body.
- Padding 20/16 (desktop/mobile); gap giữa section 20px.
- Nền card `@component-background`, shadow `0 1px 2px rgba(0,0,0,0.04)`, border `1px @border-color-split`, radius 8.
- Hệ màu accent theo section:
  - AccountInfo → `@primary-color`
  - Wallet (USDT) → `@success-color`
  - Wallet (Rewards) → `@gold-6`
  - Hierarchy → `@purple-6`
- Typography scale:
  - Section title 15/600, subtitle 12/secondary
  - Field label 12/500 secondary, uppercase, letter-spacing 0.3px
  - Value nhỏ 14/600, value to 20–22/600, `font-variant-numeric: tabular-nums`
  - Currency unit 11/500 secondary, inline
- Thay pattern:
  - AccountInfo: 2×2 grid, label-trên / value-dưới, bỏ icon bên trái mỗi field; có thể dùng divider dọc mảnh giữa cột.
  - UsdtBlock: 1 hàng 3 cột (Số dư / Tổng nạp / Tổng rút), địa chỉ USDT inline dưới dạng `code` chip + icon copy-only (không nền).
  - RewardsBlock: giữ list border-bottom, thêm icon nhỏ bên trái mỗi dòng.
  - HierarchySummary: 4–5 KPI compact, border-left 2px accent thay vì full background.
- Nguyên tắc "bớt basic": tabular-nums cho số; skeleton đúng layout thay vì `<Spin>` toàn card; empty state có icon + 1 dòng chứ không "-" / "0" trần.

### 3.3 Performance

- `TabContainer` lazy-load 4 tab ngoài Overview bằng `React.lazy` + bọc `Suspense` trong từng `TabPane`. Giữ `destroyInactiveTabPane={false}`.
- `OverviewTab` lazy-load `HierarchyTreeSection` (nặng nhất trong Overview).
- `memo` cho: `SectionBlock`, `AccountInfoSection`, `UsdtBlock`, `RewardsBlock`, `HierarchySummary`, container `OverviewTab`.
- Props dùng `Pick<Customer, ...>` / object con gọn để memo hiệu quả.
- Hoist static config (reward fields, usdt fields, icon instance tái dùng) ra module level.
- Xác nhận `refetch` từ `useCustomerData` là stable (`useCallback`); nếu chưa thì bọc ở nguồn.
- `QuickActions`: giữ `setState` dạng functional khi phụ thuộc chính state đó (đã theo rule).

## 4. Target Architecture

### 4.1 File tree

```
src/components/customer/OverviewTab/
├── index.tsx                          (rewrite — slim container, lazy HierarchyTreeSection)
├── OverviewTab.less                   (rewrite — clean, bỏ styles không còn dùng)
│
├── SectionBlock/                      (MỚI)
│   ├── index.tsx                      (SectionBlock + SectionSkeleton)
│   └── SectionBlock.less
│
├── AccountInfoSection/                (MỚI — thay CustomerInfo.tsx)
│   ├── index.tsx
│   └── AccountInfoSection.less
│
├── WalletSection/                     (MỚI — thay FinancialOverview.tsx)
│   ├── index.tsx
│   ├── UsdtBlock.tsx
│   ├── RewardsBlock.tsx
│   └── WalletSection.less
│
├── HierarchyTreeSection/              (giữ, chỉnh nhỏ — xem 4.5)
│   └── ...
│
└── QuickActions.tsx                   (sửa — thêm block Bảo mật 2FA)

REMOVED:
- src/components/customer/OverviewTab/CustomerInfo.tsx
- src/components/customer/OverviewTab/FinancialOverview.tsx
```

### 4.2 `SectionBlock` (new)

```tsx
interface SectionBlockProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  accent?: "primary" | "success" | "gold" | "purple";
  extra?: React.ReactNode;
  loading?: boolean;
  className?: string;
  children: React.ReactNode;
}
```

- Render shell thống nhất. Khi `loading=true`, hiện skeleton body phù hợp (hoặc nhận `children`-as-skeleton).
- Export thêm `SectionSkeleton` (fallback cho `Suspense`).

### 4.3 `OverviewTab/index.tsx` (rewrite)

```tsx
const HierarchyTreeSection = lazy(() => import("./HierarchyTreeSection"));

const OverviewTab = memo(({ customerId, customerData }) => (
  <div className="overview-tab">
    <AccountInfoSection
      customer={customerData.customer}
      inviter={customerData.inviter}
    />
    <WalletSection customerMoney={customerData.customerMoney} />
    <Suspense fallback={<SectionSkeleton title="Cây phả hệ" />}>
      <HierarchyTreeSection
        customerId={customerId}
        customer={customerData.customer}
        customerVip={customerData.customerVip}
      />
    </Suspense>
  </div>
));
```

- Bỏ prop `onDataUpdate` (không component con nào trong Overview còn dùng — 2FA đã chuyển sang QuickActions).

### 4.4 `AccountInfoSection`

```tsx
interface AccountInfoSectionProps {
  customer: Pick<Customer, "nickname" | "inviteCode" | "createdAt">;
  inviter?: Inviter;
}
```

Render `SectionBlock` (accent `primary`, icon `UserOutlined`, title "Thông tin tài khoản"), body là grid 2×2 bốn field.

### 4.5 `WalletSection`

```tsx
interface WalletSectionProps { customerMoney: CustomerMoney; }
```

Render 2 `SectionBlock` liền kề:

1. `UsdtBlock` — accent `success`, icon `WalletOutlined`, title "USDT", subtitle (vd "Ví nạp/rút chính"). Body: 3 KPI ngang + block địa chỉ inline.
2. `RewardsBlock` — accent `gold`, icon `GiftOutlined`, title "Hoa hồng & Thưởng". Body: list 5 dòng reward với icon trái + label + value.

Hoặc có thể gom trong 1 section duy nhất nếu muốn gọn hơn — chọn phương án 2 section liền kề để giữ đúng tinh thần "section chuyên biệt".

### 4.6 `HierarchyTreeSection` — chỉnh nhỏ

- Thêm props optional: `customer?: Customer`, `customerVip?: CustomerVip`.
- Truyền xuống `HierarchySummary` để render 4 KPI gộp (Members / VIP / F1 / Level) ngay trên summary backend trả về.
- Không đổi API, không đổi hooks.

### 4.7 `QuickActions` — thêm block Bảo mật

- Section mới "Bảo mật" ở đầu (sau Email Activation, trước Balance management).
- Nếu `customer.twoFAEnabled && customer.twoFASecret`: render nút "Xem mã 2FA" → mở `TwoFADisplay` modal (logic copy từ `CustomerInfo.tsx` cũ).
- Nếu không bật 2FA: ẩn section hoặc hiển thị 1 dòng "Chưa bật 2FA" (chọn: ẩn section, tránh rác).

### 4.8 `TabContainer` — lazy-load

```tsx
const DepositsWithdrawalsTab = lazy(() => import("../DepositsWithdrawalsTab"));
const TransactionsTab = lazy(() => import("../TransactionsTab"));
const TradingHistoryTab = lazy(() => import("../TradingHistoryTab"));
const VipCommissionTab = lazy(() => import("../VipCommissionTab"));
```

Bọc `Suspense` **trong** từng `TabPane` (fallback: `<Spin />` hoặc `SectionSkeleton`). Giữ `destroyInactiveTabPane={false}` để không mất state khi chuyển tab.

## 5. Data Flow

```
useCustomerData(customerId)
  └─ CustomerDetailData { customer, customerVip, customerMoney, inviter }
       │
       ├─► AccountInfoSection       ← customer (Pick), inviter
       ├─► WalletSection            ← customerMoney
       ├─► HierarchyTreeSection     ← customerId, customer, customerVip
       │     ├─ useHierarchySummary (self-fetch, giữ)
       │     └─ useHierarchyTree    (self-fetch, load-on-expand, giữ)
       │
       └─ (sidebar, ngoài Overview)
          QuickActions              ← customerData, onDataUpdate
```

Không thêm service mới. Chỉ reshuffle props.

## 6. Loading / Error / Edge cases

**Loading**
- Toàn trang: giữ `<Spin>` ở `CustomerDetail`.
- Lazy chunk `HierarchyTreeSection`: `SectionSkeleton` (render shell + `<Skeleton active>`).
- `HierarchySummary`: skeleton 4 KPI thay vì text "Đang tải".
- `HierarchyTree`: giữ nguyên loading/error hiện có.

**Error**
- `HierarchyTreeSection` retry button: giữ.
- Không thêm error boundary mới (root của `CustomerDetail` đã chặn khi error ở cấp fetch đầu).

**Edge cases**
- `customerMoney.usdtAddress` rỗng → ẩn block địa chỉ.
- Không có inviter → "Chưa có" (giữ wording).
- `currentVipLevel = 0` → hiển thị "Lv 0" bình thường.
- `totalMember = 0` → vẫn hiển thị số 0 ở HierarchySummary.
- `twoFASecret` null nhưng `twoFAEnabled=true` → không render nút 2FA.
- Rewards toàn 0 → vẫn render đủ 5 dòng.

## 7. Behavior guarantees

Giữ tuyệt đối:
- `refetch` sau mọi thao tác `QuickActions`.
- `destroyInactiveTabPane={false}` ở `TabContainer`.
- Collapse / expand / search của `HierarchyTreeSection`.
- `TwoFADisplay` modal không đổi, chỉ đổi trigger.

## 8. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Import `CustomerInfo.tsx` / `FinancialOverview.tsx` ở nơi khác | Search toàn repo trước khi xoá |
| Lazy tab gây flash khi user chuyển tab lần đầu | Dùng `Suspense` fallback gọn (spin nhỏ trong vùng tab body), không full-page |
| Memo sai key (object mới mỗi render) | Dùng `Pick<>` props, hoist static objects, verify trong DevTools |
| `refetch` không stable → memo vô tác dụng | Kiểm tra `useCustomerData` có `useCallback` không; bọc nếu cần |
| User đã quen icon cũ / 2FA button ở Overview | 2FA giữ available ở sidebar — không mất chức năng |

## 9. Rollout

1 PR duy nhất. Áp dụng qua flag cờ không cần (thay đổi scoped trong Overview + `TabContainer` lazy imports).

## 10. Testing

Không viết test mới (theo convention của project cho feature mới). Manual smoke test:

1. Mở customer detail → 3 section của Overview render đúng với data thật.
2. Block USDT hiển thị đúng số dư / tổng nạp / tổng rút / địa chỉ + copy hoạt động.
3. 4 KPI mới trong `HierarchySummary` khớp với field của `customer` / `customerVip`.
4. Nút "Xem mã 2FA" trong QuickActions mở `TwoFADisplay` khi 2FA bật.
5. Chuyển sang tab Nạp/Rút → Network tab trong DevTools load chunk mới.
6. Quay lại Overview → state tree/search/collapse của Hierarchy không mất.
7. QuickActions cộng/trừ balance → `FinancialSummary` và `WalletSection.USDT` (nếu dùng field liên quan) refresh.
8. Expand F1, search theo nickname, load more hoạt động.
9. Test ở màn hình < 768px: grid fallback 1-2 cột, không vỡ layout.

## 11. Open Questions (post-implementation, không block)

- Có muốn thêm "last deposit / last withdraw timestamp" vào UsdtBlock không? (Hiện type đã có `customerLastDeposit`, `customerLastWithdraw` — có thể là phase 2.)
- Có muốn tách `QuickActions.Bảo mật` section riêng để chứa thêm "Reset password", "Force logout" trong tương lai?
