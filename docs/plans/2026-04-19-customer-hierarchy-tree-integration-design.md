# Customer Hierarchy Tree Integration — Design Document

> **Version:** 1.0
> **Date:** 2026-04-19
> **Scope:** Frontend (cex-admin)
> **Related docs:**
> - [2026-04-16 Backend + FE full design](./2026-04-16-customer-hierarchy-tree-design.md)
> - [2026-04-16 FE implementation guide](./2026-04-16-customer-hierarchy-tree-fe.md)

---

## 1. Overview

Thay thế section `NetworkHierarchy` (dots theo level) hiện tại trong trang chi tiết khách hàng bằng tree view có expand/collapse và lazy loading. Admin sẽ xem được toàn bộ cây phả hệ F1–F7 của 1 customer ngay trong tab **Tổng quan**, kèm summary card tổng số thành viên + tổng balance + breakdown theo level.

## 2. Goals

- Admin có thể expand từng level để khám phá mạng lưới referral.
- Mỗi node hiển thị ID, nickname, balance, VIP badge; click node → navigate sang customer detail tương ứng.
- Lazy load theo level (chỉ gọi API khi user click expand).
- Summary tổng quan (totalMembers, F1–F7 counts, totalBalance).
- Search theo nickname ở cấp F1.
- Pagination cho node có nhiều con (load-more).

## 3. Non-Goals (YAGNI)

- Virtual scroll (chỉ bật nếu thật sự lag).
- Edit hierarchy từ tree (đã có page riêng `change-hierarchy`).
- Export Excel/CSV.
- Real-time updates.
- Filter theo VIP level / balance range.
- Deep search xuyên suốt F1–F7.

## 4. Integration Location

Thay thế component `src/components/customer/OverviewTab/NetworkHierarchy.tsx` hiện tại. Thứ tự trong tab Tổng quan giữ nguyên:

```
CustomerInfo          (giữ nguyên, bao gồm cả network stats Total/VIP/F1/Level)
FinancialOverview     (giữ nguyên)
HierarchyTreeSection  (MỚI — thay NetworkHierarchy)
```

Card trong `CustomerInfo` vẫn giữ hàng stats Total/VIP/F1/Level vì đây là quick-glance stats, không phụ thuộc tree view.

## 5. File Structure

```
src/components/customer/
├── OverviewTab/
│   ├── index.tsx                              # SỬA: thay <NetworkHierarchy> → <HierarchyTreeSection>
│   ├── NetworkHierarchy.tsx                   # XÓA
│   └── HierarchyTreeSection/                  # MỚI
│       ├── index.tsx                          # Container
│       ├── HierarchySummary.tsx               # Summary card
│       ├── HierarchyTree.tsx                  # <Tree loadData> wrapper
│       ├── HierarchyNodeLabel.tsx             # 1 row node content
│       ├── useHierarchyTree.ts                # Tree state + lazy load
│       ├── useHierarchySummary.ts             # Summary fetch
│       ├── hierarchy.types.ts                 # Types
│       └── HierarchyTreeSection.less          # Styles
├── types/customer.types.ts                    # SỬA: NetworkHierarchy/NetworkSummary → optional
└── utils/constants.ts                         # SỬA: remove NETWORK_LEVELS (nếu không còn dùng)

src/services/customer.ts                       # SỬA: thêm 2 service functions
```

## 6. API Contract

2 endpoints đã có sẵn từ backend (per [BE design doc](./2026-04-16-customer-hierarchy-tree-design.md)):

### 6.1 `POST /admin/customer/hierarchy-children`

Request:
```typescript
{
  customerId: number;     // Root customer đang xem detail
  ancestorId?: number;    // Node cha — null/undefined = root (lấy F1 của customerId)
  level: number;          // Level cần lấy (1-7)
  skip?: number;          // Pagination
  limit?: number;         // Default 20, max 100
  search?: string;        // Search nickname (chỉ F1)
}
```

Response:
```typescript
{
  code: 0,
  message: "Success",
  data: {
    parent: { id, nickname, balance, level, totalDescendants },
    children: [
      { id, nickname, balance, level, hasChildren, childrenCount, isVip? }
    ],
    total, skip, limit
  }
}
```

### 6.2 `POST /admin/customer/hierarchy-summary`

Request: `{ customerId: number }`

Response:
```typescript
{
  code: 0,
  data: {
    customerId, nickname,
    totalMembers,
    levelCounts: { level1, level2, level3, level4, level5, level6, level7 },
    totalBalance
  }
}
```

