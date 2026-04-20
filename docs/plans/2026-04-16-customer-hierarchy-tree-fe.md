# Customer Hierarchy Tree View - Frontend Implementation Guide

> **Document Version:** 1.0
> **Last Updated:** 2026-04-16
> **Author:** Backend Team

---

## 1. Tổng Quan (Overview)

### 1.1 Mục Đích

Thêm section **Hierarchy Tree** vào trang chi tiết khách hàng (Customer Detail Page) cho phép admin:
- Xem trực tiếp cây phân cấp referral (F1-F7) của customer đang xem
- Expand/collapse từng node để khám phá mạng lưới
- Xem thông tin tóm tắt: tổng thành viên, tổng balance

### 1.2 Tại Sao Cần Tính Này?

- Admin cần visualize cấu trúc referral khi xem chi tiết customer
- Hỗ trợ điều tra gian lận, kiểm tra hierarchy
- Phân tích hiệu quả hệ thống referral của customer đó

### 1.3 Người Dùng

- **Admin** quản lý hệ thống
- Khi xem chi tiết customer → muốn xem mạng lưới referral

### 1.4 Vị Trí Hiển Thị

- **KHÔNG** phải trang riêng
- Là 1 **tab/section** trong trang chi tiết khách hàng hiện có
- Ví dụ: Tab "Network" hoặc Section "Hierarchy Tree" trong customer detail page

---

## 2. Phạm Vi (Scope)

### 2.1 Trong Scope

- Section "Hierarchy Tree" trong trang chi tiết khách hàng hiện có
- Hiển thị summary card (tổng quan mạng lưới)
- Tree view với expand/collapse lazy loading
- Hiển thị: ID, nickname, balance cho mỗi node
- Customer ID lấy từ URL params (trang detail đã có sẵn)

### 2.2 Ngoài Scope (Không Làm)

- Trang riêng `/admin/customer/hierarchy-tree` (không cần search)
- Edit/sửa hierarchy (đã có trang riêng)
- Export data
- Filter theo VIP level, balance range
- Real-time updates

---

## 3. Yêu Cầu Chức Năng (Functional Requirements)

### 3.1 Khi Vào Trang Chi Tiết Khách Hàng

- Customer ID lấy từ URL params (ví dụ: `/admin/customer/100`)
- Tự động load hierarchy tree khi vào section/tab
- **KHÔNG CẦN** search input (đã có customer ID)

### 3.2 Summary Card

Tự động load khi vào trang:
- Customer nickname + ID
- Tổng số thành viên (F1-F7)
- Tổng balance toàn bộ cây
- Breakdown theo level: F1=25, F2=45, F3=35...

### 3.3 Tree View

**Initial Load (tự động khi vào trang):**
- Hiển thị F1 (level 1) của customer hiện tại
- Mỗi node hiển thị: ID, nickname, balance
- Node có children → hiện icon `▶` (collapsed)

**Expand Node:**
- Click `▶` → gọi API load children
- Hiển thị loading spinner `⏳`
- Sau khi load → hiện `▼` (expanded) + children list

**Collapse Node:**
- Click `▼` → ẩn children
- Data giữ lại trong memory (không gọi lại API khi expand lại)

### 3.4 Empty States

- Customer không có hierarchy → "No hierarchy data found"
- Đang loading → "Loading hierarchy..."

---

## 4. Yêu Cầu Phi Chức Năng (Non-Functional)

### 4.1 Performance

- Initial load < 2s
- Expand node < 1s
- Không lag khi tree > 1000 nodes (dùng virtual scroll)

### 4.2 Security

- Chỉ admin đã đăng nhập mới truy cập
- Token JWT trong header Authorization

### 4.3 Browser Support

- Chrome, Firefox, Edge (latest versions)

---

## 5. API Integration

### 5.1 API 1: Get Hierarchy Children

**Endpoint:** `POST /api/admin/customer/hierarchy-children`

**Mục đích:** Lấy danh sách con trực tiếp của 1 node trong tree

