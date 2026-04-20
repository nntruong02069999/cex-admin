# Customer Hierarchy Tree View - Design Document

## Overview

Admin feature để hiển thị cây phân cấp referral (Customer Hierarchy) dạng tree view với lazy loading. Admin chọn 1 customer → xem toàn bộ cây con F1-F7.

## Requirements

- **Scope**: Section "Hierarchy Tree" trong trang chi tiết khách hàng (`/admin/customer/:id`)
- **Data hiển thị**: ID, nickname, balance cho mỗi node
- **UI**: Expand/Collapse tree, load từng level (lazy loading)
- **Approach**: Simple API + Frontend tree component
- **Context**: Khi admin xem chi tiết 1 customer → tab/section "Network" hiển thị cây phân cấp referral

---

## Section 1: API Design (Backend)

### 1.1 Get hierarchy children (Lazy loading)

```
POST /api/admin/customer/hierarchy-children
```

**Request Body:**
```typescript
{
  customerId: number;      // Customer ID cần xem
  ancestorId?: number;     // Node cha (null = root level)
  level?: number;          // Level cần lấy (1-7)
  skip?: number;           // Pagination
  limit?: number;          // Default 20, max 100
  search?: string;         // Search by nickname
}
```

**Response:**
```typescript
{
  code: 0,
  message: "Success",
  data: {
    parent: {
      id: number,
      nickname: string,
      balance: number,
      level: number,
      totalDescendants: number  // Tổng số con cháu
    },
    children: [
      {
        id: number,
        nickname: string,
        balance: number,
        level: number,
        hasChildren: boolean,
        childrenCount: number
      }
    ],
    total: number,
    skip: number,
    limit: number
  }
}
```

### 1.2 Get hierarchy summary

```
POST /api/admin/customer/hierarchy-summary
```

**Request Body:**
```typescript
{
  customerId: number;
}
```

**Response:**
```typescript
{
  code: 0,
  data: {
    customerId: number,
    nickname: string,
    totalMembers: number,      // Tổng F1-F7
    levelCounts: {
      level1: number,
      level2: number,
      level3: number,
      level4: number,
      level5: number,
      level6: number,
      level7: number
    },
    totalBalance: number       // Tổng balance của cây
  }
}
```

---

## Section 2: Database & Query Design

### 2.1 Existing Schema (No changes needed)

`customer_hierarchy` table đã có sẵn:
```
ancestorCustomerId  →  Customer ID (cha/ông)
descendantCustomerId →  Customer ID (con/cháu)
level               →  Khoảng cách (0-7)
```

### 2.2 Index Optimization

```sql
-- Index cho query children (đã có trong codebase)
CREATE INDEX IF NOT EXISTS idx_hierarchy_ancestor_level 
ON customer_hierarchy("ancestorCustomerId", level);

-- Index cho query parent
CREATE INDEX IF NOT EXISTS idx_hierarchy_descendant 
ON customer_hierarchy("descendantCustomerId");

-- Composite index cho join với customer
CREATE INDEX IF NOT EXISTS idx_hierarchy_ancestor_desc 
ON customer_hierarchy("ancestorCustomerId", "descendantCustomerId", level);
```

### 2.3 Query: Get children của 1 node

```sql
-- Lấy direct children (level + 1)
SELECT 
  ch."descendantCustomerId" as id,
  c.nickname,
  cm.balance,
  ch.level,
  EXISTS(
    SELECT 1 FROM customer_hierarchy ch2 
    WHERE ch2."ancestorCustomerId" = ch."descendantCustomerId" 
    AND ch2.level = ch.level + 1
  ) as "hasChildren",
  (
    SELECT COUNT(*) FROM customer_hierarchy ch3
    WHERE ch3."ancestorCustomerId" = ch."descendantCustomerId"
    AND ch3.level > 0
  ) as "childrenCount"
FROM customer_hierarchy ch
JOIN customer c ON c.id = ch."descendantCustomerId"
LEFT JOIN customer_money cm ON cm."customerId" = c.id
WHERE ch."ancestorCustomerId" = :customerId
  AND ch.level = :targetLevel
ORDER BY ch."descendantCustomerId"
LIMIT :limit OFFSET :skip;
```

### 2.4 Prisma Query Pattern

```typescript
// Trong handler
const [children, total] = await prismaClient.$transaction([
  prismaClient.$queryRaw<HierarchyNode[]>`
    SELECT 
      ch."descendantCustomerId" as id,
      c.nickname,
      cm.balance,
      ch.level,
      EXISTS(
        SELECT 1 FROM customer_hierarchy ch2 
        WHERE ch2."ancestorCustomerId" = ch."descendantCustomerId" 
        AND ch2.level = ch.level + 1
      ) as "hasChildren",
      (
        SELECT COUNT(*) FROM customer_hierarchy ch3
        WHERE ch3."ancestorCustomerId" = ch."descendantCustomerId"
        AND ch3.level > 0
      ) as "childrenCount"
    FROM customer_hierarchy ch
    JOIN customer c ON c.id = ch."descendantCustomerId"
    LEFT JOIN customer_money cm ON cm."customerId" = c.id
    WHERE ch."ancestorCustomerId" = ${customerId}
      AND ch.level = ${targetLevel}
    ORDER BY ch."descendantCustomerId"
    LIMIT ${limit} OFFSET ${skip}
  `,
  prismaClient.customerHierarchy.count({
    where: {
      ancestorCustomerId: customerId,
      level: targetLevel
    }
  })
]);
```

