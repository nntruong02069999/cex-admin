# Customer Hierarchy Tree Integration — Implementation Plan

> **Version:** 1.0
> **Date:** 2026-04-19
> **Design doc:** [2026-04-19-customer-hierarchy-tree-integration-design.md](./2026-04-19-customer-hierarchy-tree-integration-design.md)
> **Total effort:** ~6.5 giờ

Plan này chia thành 7 bước tuần tự. Mỗi bước có review checkpoint — xác nhận trước khi qua bước kế tiếp.

---

## Step 1 — Types & Service Layer (~30 phút)

### 1.1 Tạo folder + file types

Tạo: `src/components/customer/OverviewTab/HierarchyTreeSection/hierarchy.types.ts`

Nội dung:
```typescript
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

export interface HierarchyChildrenParent {
  id: number;
  nickname: string;
  balance: number;
  level: number;
  totalDescendants: number;
}

export interface HierarchyChildrenResponse {
  parent: HierarchyChildrenParent;
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

### 1.2 Thêm 2 service functions

Append vào cuối `src/services/customer.ts`:

```typescript
import type {
  GetHierarchyChildrenParams,
  HierarchyChildrenResponse,
  HierarchySummary,
} from '@src/components/customer/OverviewTab/HierarchyTreeSection/hierarchy.types'

export const getHierarchyChildren = async (params: GetHierarchyChildrenParams) => {
  const token = localStorage.getItem('token')
  const res: any = await request({
    url: '/admin/customer/hierarchy-children',
    options: {
      method: 'post',
      data: params,
      headers: { Authorization: `Bearer ${token}` },
    },
  })
  if (res?.status === HttpStatusCode.OK && res.data?.code === 0) {
    return res.data as { code: 0; message: string; data: HierarchyChildrenResponse }
  }
  return {
    errorCode: res?.data?.code || HttpStatusCode.UNKNOW_ERROR,
    message: res?.data?.message || DEFAULT_ERROR_MESSAGE,
  }
}

export const getHierarchySummary = async (customerId: number) => {
  const token = localStorage.getItem('token')
  const res: any = await request({
    url: '/admin/customer/hierarchy-summary',
    options: {
      method: 'post',
      data: { customerId },
      headers: { Authorization: `Bearer ${token}` },
    },
  })
  if (res?.status === HttpStatusCode.OK && res.data?.code === 0) {
    return res.data as { code: 0; message: string; data: HierarchySummary }
  }
  return {
    errorCode: res?.data?.code || HttpStatusCode.UNKNOW_ERROR,
    message: res?.data?.message || DEFAULT_ERROR_MESSAGE,
  }
}
```

### Checkpoint 1

- [ ] `hierarchy.types.ts` có đủ 5 types.
- [ ] 2 service functions có trong `customer.ts`.
- [ ] `yarn type-check` pass.
- [ ] `yarn lint` pass.

---

## Step 2 — Hooks (~1 giờ)

### 2.1 `useHierarchySummary.ts`

Path: `src/components/customer/OverviewTab/HierarchyTreeSection/useHierarchySummary.ts`

```typescript
import { useEffect, useState, useCallback } from 'react'
import { getHierarchySummary } from '@src/services/customer'
import type { HierarchySummary } from './hierarchy.types'