**Khi nào gọi:**
- Load F1 khi vào trang (root level)
- Click expand 1 node → load children

**Request Format:**

```typescript
// Scenario 1: Load F1 (root level)
{
  customerId: 100,         // BẮT BUỘC
  level: 1,                // BẮT BUỘC cho root
  limit: 100
}

// Scenario 2: Load children của node "alice" (id=101)
{
  customerId: 100,         // Customer gốc
  ancestorId: 101,         // Node cha
  level: 2,                // Level con = level cha + 1
  limit: 100
}

// Scenario 3: Search trong F1
{
  customerId: 100,
  level: 1,
  search: "alice",         // Search nickname
  limit: 100
}
```

**Response Format:**

```typescript
{
  code: 0,                 // 0 = success
  message: "Success",
  data: {
    parent: {
      id: 100,
      nickname: "john_doe",
      balance: 5000.00,
      level: 0,
      totalDescendants: 150
    },
    children: [
      {
        id: 101,
        nickname: "alice",
        balance: 2300.00,
        level: 1,
        hasChildren: true,       // Có thể expand
        childrenCount: 5         // Số con
      },
      {
        id: 102,
        nickname: "bob",
        balance: 1800.00,
        level: 1,
        hasChildren: false,
        childrenCount: 0
      }
    ],
    total: 25,                   // Tổng children ở level này
    skip: 0,
    limit: 100
  }
}
```

**Error Response:**

```typescript
// Customer not found
{ code: 1, message: "Customer not found" }

// Server error
{ code: 1, message: "Internal server error" }
```

**Auth Header:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

---

### 5.2 API 2: Get Hierarchy Summary

**Endpoint:** `POST /api/admin/customer/hierarchy-summary`

**Mục đích:** Lấy tổng quan mạng lưới referral của 1 customer

**Khi nào gọi:**
- Khi admin chọn 1 customer → hiển thị summary card

**Request Format:**

```typescript
{
  customerId: 100          // BẮT BUỘC
}
```

**Response Format:**

```typescript
{
  code: 0,
  message: "Success",
  data: {
    customerId: 100,
    nickname: "john_doe",
    totalMembers: 150,             // Tổng F1-F7
    levelCounts: {
      level1: 25,                  // F1
      level2: 45,                  // F2
      level3: 35,                  // F3
      level4: 20,                  // F4
      level5: 15,                  // F5
      level6: 8,                   // F6
      level7: 2                    // F7
    },
    totalBalance: 125000.00        // Tổng balance ($)
  }
}
```

**Error Response:**

```typescript
{ code: 1, message: "Customer not found" }
```

---

## 6. User Flow

### Flow 1: Vào Trang Chi Tiết Khách Hàng

```
┌─────────────────────────────────────────────────────────┐
│ 1. Admin click vào 1 customer → vào trang detail       │
│    URL: /admin/customer/100                             │
│                                                         │
│ 2. Admin click tab "Network" hoặc scroll xuống         │
│    section "Hierarchy Tree"                             │
│                                                         │
│    ┌── Gọi API 2 (summary) ──┐                          │
│    │ Request: { customerId: 100 }                        │
│    │ Response: { totalMembers: 150, ... }                │
│    └─────────────────────────┘                          │
│    ↓                                                     │
│    Hiển thị Summary Card                                │
│                                                         │
│    ┌── Gọi API 1 (children, level=1) ──┐                │
│    │ Request: { customerId: 100, level: 1 }              │
│    │ Response: { children: [alice, bob, ...] }           │
│    └────────────────────────────────────┘                │
│    ↓                                                     │
│    Hiển thị Tree View (F1 collapsed)                    │
└─────────────────────────────────────────────────────────┘
```

### Flow 2: Expand Node

