# Customer List Page — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Triển khai màn danh sách khách hàng với API `get-list-v2`, UX clean, consistent với Customer Detail.

**Architecture:** Component-based React với custom hooks cho data fetching. Filter state quản lý local, debounced search. Reuse formatters/constants từ existing utils.

**Tech Stack:** React 17, Ant Design 4, Less (BEM), TypeScript

---

## Proposed Changes

### Types & Service Layer

#### [NEW] `src/components/customer/CustomerList/types.ts`
Định nghĩa interfaces cho filter params, API response, column config.

#### [MODIFY] `src/services/customer.ts`
Thêm function `getCustomerListV2()` — gọi `GET /admin/customer/get-list-v2` với query params.

---

### Custom Hook

#### [NEW] `src/components/customer/hooks/useCustomerList.ts`
Hook quản lý: filters state, data fetching, pagination, loading/error states. Pattern giống `useCustomerData.ts`.

---

### UI Components

#### [NEW] `src/components/customer/CustomerList/CustomerListFilters.tsx`
- Search input (debounced 300ms)
- 4 quick filter Selects (KYC, Email verified, Marketing, VIP)
- Collapsible panel cho advanced filters (vipLevel, balance range, deposit range, inviter, date range, sort)
- Nút "Áp dụng" + "Xóa bộ lọc"

#### [NEW] `src/components/customer/CustomerList/CustomerListTable.tsx`
- Ant Design Table với 12 cột mặc định
- Click row → navigate `/customer/:id`
- Reuse `STATUS_COLORS`, `STATUS_TEXT`, `VIP_LEVELS`, formatters
- Password masked + copy button
- Pagination tích hợp

#### [NEW] `src/components/customer/CustomerList/ColumnCustomizer.tsx`
- Popover với checkbox list
- Lưu cột đã chọn vào localStorage
- Default 12 cột, optional thêm 5 cột

#### [NEW] `src/components/customer/CustomerList/CustomerActions.tsx`
- Dropdown menu (MoreOutlined): Cộng tiền, Trừ tiền, Toggle Marketing
- Modal captcha cho balance actions (reuse pattern từ QuickActions)
- Reuse `useCustomerActions` hook

#### [NEW] `src/components/customer/CustomerList/index.tsx`
- Orchestrator: breadcrumb + filters + summary bar + table
- Kết nối hook + components

#### [NEW] `src/components/customer/CustomerList/CustomerList.less`
- BEM styles, import Antd theme variables
- Consistent với `OverviewTab.less` và `CustomerDetail.less`

---

### Route Integration

#### [MODIFY] `src/routes/customer/index.tsx`
Thay placeholder bằng `<CustomerList />` component.

---

## Task Breakdown

### Task 1: Types & Service — Nền tảng dữ liệu

**Files:**
- Create: `src/components/customer/CustomerList/types.ts`
- Modify: `src/services/customer.ts`

**Step 1: Tạo types.ts**