## 7. Data Types

```typescript
// hierarchy.types.ts

export interface HierarchyNode {
  id: number;
  nickname: string;
  balance: number;
  level: number;
  hasChildren: boolean;
  childrenCount: number;
  isVip?: boolean;
}

export interface HierarchySummary {
  customerId: number;
  nickname: string;
  totalMembers: number;
  levelCounts: {
    level1: number; level2: number; level3: number; level4: number;
    level5: number; level6: number; level7: number;
  };
  totalBalance: number;
}

export interface HierarchyChildrenResponse {
  parent: {
    id: number; nickname: string; balance: number;
    level: number; totalDescendants: number;
  };
  children: HierarchyNode[];
  total: number;
  skip: number;
  limit: number;
}

export interface GetHierarchyChildrenParams {
  customerId: number;
  ancestorId?: number;
  level: number;
  skip?: number;
  limit?: number;
  search?: string;
}
```

## 8. Service Layer

Append vào `src/services/customer.ts` theo đúng pattern có sẵn (`request()` wrapper + `code === 0` check + error fallback):

```typescript
export const getHierarchyChildren = async (params: GetHierarchyChildrenParams) => {
  const token = localStorage.getItem('token')
  const res: any = await request({
    url: '/admin/customer/hierarchy-children',
    options: {
      method: 'post',
      data: params,
      headers: { Authorization: `Bearer ${token}` }
    }
  })
  if (res?.status === HttpStatusCode.OK && res.data?.code === 0) return res.data
  return {
    errorCode: res?.data?.code || HttpStatusCode.UNKNOW_ERROR,
    message: res?.data?.message || DEFAULT_ERROR_MESSAGE,
  }
}

export const getHierarchySummary = async (customerId: number) => {
  // Same pattern, POST /admin/customer/hierarchy-summary
}
```

## 9. State Management

Dùng **local custom hooks**, không DVA (scope hẹp, không chia sẻ cross-page). Theo pattern của `useCustomerData` / `useCustomerActions` trong folder customer.

### 9.1 `useHierarchyTree(customerId)`

Internal state type:
```typescript
interface TreeDataNode {
  key: string;                 // "node-{id}" (antd yêu cầu)
  title: React.ReactNode;      // <HierarchyNodeLabel node={nodeData} />
  isLeaf: boolean;             // = !hasChildren
  children?: TreeDataNode[];
  nodeData: HierarchyNode;     // Meta giữ lại
  hasMore?: boolean;           // Còn trang chưa load
  nextSkip?: number;
}
```

Return API:
```typescript
{
  treeData: TreeDataNode[];
  loading: boolean;
  error: string | null;
  expandedKeys: React.Key[];
  onExpand: (keys: React.Key[]) => void;
  loadRootChildren: () => Promise<void>;            // Load F1 ban đầu
  loadChildren: (node: TreeDataNode) => Promise<void>; // antd loadData callback
  loadMore: (parentKey: string) => Promise<void>;    // Load thêm trang
  expandAllF1: () => void;                           // Expand root
  setSearch: (keyword: string) => void;              // Debounce + reset F1
}
```

Key behaviors:
- **Lazy load**: Antd `<Tree loadData={...}>` tự gọi khi user click expand 1 node chưa load.
- **Cache**: Data load rồi giữ trong `treeData`. Collapse/expand lại KHÔNG gọi API.
- **Search (F1 only)**: Reset F1 với `search` param. Debounce 300ms.
- **Load more**: BE trả `total > children.length` → append pseudo-node `{ key: 'load-more-{parentKey}', title: 'Load more (N còn lại)', isLeaf: true }` vào cuối. Click pseudo-node → `loadMore()`.
- **Expand all F1**: `setExpandedKeys([rootKey])` (F1 đã load sẵn ở root).
- **Race condition**: Effect cleanup set `cancelled = true`, check trước khi `setState`.

### 9.2 `useHierarchySummary(customerId)`

Đơn giản: `useEffect` fetch 1 lần khi mount hoặc `customerId` đổi. Return `{ summary, loading, error, refetch }`.

## 10. UI Layout