```
┌─────────────────────────────────────────────────────────┐
│ 1. User click ▶ trên node "alice" (id=101, level=1)     │
│                                                         │
│    ┌── Gọi API 1 (children của alice) ──┐               │
│    │ Request: { customerId: 100, ancestorId: 101,        │
│    │          level: 2 }                                  │
│    │ Response: { children: [charlie, diana, ...] }       │
│    └────────────────────────────────────┘                │
│    ↓                                                     │
│ 2. Hiển thị loading spinner ⏳                          │
│ 3. Sau khi load → hiện children list                    │
│ 4. Node "alice" chuyển ▶ → ▼                            │
└─────────────────────────────────────────────────────────┘
```

### Flow 3: Collapse Node

```
┌─────────────────────────────────────────────────────────┐
│ 1. User click ▼ trên node "alice" (đã expand)          │
│ 2. FE ẩn children (KHÔNG gọi API, data đã có)          │
│ 3. Node "alice" chuyển ▼ → ▶                            │
└─────────────────────────────────────────────────────────┘
```

### Flow 4: Deep Expand (Expand nhiều level)

```
┌─────────────────────────────────────────────────────────┐
│ 1. Expand F1: alice → load F2: [charlie, diana]         │
│ 2. Expand F2: charlie → load F3: [eve, frank]           │
│ 3. Expand F3: eve → load F4: [grace]                    │
│                                                         │
│ Mỗi lần expand = 1 API call (lazy loading)              │
└─────────────────────────────────────────────────────────┘
```

---

## 7. Data Types (TypeScript)

```typescript
// Node trong tree
interface HierarchyNode {
  id: number;              // Customer ID
  nickname: string;        // Tên hiển thị
  balance: number;         // Số dư USDT
  level: number;           // Level (1-7)
  hasChildren: boolean;    // Có thể expand không
  childrenCount: number;   // Số con trực tiếp
  
  // FE state (không từ API)
  children?: HierarchyNode[];  // Con đã load
  isExpanded?: boolean;        // Đang mở
  isLoading?: boolean;         // Đang load
}

// Summary data
interface HierarchySummary {
  customerId: number;
  nickname: string;
  totalMembers: number;
  levelCounts: {
    level1: number;
    level2: number;
    level3: number;
    level4: number;
    level5: number;
    level6: number;
    level7: number;
  };
  totalBalance: number;
}

// API response chung
interface ApiResponse<T> {
  code: number;            // 0 = success
  message: string;
  data: T;
}
```

---

## 8. UI Mockup

```
┌────────────────────────────────────────────────────────────────────┐
│  Admin Dashboard                                                   │
│  ─────────────────────────────────────────────────────────────────  │
│                                                                    │
│  Customer Detail: john_doe (ID: 100)                               │
│  ═══════════════════════════════════════════════════════════════   │
│                                                                    │
│  [Info] [Money] [Orders] [Network] [VIP] [Settings]                │
│                                                                    │
│  ┌─ Hierarchy Tree ─────────────────────────────────────────────┐  │
│  │                                                              │  │
│  │  ┌─ Summary ──────────────────────────────────────────────┐  │  │
│  │  │  Total Members: 150    │  Total Balance: $125,000       │  │  │
│  │  │  F1:25  F2:45  F3:35  F4:20  F5:15  F6:8  F7:2        │  │  │
│  │  └────────────────────────────────────────────────────────┘  │  │
│  │                                                              │  │
│  │  ▼ [100] john_doe  ──── $5,000.00                           │  │
│  │    ▶ [101] alice     ──── $2,300.00  (5 children)            │  │
│  │    ▶ [102] bob       ──── $1,800.00  (3 children)            │  │
│  │    ▼ [103] charlie   ──── $1,200.00                          │  │
│  │      ▶ [104] diana   ──── $500.00    (2 children)            │  │
│  │      ○ [105] eve     ──── $300.00                             │  │
│  │    ▶ [106] frank     ──── $750.00    (8 children)            │  │
│  │                                                              │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘

Legend:
  ▼ = Expanded (đang mở)
  ▶ = Collapsed (có thể mở)
  ○ = Leaf node (không có con)
  ⏳ = Đang loading...
```

---

## 9. Component Structure