export const useHierarchySummary = (customerId: number) => {
  const [summary, setSummary] = useState<HierarchySummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSummary = useCallback(async () => {
    if (!customerId) return
    setLoading(true)
    setError(null)
    const res = await getHierarchySummary(customerId)
    if ('errorCode' in res) {
      setError(res.message)
      setSummary(null)
    } else {
      setSummary(res.data)
    }
    setLoading(false)
  }, [customerId])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (!cancelled) await fetchSummary()
    })()
    return () => { cancelled = true }
  }, [fetchSummary])

  return { summary, loading, error, refetch: fetchSummary }
}
```

### 2.2 `useHierarchyTree.ts`

Path: `src/components/customer/OverviewTab/HierarchyTreeSection/useHierarchyTree.ts`

Core responsibilities:
- State: `treeData`, `expandedKeys`, `loading`, `error`, `searchKeyword`.
- `loadRootChildren()`: gọi API với `level=1`, `customerId`, `search`, set root level.
- `loadChildren(node)`: gọi API với `ancestorId=node.id`, `level=node.level+1`, mutate tree (immutable update bằng walk + cloneDeep hoặc recursive map).
- `loadMore(parentKey)`: gọi API với `skip=nextSkip`, `ancestorId=parent.id`, append children + update `hasMore/nextSkip`.
- `expandAllF1()`: `setExpandedKeys(treeData.map(n => n.key))`.
- `setSearch(keyword)`: debounce 300ms → trigger `loadRootChildren` với `search` param mới.
- Cleanup: flag `cancelled` trong effect.

Pseudo:
```typescript
export const useHierarchyTree = (customerId: number) => {
  const [treeData, setTreeData] = useState<TreeDataNode[]>([])
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchKeyword, setSearchKeyword] = useState('')

  // Convert API node → TreeDataNode
  const toTreeNode = (n: HierarchyNode, renderLabel: (n: HierarchyNode) => ReactNode): TreeDataNode => ({
    key: `node-${n.id}`,
    title: renderLabel(n),
    isLeaf: !n.hasChildren,
    nodeData: n,
  })

  // Helper: update 1 node in tree by key (recursive)
  const updateNode = (data: TreeDataNode[], key: string, updater: (n: TreeDataNode) => TreeDataNode): TreeDataNode[] =>
    data.map(n => {
      if (n.key === key) return updater(n)
      if (n.children) return { ...n, children: updateNode(n.children, key, updater) }
      return n
    })

  const loadRootChildren = useCallback(async () => { /* ... */ }, [customerId, searchKeyword])
  const loadChildren = useCallback(async (node: TreeDataNode) => { /* ... */ }, [customerId])
  const loadMore = useCallback(async (parentKey: string) => { /* ... */ }, [customerId])
  const expandAllF1 = useCallback(() => {
    setExpandedKeys(treeData.map(n => n.key))
  }, [treeData])

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { loadRootChildren() }, 300)
    return () => clearTimeout(t)
  }, [searchKeyword])

  // Initial load
  useEffect(() => { loadRootChildren() }, [customerId])

  return {
    treeData, expandedKeys, loading, error,
    onExpand: setExpandedKeys,
    loadChildren, loadMore, expandAllF1,
    setSearch: setSearchKeyword,
    refetch: loadRootChildren,
  }
}
```

### Checkpoint 2

- [ ] 2 hooks compile không lỗi.
- [ ] Cleanup `cancelled` flag trong tất cả effects.
- [ ] Debounce search hoạt động (kiểm tra console.log API calls).
- [ ] `yarn type-check` pass.

---

## Step 3 — Presentational Components (~2 giờ)

### 3.1 `HierarchyNodeLabel.tsx`

Render 1 row:
```
[101] alice · · · · · $2,300.00  [👑]  (5 con)
```

Props: `{ node: HierarchyNode; onNavigate: (id: number) => void }`

Use antd `<Space>` + `<Tag>` (VIP badge nếu `isVip`) + `<Typography.Text>`.

Click handler dùng `<a onClick>` để navigate. Import `useHistory` từ `react-router-dom`.

### 3.2 `HierarchySummary.tsx`

Props: `{ summary: HierarchySummary | null; loading: boolean; error: string | null }`

Render:
- Loading → `<Skeleton active paragraph={{ rows: 2 }} />`
- Error → `<Alert type="error" showIcon message={error} />`
- Null + !loading → `<Empty description="Không có dữ liệu" />`
- Success → 2 rows:
  - Row 1 (stats lớn): Total members + Total balance (format dollars).
  - Row 2 (level breakdown): F1 · F2 · F3 · F4 · F5 · F6 · F7 counts dạng chip.

Dùng `formatNumber` + `formatCurrency` từ `src/components/customer/utils/formatters`.

### 3.3 `HierarchyTree.tsx`

Props:
```typescript
{
  treeData: TreeDataNode[];
  expandedKeys: React.Key[];
  loading: boolean;
  error: string | null;
  onExpand: (keys: React.Key[]) => void;
  onLoadData: (node: TreeDataNode) => Promise<void>;
  onLoadMore: (parentKey: string) => void;
  onRetry: () => void;
}
```

Render:
- Loading initial → `<Spin>` wrapper.
- Error → `<Alert type="error">` + "Thử lại" button.
- `treeData.length === 0` → `<Empty description="Chưa có thành viên cấp dưới" />`.
- Otherwise:
  ```tsx
  <Tree
    treeData={treeData}
    loadData={onLoadData}
    expandedKeys={expandedKeys}
    onExpand={onExpand}
    showLine={{ showLeafIcon: false }}
    blockNode
    selectable={false}
  />
  ```

Load-more pseudo-node: khi render tree data trong `useHierarchyTree`, nếu node có `hasMore === true`, append 1 pseudo child với `key: 'load-more-{parentKey}'`, `title: <a onClick>Load more (N còn lại)</a>`, `isLeaf: true`.

### Checkpoint 3

- [ ] 3 components tạo xong, render đúng mock.
- [ ] Click node label → `history.push` sang `/admin/customer/:id`.
- [ ] Click "Load more" gọi đúng `onLoadMore` với parent key.
- [ ] `yarn type-check` pass.

---

## Step 4 — Container + Styling (~1 giờ)

### 4.1 `HierarchyTreeSection/index.tsx`

```tsx
interface Props {
  customerId: number
}