```
┌─ Card title="Cây phả hệ" extra=[<ReloadOutlined/> <CollapseToggle/>] ─┐
│                                                                       │
│  ┌─ HierarchySummary ─────────────────────────────────────────────┐   │
│  │  👥 Tổng: 150   💰 $125,000                                     │   │
│  │  F1:25  F2:45  F3:35  F4:20  F5:15  F6:8  F7:2                 │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌─ Toolbar ──────────────────────────────────────────────────────┐   │
│  │  🔍 [Search nickname ở F1...]        [▼ Expand all F1]          │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌─ HierarchyTree (antd <Tree>) ──────────────────────────────────┐   │
│  │  ▶ [101] alice  ······· $2,300.00  (5 con)                      │   │
│  │  ▼ [102] bob    ······· $1,800.00                               │   │
│  │    ▶ [103] charlie ···· $500.00    (2 con)                      │   │
│  │    ○ [104] diana   ···· $300.00                                 │   │
│  │  ··· Load more (18 còn lại) ···                                 │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

### 10.1 Antd `<Tree>` props

```typescript
<Tree
  treeData={treeData}
  loadData={loadChildren}
  expandedKeys={expandedKeys}
  onExpand={onExpand}
  showLine={{ showLeafIcon: false }}
  blockNode
  selectable={false}    // Click navigate xử lý trong HierarchyNodeLabel
/>
```

### 10.2 Component responsibilities

| Component | Trách nhiệm |
|---|---|
| `HierarchyTreeSection/index.tsx` | Card wrapper, orchestrate 2 hooks, collapse toggle, compose children |
| `HierarchySummary.tsx` | Render summary card. Loading = `<Skeleton>`. Empty inline `<Empty>` |
| `HierarchyTree.tsx` | Wrap antd `<Tree>` + handle loadData/expand/loadMore events |
| `HierarchyNodeLabel.tsx` | `[ID] nickname ··· $balance  [👑 VIP badge]  (N con)`. Click → `history.push('/admin/customer/' + id)` |
| `useHierarchyTree` | Tree state + lazy load + search + load-more + expand-all |
| `useHierarchySummary` | Summary fetch với refetch |

## 11. Edge Cases & Error Handling

| Scenario | Xử lý |
|---|---|
| Customer không có F1 | `<Empty description="Chưa có thành viên cấp dưới" />` trong Tree area. Summary vẫn hiển thị với `totalMembers: 0` |
| API fail initial F1 load | `<Alert type="error" message={err.message} />` + button "Thử lại" |
| API fail khi expand 1 node | `message.error(err.message)` toast. Node giữ trạng thái collapsed, user retry bằng cách expand lại |
| Navigate đổi customerId khi đang load | Cleanup flag `cancelled` trong effect, bỏ qua response cũ |
| Search empty | Debounced 300ms. `search === ''` → reset F1 không filter |
| Node có > 1000 con | Load 100 đầu + "Load more". Không virtual scroll v1 |
| Click node = customer hiện tại | Navigate bình thường, remount CustomerDetail |
| BE không support `search` | Fallback: filter client-side trên F1 đã load (cần confirm BE) |

## 12. Styling & i18n

### 12.1 Styling

- LESS file `HierarchyTreeSection.less`.
- Reuse token màu từ `src/theme.less` (primary `#f03945`).
- Prefix class `hierarchy-tree-section__*` (BEM), KHÔNG dùng `gx-*`.
- Override `.ant-tree-node-content-wrapper` để xóa hover background default.
- Summary: antd `<Row gutter>` — 4 cột desktop, 2 cột mobile.

### 12.2 i18n

Theo convention folder customer → hardcode tiếng Việt trong JSX. Không thêm keys i18n mới.

## 13. Effort Estimate

| Task | Ước tính |
|---|---|
| Types + service | 30 phút |
| Hooks | 1 giờ |
| Presentational components | 2 giờ |
| Container + styling | 1 giờ |
| Advanced features (search, expand-all, load-more) | 1.5 giờ |
| Integration + cleanup | 30 phút |
| Manual test | 30 phút |
| **Total** | **~6.5 giờ** |

## 14. Migration Notes

- Component `NetworkHierarchy.tsx` cũ đang dùng `customerData.hierarchy` và `customerData.networkSummary` (lấy từ `getCustomerInfo`).
- Component mới **tự fetch** 2 API riêng → không phụ thuộc `customerData.hierarchy`.
- Đề xuất **giữ** `hierarchy?` và `networkSummary?` trong `CustomerDetailData` (đổi thành optional) để tránh break nếu BE vẫn trả hoặc có nơi khác dùng.
- Constant `NETWORK_LEVELS` trong `utils/constants.ts` → grep toàn repo, nếu không còn nơi dùng thì xóa.
