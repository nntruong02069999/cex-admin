# Customer List Page — Design Document

> **Date:** 2026-04-07
> **Status:** Approved via brainstorming session

## Goal

Triển khai màn danh sách khách hàng sử dụng API mới `GET /api/admin/customer/get-list-v2`, với UX clean, dễ sử dụng, đồng nhất style với Customer Detail (BEM CSS, Ant Design, `@ant-design/icons`).

---

## Design Decisions

### 1. Filter UX: Tối giản + Collapse nâng cao

**Primary filter bar** (luôn hiện):
- `search` — Input tìm kiếm gộp (nickname, email, uuid, id)
- `statusDocument` — Select KYC: Tất cả / Chưa nộp / Chờ duyệt / Đã duyệt / Từ chối
- `isVerifyEmail` — Select: Tất cả / Đã xác thực / Chưa xác thực
- `isAccountMarketing` — Select: Tất cả / Marketing / Thường
- `isVip` — Select: Tất cả / VIP / Không VIP

**Advanced filters** (collapse/expand bên dưới):
- `vipLevel` (Select 0-7), `minBalance`/`maxBalance` (InputNumber), `minTotalDeposit`/`maxTotalDeposit` (InputNumber)
- `inviterEmail`, `inviterUuid` (Input)
- `createdFrom`/`createdTo` (DatePicker range)
- `sortBy` (Select: id/createdAt/balance/totalDeposit), `sortOrder` (Select: asc/desc)
- Nút "Áp dụng" + "Xóa bộ lọc"

### 2. Bảng: 12 cột mặc định + Column customizer

| Cột | Render | Mặc định |
|-----|--------|----------|
| ID | Number | ✅ |
| User | Avatar + Nickname (bold) + Email (secondary) | ✅ |
| Password | Masked `••••••` + nút copy | ✅ |
| Email ✓ | Tag success/warning | ✅ |
| KYC Status | Tag 4 màu (reuse STATUS_COLORS) | ✅ |
| MKT | Tag orange/default | ✅ |
| VIP Level | Tag (reuse VIP_LEVELS colors) | ✅ |
| Balance | formatCurrency | ✅ |
| Total Deposit | formatCurrency | ✅ |
| Inviter | Nickname (link) hoặc "—" | ✅ |
| Ngày tạo | formatDate DISPLAY_DATE | ✅ |
| Thao tác | Dropdown menu | ✅ |
| UUID | Monospace text | ❌ (optional) |
| Last Login | formatTimeAgo | ❌ (optional) |
| Total Withdraw | formatCurrency | ❌ (optional) |
| Total Trade | formatCurrency | ❌ (optional) |
| First/Last Name | Text | ❌ (optional) |

### 3. Tương tác

- **Click row** → navigate đến `/customer/:id`
- **Cột Thao tác** → Dropdown (`MoreOutlined`):
  - Cộng tiền (modal với InputNumber + captcha)
  - Trừ tiền (modal với InputNumber + captcha)
  - Bật/Tắt Marketing (toggle)
- **Nút ⚙ Columns** → Popover checkbox list để chọn cột hiển thị
- **Pagination** → Ant Design Pagination, mặc định 20/trang

### 4. Style Consistency

- BEM CSS: `customer-list__*`
- Less import Antd theme variables
- Reuse `STATUS_COLORS`, `STATUS_TEXT`, `VIP_LEVELS` từ `utils/constants.ts`
- Reuse `formatCurrency`, `formatDate`, `formatVipLevel` từ `utils/formatters.ts`
- Tag colors giống `StatusBar/index.tsx`

---

## Layout Wireframe

```
┌──────────────────────────────────────────────────────┐
│  Breadcrumb: Admin > Khách hàng                       │
├──────────────────────────────────────────────────────┤
│  [🔍 Search...] [KYC ▼] [Email ▼] [MKT ▼] [VIP ▼]  │
│                               [▿ Bộ lọc nâng cao]    │
├─── (collapse when opened) ───────────────────────────┤
│  VIP Level │ Balance min-max │ Deposit min-max        │
│  Inviter Email │ UUID │ Created from-to               │
│  Sort by ▼ │ Sort order ▼    [Áp dụng] [Xóa]         │
├──────────────────────────────────────────────────────┤
│  1-20 / 1,234 khách hàng                 [⚙ Columns] │
├──────────────────────────────────────────────────────┤
│  ID │ User │ Pass │ Email✓ │ KYC │ MKT │ VIP │ ...   │
│  clickable rows ─────────────────────────────── [⋮]  │
├──────────────────────────────────────────────────────┤
│  < 1 2 3 ... 62 >                      20/trang ▼    │
└──────────────────────────────────────────────────────┘
```

---

## File Structure

```
src/components/customer/CustomerList/
├── index.tsx               # Main orchestrator
├── CustomerListFilters.tsx  # Search + quick filters + collapse
├── CustomerListTable.tsx    # Table + columns config
├── ColumnCustomizer.tsx     # Popover chọn cột
├── CustomerActions.tsx      # Dropdown actions (balance, marketing)
├── CustomerList.less        # BEM styles
└── types.ts                 # Filter params, response types

src/components/customer/hooks/
└── useCustomerList.ts       # Data fetching hook

src/services/customer.ts     # Add getCustomerListV2()

src/routes/customer/index.tsx # Update to render CustomerList
```