const HierarchyTreeSection: React.FC<Props> = ({ customerId }) => {
  const [collapsed, setCollapsed] = useState(false)
  const [searchInput, setSearchInput] = useState('')

  const summary = useHierarchySummary(customerId)
  const tree = useHierarchyTree(customerId)

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value)
    tree.setSearch(e.target.value)
  }

  return (
    <Card
      title="Cây phả hệ (Hierarchy)"
      className="overview-section hierarchy-tree-section"
      extra={
        <Space>
          <Button icon={<ReloadOutlined />} size="small" onClick={() => {
            summary.refetch()
            tree.refetch()
          }} />
          <Button
            type="text"
            size="small"
            icon={collapsed ? <DownOutlined /> : <UpOutlined />}
            onClick={() => setCollapsed(v => !v)}
          />
        </Space>
      }
    >
      {!collapsed && (
        <>
          <HierarchySummary
            summary={summary.summary}
            loading={summary.loading}
            error={summary.error}
          />
          <Row gutter={8} className="hierarchy-tree-section__toolbar">
            <Col flex="auto">
              <Input
                placeholder="Tìm theo nickname ở F1..."
                prefix={<SearchOutlined />}
                value={searchInput}
                onChange={handleSearchChange}
                allowClear
              />
            </Col>
            <Col>
              <Button onClick={tree.expandAllF1} disabled={!tree.treeData.length}>
                Mở rộng F1
              </Button>
            </Col>
          </Row>
          <HierarchyTree
            treeData={tree.treeData}
            expandedKeys={tree.expandedKeys}
            loading={tree.loading}
            error={tree.error}
            onExpand={tree.onExpand}
            onLoadData={tree.loadChildren}
            onLoadMore={tree.loadMore}
            onRetry={tree.refetch}
          />
        </>
      )}
    </Card>
  )
}
```

### 4.2 `HierarchyTreeSection.less`

```less
.hierarchy-tree-section {
  &__toolbar {
    margin: 16px 0;
  }

  .ant-tree {
    background: transparent;

    .ant-tree-node-content-wrapper:hover {
      background-color: rgba(240, 57, 69, 0.06);
    }
  }

  &__node-label {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 4px 0;

    &__id {
      color: #8c8c8c;
      font-family: monospace;
      font-size: 12px;
    }

    &__nickname {
      font-weight: 600;
      cursor: pointer;

      &:hover {
        color: #f03945;
      }
    }

    &__balance {
      color: #52c41a;
      font-weight: 500;
    }

    &__count {
      color: #8c8c8c;
      font-size: 12px;
    }
  }

  &__load-more {
    color: #f03945;
    cursor: pointer;
    font-style: italic;
  }
}
```

Import LESS trong `HierarchyTreeSection/index.tsx`: `import './HierarchyTreeSection.less'`.

### Checkpoint 4

- [ ] Container render đủ Summary + Toolbar + Tree.
- [ ] Collapse toggle hoạt động.
- [ ] Reload button trigger cả summary + tree refetch.
- [ ] Styling trông sạch, khớp với các section khác trong OverviewTab.

---

## Step 5 — Advanced Features Finalization (~1.5 giờ)

Bước này hoàn thiện các feature đã scaffold trong Step 2–4.

### 5.1 Search flow end-to-end

- [ ] User gõ → `searchInput` update ngay → hook `setSearch(keyword)`.
- [ ] Hook debounce 300ms → gọi `loadRootChildren()` với `search` param.
- [ ] API response → reset `treeData` hoàn toàn (F1 mới), collapse tất cả.
- [ ] Clear input → trở về F1 đầy đủ.

### 5.2 Expand all F1

- [ ] Button click → `setExpandedKeys(treeData.map(n => n.key))`.
- [ ] Nếu node có `hasChildren` nhưng chưa load children → antd Tree tự trigger `loadData` cho từng node khi expanded. KIỂM TRA xem có trigger đúng không — nếu không, cần manually `Promise.all(treeData.filter(n => !n.children && !n.isLeaf).map(loadChildren))`.

### 5.3 Load more pagination

- [ ] Default `limit = 20` (đúng theo BE default).
- [ ] Trong `loadChildren` / `loadRootChildren`: sau khi nhận response, tính `hasMore = children.length + skip < total`, `nextSkip = skip + limit`.
- [ ] Append pseudo node `{ key: 'load-more-{parentKey}', title: renderLoadMore(remaining), isLeaf: true }` vào cuối children list.
- [ ] Click pseudo node → `loadMore(parentKey)` → gọi API với `skip = nextSkip`, append vào children list của parent (replace pseudo node).

### 5.4 Error toasts

- [ ] Expand failure → `message.error(err.message)`. Node giữ state chưa expand.
- [ ] Load-more failure → `message.error`, pseudo node vẫn còn để retry.

### Checkpoint 5

- [ ] Search nickname thật trên BE → thấy kết quả filter.
- [ ] "Mở rộng F1" → tất cả F1 nodes expanded, children được load.
- [ ] Node có > 20 con → thấy "Load more", click → append children.
- [ ] Tất cả error paths → có toast/UI hợp lý.

---

## Step 6 — Integration & Cleanup (~30 phút)

### 6.1 Sửa `OverviewTab/index.tsx`

```diff
- import NetworkHierarchy from "./NetworkHierarchy";
+ import HierarchyTreeSection from "./HierarchyTreeSection";
```

```diff
  <FinancialOverview customerMoney={customerData.customerMoney} />