```typescript
// src/components/customer/CustomerList/types.ts

export enum CustomerDocumentStatus {
  NOT_SUBMIT = 'not_submit',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

// Query params cho API get-list-v2
export interface CustomerListParams {
  search?: string;
  isVerifyEmail?: boolean;
  statusDocument?: CustomerDocumentStatus;
  isVip?: boolean;
  isAccountMarketing?: boolean;
  vipLevel?: number;
  minBalance?: number;
  maxBalance?: number;
  minTotalDeposit?: number;
  maxTotalDeposit?: number;
  inviterEmail?: string;
  inviterUuid?: string;
  createdFrom?: number; // Unix timestamp ms
  createdTo?: number;
  sortBy?: 'id' | 'createdAt' | 'balance' | 'totalDeposit';
  sortOrder?: 'asc' | 'desc';
  skip?: number;
  limit?: number;
}

// Inviter info nested object
export interface InviterInfo {
  id: number;
  nickname: string;
  email: string;
}

// Money nested object
export interface CustomerMoney {
  balance: number;
  balanceUSDT: number;
  total: number;
  totalDeposit: number;
  totalWithdraw: number;
  totalTradeAmount: number;
  totalTradeAmountWin: number;
}

// Single customer item from API response
export interface CustomerListItem {
  id: number;
  nickname: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  uuid: string;
  password: string;
  avatar: string | null;
  isVerifyEmail: boolean;
  statusDocument: string;
  isVip: boolean | null;
  isAccountMarketing: boolean | null;
  createdAt: number | null;
  userLoginDate: number | null;
  inviteCode: string;
  inviterCustomerId: number | null;
  inviterInfo: InviterInfo | null;
  money: CustomerMoney | null;
  vipLevel: number;
}

// API response
export interface CustomerListResponse {
  code: number;
  message: string;
  data: CustomerListItem[];
  total: number;
  skip: number;
  limit: number;
}

// Column visibility config
export interface ColumnConfig {
  key: string;
  label: string;
  visible: boolean;
  fixed?: boolean; // Can't be toggled off
}

// Default column configuration
export const DEFAULT_COLUMNS: ColumnConfig[] = [
  { key: 'id', label: 'ID', visible: true, fixed: true },
  { key: 'user', label: 'User', visible: true, fixed: true },
  { key: 'password', label: 'Password', visible: true },
  { key: 'isVerifyEmail', label: 'Email ✓', visible: true },
  { key: 'statusDocument', label: 'KYC', visible: true },
  { key: 'isAccountMarketing', label: 'MKT', visible: true },
  { key: 'vipLevel', label: 'VIP', visible: true },
  { key: 'balance', label: 'Balance', visible: true },
  { key: 'totalDeposit', label: 'Total Deposit', visible: true },
  { key: 'inviterInfo', label: 'Inviter', visible: true },
  { key: 'createdAt', label: 'Ngày tạo', visible: true },
  { key: 'actions', label: 'Thao tác', visible: true, fixed: true },
  // Optional columns (default hidden)
  { key: 'uuid', label: 'UUID', visible: false },
  { key: 'userLoginDate', label: 'Last Login', visible: false },
  { key: 'totalWithdraw', label: 'Total Withdraw', visible: false },
  { key: 'totalTradeAmount', label: 'Total Trade', visible: false },
  { key: 'fullName', label: 'Họ tên', visible: false },
];

// LocalStorage key for column preferences
export const COLUMN_STORAGE_KEY = 'customer-list-columns';
```

**Step 2: Thêm service function vào customer.ts**

Thêm vào cuối file `src/services/customer.ts`:

```typescript
/**
 * Get customer list with v2 API
 */
export const getCustomerListV2 = async (params: Record<string, any> = {}) => {
    const token = localStorage.getItem('token')
    const queryParams = new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, value.toString())
        }
    })

    const queryString = queryParams.toString()
    const url = `/admin/customer/get-list-v2${queryString ? `?${queryString}` : ''}`

    const res: any = await request({
        url,
        options: {
            method: 'get',
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    })

    if (res && res.status === HttpStatusCode.OK && res.data?.code === 0) {
        return res.data
    } else {
        return {
            errorCode: res.data?.code || HttpStatusCode.UNKNOW_ERROR,
            message: res.data?.message || DEFAULT_ERROR_MESSAGE,
        }
    }
}
```

---

### Task 2: Custom Hook — useCustomerList

**Files:**
- Create: `src/components/customer/hooks/useCustomerList.ts`