---

## Section 3: Frontend Design

### 3.1 Component Structure

```
admin/
├── customer/
│   └── hierarchy-tree/
│       ├── HierarchyTreePage.tsx       # Main page
│       ├── HierarchyTree.tsx           # Tree component
│       ├── HierarchyNode.tsx           # Single node
│       ├── HierarchySummary.tsx        # Summary card
│       └── hooks/
│           └── useHierarchyTree.ts     # Data fetching hook
```

### 3.2 Tree Component Props

```typescript
interface HierarchyTreeProps {
  customerId: number;
  onNodeClick?: (node: HierarchyNode) => void;
}

interface HierarchyNode {
  id: number;
  nickname: string;
  balance: number;
  level: number;
  hasChildren: boolean;
  childrenCount: number;
  children?: HierarchyNode[];  // Loaded when expanded
  isExpanded?: boolean;
  isLoading?: boolean;
}
```

### 3.3 State Management

```typescript
// useHierarchyTree hook
const useHierarchyTree = (customerId: number) => {
  const [tree, setTree] = useState<HierarchyNode[]>([]);
  const [loading, setLoading] = useState(false);

  const loadChildren = async (parentId: number, level: number) => {
    // API call to /admin/customer/hierarchy-children
    // Update tree state with loaded children
  };

  const toggleExpand = async (nodeId: number) => {
    if (!node.children && node.hasChildren) {
      await loadChildren(nodeId, node.level + 1);
    }
    // Toggle isExpanded
  };

  return { tree, loading, toggleExpand, loadChildren };
};
```

### 3.4 UI Mockup (Tree Node)

```
▼ [1234] john_doe  ──── $5,000.00
  ▶ [1235] alice     ──── $2,300.00  (5 children)
  ▼ [1236] bob       ──── $1,800.00
    ▶ [1237] charlie ──── $500.00    (2 children)
    ▶ [1238] diana   ──── $300.00    (0 children)
  ▶ [1239] eve       ──── $750.00    (12 children)
```

### 3.5 Library Recommendation

**React Arborist** hoặc **Ant Design Tree**
- Virtual scroll cho performance
- Built-in expand/collapse
- Lazy loading support

---

## Section 4: Error Handling & Performance

### 4.1 Error Cases

| Scenario | HTTP Status | Response |
|----------|-------------|----------|
| Customer không tồn tại | 404 | `{ code: 1, message: "Customer not found" }` |
| Không có quyền xem | 403 | `{ code: 1, message: "Unauthorized" }` |
| Level > 7 | 400 | `{ code: 1, message: "Max level is 7" }` |
| Query timeout | 500 | `{ code: 1, message: "Request timeout" }` |

### 4.2 Performance Optimizations

**Backend:**
- Redis cache cho hierarchy summary (TTL 5 phút)
- Batch query: Lấy children + count trong 1 transaction
- Index như đã design ở Section 2
- Rate limiting: 10 req/s per admin

**Frontend:**
- Virtual scroll khi > 100 nodes visible
- Debounce search input (300ms)
- Cache loaded nodes trong memory
- Skeleton loading khi đang fetch

### 4.3 Caching Strategy

```typescript
// Cache key pattern
const cacheKey = `hierarchy:children:${customerId}:${level}:${skip}:${limit}`;

// Cache hierarchy summary (longer TTL)
const summaryKey = `hierarchy:summary:${customerId}`;
```

### 4.4 Rate Limiting

```typescript
// Trong route config
preHandler: [
  userMidlleware,
  rateLimit({ max: 10, timeWindow: '1 minute' })
]
```

---

## File Structure

### Backend (BE)
```
src/
├── controller/
│   └── admin/
│       └── customer/
│           ├── hierarchy-children.ts    # API get children
│           └── hierarchy-summary.ts     # API get summary
├── schemas/
│   └── admin/
│       └── customer/
│           ├── hierarchy-children.schema.ts
│           └── hierarchy-summary.schema.ts
└── services/
    └── CustomerHierarchy.ts            # Existing service (update if needed)
```

### Frontend (FE) - Separate project
```
admin/
├── customer/
│   └── hierarchy-tree/
│       ├── HierarchyTreePage.tsx
│       ├── HierarchyTree.tsx
│       ├── HierarchyNode.tsx
│       ├── HierarchySummary.tsx
│       └── hooks/
│           └── useHierarchyTree.ts
```

---

## Implementation Order

1. **Backend API** (hierarchy-children, hierarchy-summary)
2. **Schema definitions** (Zod schemas)
3. **Index optimization** (SQL migration)
4. **Frontend hook** (useHierarchyTree)
5. **Frontend components** (HierarchyTree, HierarchyNode)
6. **Frontend page** (HierarchyTreePage)
7. **Integration & testing**
