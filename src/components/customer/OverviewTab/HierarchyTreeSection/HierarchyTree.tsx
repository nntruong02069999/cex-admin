import React from 'react';
import { Tree, Spin, Alert, Empty, Button } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import type { TreeDataNode } from './useHierarchyTree';
import type { EventDataNode } from 'antd/lib/tree';

interface HierarchyTreeProps {
  treeData: TreeDataNode[];
  expandedKeys: React.Key[];
  loading: boolean;
  error: string | null;
  onExpand: (keys: React.Key[]) => void;
  onLoadData: (node: EventDataNode) => Promise<void>;
  onLoadMore: (parentKey: string) => void;
  onRetry: () => void;
}

export const HierarchyTree: React.FC<HierarchyTreeProps> = ({
  treeData,
  expandedKeys,
  loading,
  error,
  onExpand,
  onLoadData,
  onLoadMore,
  onRetry,
}) => {
  if (loading && treeData.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error && treeData.length === 0) {
    return (
      <Alert
        type="error"
        showIcon
        message={error}
        action={
          <Button icon={<ReloadOutlined />} onClick={onRetry}>
            Thử lại
          </Button>
        }
      />
    );
  }

  if (treeData.length === 0) {
    return <Empty description="Chưa có thành viên cấp dưới" />;
  }

  const handleLoadMoreClick = (key: string) => {
    const parentKey = key.replace('load-more-', '');
    onLoadMore(parentKey);
  };

  const processTreeData = (data: TreeDataNode[]): any[] => {
    return data.map(node => {
      const processedNode: any = {
        ...node,
      };

      if (node.children) {
        processedNode.children = processTreeData(node.children);
      }

      if (node.hasMore) {
        processedNode.children = processedNode.children || [];
        processedNode.children.push({
          key: `load-more-${node.key}`,
          title: (
            <span
              className="hierarchy-tree-section__load-more"
              onClick={() => handleLoadMoreClick(`load-more-${node.key}`)}
            >
              Load more...
            </span>
          ),
          isLeaf: true,
          selectable: false,
        });
      }

      return processedNode;
    });
  };

  return (
    <Tree
      treeData={processTreeData(treeData)}
      loadData={onLoadData}
      expandedKeys={expandedKeys}
      onExpand={onExpand}
      showLine={{ showLeafIcon: false }}
      blockNode
      selectable={false}
    />
  );
};