```typescript
import { useState, useEffect, useCallback, useRef } from 'react';
import { CustomerListParams, CustomerListItem, CustomerListResponse } from '../CustomerList/types';
import { getCustomerListV2 } from '@src/services/customer';

interface UseCustomerListReturn {
  data: CustomerListItem[];
  total: number;
  loading: boolean;
  error: string | null;
  filters: CustomerListParams;
  setFilters: (filters: CustomerListParams) => void;
  updateFilter: (key: keyof CustomerListParams, value: any) => void;
  resetFilters: () => void;
  refetch: () => void;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize?: number) => void;
  };
}

const DEFAULT_FILTERS: CustomerListParams = {
  sortBy: 'id',
  sortOrder: 'desc',
  skip: 0,
  limit: 20,
};

export const useCustomerList = (): UseCustomerListReturn => {
  const [data, setData] = useState<CustomerListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<CustomerListParams>(DEFAULT_FILTERS);

  // Debounce timer ref for search
  const searchTimerRef = useRef<NodeJS.Timeout>();

  const fetchData = useCallback(async (currentFilters: CustomerListParams) => {
    try {
      setLoading(true);
      setError(null);

      // Build clean params (remove undefined/null/empty)
      const cleanParams: Record<string, any> = {};
      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          cleanParams[key] = value;
        }
      });

      const response = await getCustomerListV2(cleanParams);

      if ('errorCode' in response) {
        setError(response.message || 'Không thể tải danh sách khách hàng');
      } else {
        setData(response.data || []);
        setTotal(response.total || 0);
      }
    } catch (err: any) {
      console.error('Error fetching customer list:', err);
      setError(err.message || 'Đã xảy ra lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on filter change
  useEffect(() => {
    fetchData(filters);
  }, [filters, fetchData]);

  const setFilters = useCallback((newFilters: CustomerListParams) => {
    setFiltersState(newFilters);
  }, []);

  const updateFilter = useCallback((key: keyof CustomerListParams, value: any) => {
    setFiltersState(prev => {
      const updated = { ...prev, [key]: value };

      // Reset pagination when filter changes (except skip/limit)
      if (key !== 'skip' && key !== 'limit') {
        updated.skip = 0;
      }

      return updated;
    });
  }, []);

  const resetFilters = useCallback(() => {
    setFiltersState(DEFAULT_FILTERS);
  }, []);

  const refetch = useCallback(() => {
    fetchData(filters);
  }, [filters, fetchData]);

  // Pagination helper
  const pagination = {
    current: Math.floor((filters.skip || 0) / (filters.limit || 20)) + 1,
    pageSize: filters.limit || 20,
    total,
    onChange: (page: number, pageSize?: number) => {
      const newLimit = pageSize || filters.limit || 20;
      setFiltersState(prev => ({
        ...prev,
        skip: (page - 1) * newLimit,
        limit: newLimit,
      }));
    },
  };

  return {
    data,
    total,
    loading,
    error,
    filters,
    setFilters,
    updateFilter,
    resetFilters,
    refetch,
    pagination,
  };
};
```

---

### Task 3: CustomerListFilters — Filter bar + Advanced collapse

**Files:**
- Create: `src/components/customer/CustomerList/CustomerListFilters.tsx`

Component bao gồm:
- **Primary bar**: Search Input (debounced 300ms) + 4 Select filters
- **Collapse panel**: Render khi nút "Bộ lọc nâng cao" được click
- Advanced filters: vipLevel, balance range, deposit range, inviterEmail, inviterUuid, date range, sort
- Nút "Áp dụng" áp toàn bộ advanced filters, "Xóa" reset tất cả

**Key implementation details:**
- Primary filters gọi `updateFilter()` trực tiếp → fetch ngay.
- Search dùng `useRef` debounce 300ms trước khi gọi `updateFilter('search', value)`.
- Advanced filters dùng local state, chỉ gọi `setFilters()` khi nhấn "Áp dụng".
- Reuse `VIP_LEVELS` từ `utils/constants.ts`.
- Ant components: `Input.Search`, `Select`, `InputNumber`, `DatePicker.RangePicker`, `Button`.

---

### Task 4: CustomerListTable — Table + Columns

**Files:**
- Create: `src/components/customer/CustomerList/CustomerListTable.tsx`

Component sử dụng Ant Design `<Table>` với:
- 12 cột mặc định (xem design doc)
- Click row → `history.push(`/customer/${record.id}`)`
- Password column: hiện `••••••` + icon CopyOutlined, click copy vào clipboard
- KYC column: `<Tag color={STATUS_COLORS[record.statusDocument]}>` + `STATUS_TEXT[record.statusDocument]`
- VIP column: `<Tag color={VIP_LEVELS[record.vipLevel]?.color}>Level {record.vipLevel}</Tag>`
- Email/MKT columns: Tag success/warning/orange/default
- Balance/Deposit: `formatCurrency(record.money?.balance || 0)`
- Inviter: link text `record.inviterInfo?.nickname` hoặc "—"
- Pagination props từ `useCustomerList` hook
- `scroll={{ x: 'max-content' }}` cho horizontal scroll khi nhiều cột

