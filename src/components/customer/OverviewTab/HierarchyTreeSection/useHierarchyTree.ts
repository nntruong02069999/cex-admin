import { useEffect, useState, useCallback, ReactNode } from 'react'
import { getHierarchyChildren } from '@src/services/customer'
import type { HierarchyNode, GetHierarchyChildrenParams, HierarchyChildrenResponse } from './hierarchy.types'

export interface TreeDataNode {
  key: string;
  title: ReactNode;
  isLeaf: boolean;
  children?: TreeDataNode[];
  nodeData: HierarchyNode;
  hasMore?: boolean;
  nextSkip?: number;
}

const DEFAULT_LIMIT = 20

export const useHierarchyTree = (customerId: number, renderLabel: (node: HierarchyNode) => ReactNode) => {
  const [treeData, setTreeData] = useState<TreeDataNode[]>([])
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchKeyword, setSearchKeyword] = useState('')

  const toTreeNode = useCallback((n: HierarchyNode, hasMore = false, nextSkip = 0): TreeDataNode => ({
    key: `node-${n.id}`,
    title: renderLabel(n),
    isLeaf: !n.hasChildren,
    nodeData: n,
    hasMore,
    nextSkip,
  }), [renderLabel])

  const updateNode = useCallback((data: TreeDataNode[], key: string, updater: (n: TreeDataNode) => TreeDataNode): TreeDataNode[] => {
    return data.map(n => {
      if (n.key === key) return updater(n)
      if (n.children) return { ...n, children: updateNode(n.children, key, updater) }
      return n
    })
  }, [])

  const findNode = useCallback((data: TreeDataNode[], key: string): TreeDataNode | null => {
    for (const n of data) {
      if (n.key === key) return n
      if (n.children) {
        const found = findNode(n.children, key)
        if (found) return found
      }
    }
    return null
  }, [])

  const loadRootChildren = useCallback(async () => {
    if (!customerId) return
    setLoading(true)
    setError(null)

    const params: GetHierarchyChildrenParams = {
      customerId,
      level: 1,
      skip: 0,
      limit: DEFAULT_LIMIT,
      search: searchKeyword || undefined,
    }

    const res = await getHierarchyChildren(params)

    if ('errorCode' in res) {
      setError(res.message)
      setTreeData([])
    } else {
      const { children, total } = res.data
      const hasMore = children.length < total
      const nextSkip = hasMore ? children.length : 0
      setTreeData(children.map(n => toTreeNode(n, hasMore, nextSkip)))
    }

    setLoading(false)
  }, [customerId, searchKeyword, toTreeNode])

  const loadChildren = useCallback(async (node: TreeDataNode) => {
    if (!customerId || node.nodeData.level >= 7) return

    const params: GetHierarchyChildrenParams = {
      customerId,
      ancestorId: node.nodeData.id,
      level: node.nodeData.level + 1,
      skip: 0,
      limit: DEFAULT_LIMIT,
    }

    const res = await getHierarchyChildren(params)

    if ('errorCode' in res) {
      throw new Error(res.message)
    } else {
      const { children, total } = res.data
      const hasMore = children.length < total
      const nextSkip = hasMore ? children.length : 0

      setTreeData(prev => updateNode(prev, node.key, n => ({
        ...n,
        children: children.map(child => toTreeNode(child, hasMore, nextSkip)),
      })))
    }
  }, [customerId, toTreeNode, updateNode])

  const loadMore = useCallback(async (parentKey: string) => {
    const parentNode = findNode(treeData, parentKey)
    if (!parentNode || !customerId) return

    const currentSkip = parentNode.nextSkip || 0
    const isRoot = parentNode.nodeData.level === 1

    const params: GetHierarchyChildrenParams = {
      customerId,
      ancestorId: isRoot ? undefined : parentNode.nodeData.id,
      level: parentNode.nodeData.level,
      skip: currentSkip,
      limit: DEFAULT_LIMIT,
      search: isRoot ? (searchKeyword || undefined) : undefined,
    }

    const res = await getHierarchyChildren(params)

    if ('errorCode' in res) {
      throw new Error(res.message)
    } else {
      const { children, total } = res.data
      const newSkip = currentSkip + children.length
      const hasMore = newSkip < total

      setTreeData(prev => updateNode(prev, parentKey, n => {
        const existingChildren = n.children?.filter(c => !c.key.startsWith('load-more-')) || []
        const newChildren = children.map(child => toTreeNode(child, hasMore, newSkip + (hasMore ? children.length : 0)))
        return {
          ...n,
          children: [...existingChildren, ...newChildren],
          hasMore,
          nextSkip: hasMore ? newSkip : undefined,
        }
      }))
    }
  }, [customerId, findNode, treeData, toTreeNode, updateNode, searchKeyword])

  const expandAllF1 = useCallback(() => {
    setExpandedKeys(treeData.map(n => n.key))
  }, [treeData])

  useEffect(() => {
    const timer = setTimeout(() => {
      loadRootChildren()
    }, 300)
    return () => clearTimeout(timer)
  }, [searchKeyword, customerId])

  useEffect(() => {
    loadRootChildren()
  }, [customerId])

  return {
    treeData,
    expandedKeys,
    loading,
    error,
    onExpand: setExpandedKeys,
    loadChildren,
    loadMore,
    expandAllF1,
    setSearch: setSearchKeyword,
    refetch: loadRootChildren,
  }
}