```
admin/
└── customer/
    └── detail/                          # Existing customer detail page
        ├── index.tsx                    # Main detail page
        ├── tabs/
        │   ├── InfoTab.tsx
        │   ├── MoneyTab.tsx
        │   ├── OrdersTab.tsx
        │   ├── NetworkTab.tsx          # ← Hierarchy Tree ở đây
        │   └── ...
        └── network/                     # Hierarchy Tree components
            ├── NetworkTab.tsx           # Tab container
            ├── SummaryCard.tsx          # Summary display
            ├── HierarchyTree.tsx        # Tree container
            ├── HierarchyNode.tsx        # Single node (recursive)
            ├── EmptyState.tsx           # Empty/error display
            ├── hooks/
            │   ├── useHierarchyTree.ts  # Tree data management
            │   └── useHierarchySummary.ts
            ├── types/
            │   └── hierarchy.ts         # TypeScript interfaces
            ├── api/
            │   └── hierarchy.api.ts     # API call functions
            └── styles/
                └── hierarchy.module.css
```

---

## 10. Implementation Guidelines

### 10.1 API Calls

```typescript
// api/hierarchy.api.ts

export async function getHierarchyChildren(params: {
  customerId: number;
  ancestorId?: number;
  level: number;
  limit?: number;
  skip?: number;
  search?: string;
}): Promise<ApiResponse<{ parent: Parent; children: HierarchyNode[]; total: number }>> {
  // POST /api/admin/customer/hierarchy-children
}

export async function getHierarchySummary(
  customerId: number
): Promise<ApiResponse<HierarchySummary>> {
  // POST /api/admin/customer/hierarchy-summary
}
```

### 10.2 State Management

```typescript
// hooks/useHierarchyTree.ts

interface UseHierarchyTreeReturn {
  nodes: HierarchyNode[];        // Root nodes (F1)
  loading: boolean;              // Loading state
  error: string | null;          // Error message
  loadRoot: () => Promise<void>; // Load F1
  toggleExpand: (nodeId: number, level: number) => void; // Expand/collapse
  search: (keyword: string) => void; // Search
}
```

### 10.3 Performance Tips

1. **Virtual Scroll**: Dùng react-window hoặc react-virtualized khi > 100 nodes
2. **Debounce Search**: 300ms debounce cho search input
3. **Cache**: Giữ loaded data trong memory
4. **Lazy Load**: Chỉ load khi user click expand

### 10.4 Error Handling

```typescript
// Hiển thị error message
if (response.code !== 0) {
  toast.error(response.message);
  return;
}

// Network error
catch (error) {
  toast.error('Network error, please try again');
}
```

### 10.5 Loading States

- Page load: Skeleton/Spinner
- Expand node: Spinner trong node
- Search: Spinner trong search bar

---

## 11. Testing Checklist

- [ ] Vào trang detail → tab Network load tự động
- [ ] Summary card hiển thị đúng
- [ ] Tree view hiển thị F1
- [ ] Click expand → children load
- [ ] Click collapse → children hide
- [ ] Expand same node again → no API call
- [ ] Customer with no hierarchy → empty state
- [ ] Customer with 1000+ descendants → virtual scroll works
- [ ] Network error → error message displays
- [ ] Auth expired → redirect to login

---

## 12. Dependencies

- API endpoints đã sẵn sàng (backend team cung cấp)
- Auth token từ login system hiện có
- Customer detail page đã tồn tại
- UI component library (Ant Design / Material UI / shadcn)

---

## 13. Timeline Suggestion

| Task | Estimated Time |
|------|----------------|
| Add NetworkTab to customer detail | 0.5 day |
| SummaryCard component | 0.5 day |
| API integration (2 APIs) | 0.5 day |
| HierarchyTree + HierarchyNode | 1 day |
| Loading/error states | 0.5 day |
| Testing + bug fixes | 0.5 day |
| **Total** | **~3.5 days** |

---

## 14. Questions?

Liên hệ backend team nếu có thắc mắc về:
- API format
- Response data
- Error codes
- Auth requirements
