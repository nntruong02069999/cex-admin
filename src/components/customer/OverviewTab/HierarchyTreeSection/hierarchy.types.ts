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