---

### Task 5: ColumnCustomizer — Chọn cột hiển thị

**Files:**
- Create: `src/components/customer/CustomerList/ColumnCustomizer.tsx`

- Ant `<Popover>` trigger bởi nút `<SettingOutlined />`
- Bên trong: `<Checkbox.Group>` với danh sách tất cả cột
- `fixed: true` columns luôn checked + disabled
- Load/save preferences từ `localStorage` (key: `customer-list-columns`)
- Nút "Reset mặc định"

---

### Task 6: CustomerActions — Dropdown thao tác nhanh

**Files:**
- Create: `src/components/customer/CustomerList/CustomerActions.tsx`

- Ant `<Dropdown>` trigger bởi `<MoreOutlined />`
- Menu items: Cộng tiền (`PlusOutlined`), Trừ tiền (`MinusOutlined`), Toggle MKT (`NotificationOutlined`)
- Cộng/Trừ tiền → Modal với InputNumber + optional note + Captcha component
- Toggle MKT → gọi `toggleMarketingStatus()` hoặc `updateMarketingStatus()` trực tiếp
- Reuse `Captcha` component từ `@src/packages/pro-component/schema/Captcha`
- Sau action thành công → gọi `refetch()` callback

---

### Task 7: Main Component + Styles

**Files:**
- Create: `src/components/customer/CustomerList/index.tsx`
- Create: `src/components/customer/CustomerList/CustomerList.less`

**index.tsx**: Orchestrator component
- Breadcrumb (Admin > Khách hàng)
- `<CustomerListFilters>`
- Summary bar: "Hiển thị X-Y / Z khách hàng" + `<ColumnCustomizer>`
- `<CustomerListTable>`
- States: loading (Spin), error (Result), empty (Empty)

**CustomerList.less**: BEM styles
- `.customer-list` root
- `.customer-list__header` — breadcrumb
- `.customer-list__filters` — filter bar
- `.customer-list__advanced-filters` — collapse panel
- `.customer-list__summary` — summary bar
- `.customer-list__table` — table wrapper
- Reuse Antd Less variables (`@primary-color`, `@border-color-split`, etc.)
- Row hover cursor pointer

---

### Task 8: Route Integration

**Files:**
- Modify: `src/routes/customer/index.tsx`

Thay placeholder bằng:
```typescript
import CustomerList from "@src/components/customer/CustomerList";

// In component:
if (customerId) {
  return <CustomerDetail />;
}
return <CustomerList />;
```

---

## Verification Plan

### Manual Verification

1. **Chạy dev server**: `npm run dev` hoặc `yarn dev`
2. **Navigate đến** `/admin/customers` (hoặc route tương ứng) → Kiểm tra danh sách hiển thị
3. **Test search**: Nhập nickname/email → verify debounce 300ms → kết quả lọc đúng
4. **Test 4 quick filters**: Chọn từng filter → bảng cập nhật ngay
5. **Test advanced filters**:
   - Click "Bộ lọc nâng cao" → panel collapse xuống
   - Nhập vipLevel, balance range → nhấn "Áp dụng" → bảng cập nhật
   - Nhấn "Xóa bộ lọc" → tất cả filter reset
6. **Test column customizer**: Click ⚙ → toggle cột → bảng ẩn/hiện cột
7. **Test click row**: Click vào 1 row → navigate đến `/customer/:id`
8. **Test actions dropdown**:
   - Click ⋮ → chọn "Cộng tiền" → modal hiện → nhập amount + captcha → verify API gọi đúng
   - Test "Trừ tiền" tương tự
   - Test "Toggle MKT" → verify tag MKT thay đổi
9. **Test pagination**: Chuyển trang, đổi pageSize → data load đúng
10. **Test responsive**: Thu nhỏ browser → table scroll horizontal, filters responsive
11. **Kiểm tra visual**: So sánh Tag colors, font sizes, spacing với Customer Detail page → phải consistent
