import React from 'react';
import { Space, Tag, Typography } from 'antd';
import { useHistory } from 'react-router-dom';
import { CrownOutlined } from '@ant-design/icons';
import type { HierarchyNode } from './hierarchy.types';
import { formatCurrency } from '@src/components/customer/utils/formatters';

interface HierarchyNodeLabelProps {
  node: HierarchyNode;
}

export const HierarchyNodeLabel: React.FC<HierarchyNodeLabelProps> = ({ node }) => {
  const history = useHistory();

  const handleClick = () => {
    history.push(`/customer/${node.id}`);
  };

  return (
    <span className="hierarchy-tree-section__node-label">
      <span className="hierarchy-tree-section__node-label__id">[{node.id}]</span>
      <Typography.Text
        className="hierarchy-tree-section__node-label__nickname"
        onClick={handleClick}
      >
        {node.nickname}
      </Typography.Text>
      <span className="hierarchy-tree-section__node-label__balance">
        {formatCurrency(node.balance)}
      </span>
      {node.isVip && (
        <Tag color="gold" icon={<CrownOutlined />}>
          VIP
        </Tag>
      )}
      {node.hasChildren && (
        <span className="hierarchy-tree-section__node-label__count">
          ({node.childrenCount} con)
        </span>
      )}
    </span>
  );
};