-  <NetworkHierarchy
-    hierarchy={customerData.hierarchy}
-    networkSummary={customerData.networkSummary}
-  />
+  <HierarchyTreeSection customerId={customerId} />
```

### 6.2 Xóa `NetworkHierarchy.tsx`

Grep full repo trước để confirm không còn nơi dùng:
```bash
rg "NetworkHierarchy" src/
```

Nếu chỉ còn trong `OverviewTab/index.tsx` (đã thay) → xóa file `NetworkHierarchy.tsx`.

### 6.3 Dọn types

Sửa `src/components/customer/types/customer.types.ts`:
```diff
  export interface CustomerDetailData {
    customer: Customer;
    customerMoney: CustomerMoney;
-   hierarchy: NetworkHierarchy;
-   networkSummary: NetworkSummary;
+   hierarchy?: NetworkHierarchy;
+   networkSummary?: NetworkSummary;
    inviter?: Inviter;
    customerVip?: CustomerVip;
  }
```

(Giữ optional để tránh break các chỗ khác nếu BE vẫn trả về.)

### 6.4 Dọn constants

Grep `NETWORK_LEVELS` full repo. Nếu chỉ `NetworkHierarchy.tsx` dùng → xóa constant khỏi `src/components/customer/utils/constants.ts`.

```bash
rg "NETWORK_LEVELS" src/
```

### 6.5 Impact analysis (per CLAUDE.md)

Chạy trước khi commit (nếu GitNexus index fresh):
```
gitnexus_impact({ target: "NetworkHierarchy", direction: "upstream" })
gitnexus_detect_changes({ scope: "staged" })
```

### Checkpoint 6

- [ ] `OverviewTab/index.tsx` build OK.
- [ ] `NetworkHierarchy.tsx` đã xóa, không còn import còn sót.
- [ ] `yarn type-check` pass.
- [ ] `yarn lint` pass.
- [ ] `yarn build` pass.

---

## Step 7 — Manual Test (~30 phút)

### Test cases

- [ ] **T1**: Vào trang `/admin/customer/<id>` → tab Tổng quan auto load summary + F1.
- [ ] **T2**: Customer không có F1 → thấy Empty state "Chưa có thành viên cấp dưới". Summary hiển thị totalMembers: 0.
- [ ] **T3**: Customer có cây sâu → expand F1 → F2 → F3 → F4, mỗi lần = 1 API call, collapse rồi expand lại KHÔNG gọi API.
- [ ] **T4**: Search "alice" ở F1 → debounce 300ms → thấy filter đúng.
- [ ] **T5**: Clear search → F1 full list trở lại.
- [ ] **T6**: Button "Mở rộng F1" → tất cả F1 nodes expanded.
- [ ] **T7**: Click vào nickname → navigate sang customer detail của node đó, tree reload với customerId mới.
- [ ] **T8**: Node có > 20 con → thấy "Load more (N còn lại)", click → append thêm children, pseudo-node replace.
- [ ] **T9**: Ngắt mạng → API fail → thấy error Alert + nút "Thử lại".
- [ ] **T10**: Customer có `isVip` trong F1 → badge VIP 👑 hiển thị.
- [ ] **T11**: Collapse section → Summary + Tree ẩn. Expand lại → hiện lại đúng state (không reload).
- [ ] **T12**: Reload button → refetch cả summary + tree.

### Regression

- [ ] `CustomerInfo` vẫn hiển thị đúng Total / VIP / F1 / Level (không bị ảnh hưởng).
- [ ] `FinancialOverview` vẫn render đúng.
- [ ] Các tab khác (Nạp/Rút, Giao dịch, VIP, Lịch sử cược) vẫn hoạt động.

### Checkpoint 7

- [ ] Tất cả 12 test cases pass.
- [ ] Regression check pass.
- [ ] Screenshot UI gửi kèm PR.

---

## Follow-up Tasks (Post-MVP)

Ghi chú để làm sau khi cần:
- [ ] Virtual scroll (`<Tree virtual height={400}>`) khi user báo lag.
- [ ] i18n keys (nếu decide refactor toàn folder customer).
- [ ] Export tree → Excel.
- [ ] Deep search (F1–F7).
- [ ] Badge "online" cho từng node (realtime socket).
