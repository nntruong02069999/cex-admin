import React, { useState, ChangeEvent, useCallback } from 'react';
import { Card, Space, Button, Row, Col, Input, message } from 'antd';
import { ReloadOutlined, DownOutlined, UpOutlined, SearchOutlined } from '@ant-design/icons';
import type { EventDataNode } from 'antd/lib/tree';
import { useHierarchySummary } from './useHierarchySummary';
import { useHierarchyTree, TreeDataNode } from './useHierarchyTree';
import { HierarchySummary } from './HierarchySummary';
import { HierarchyTree } from './HierarchyTree';
import { HierarchyNodeLabel } from './HierarchyNodeLabel';
import type { HierarchyNode } from './hierarchy.types';
import './HierarchyTreeSection.less';

interface HierarchyTreeSectionProps {
  customerId: number;
}

const HierarchyTreeSection: React.FC<HierarchyTreeSectionProps> = ({ customerId }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  const renderNodeLabel = useCallback((node: HierarchyNode) => {
    return <HierarchyNodeLabel node={node} />;
  }, []);

  const summary = useHierarchySummary(customerId);
  const tree = useHierarchyTree(customerId, renderNodeLabel);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
    tree.setSearch(value);
  };

  const handleReload = () => {
    summary.refetch();
    tree.refetch();
  };

  const handleLoadData = async (node: EventDataNode) => {
    try {
      const treeNode = node as unknown as TreeDataNode;
      await tree.loadChildren(treeNode);
    } catch (err: any) {
      message.error(err?.message || 'Không thể tải danh sách con');
      throw err;
    }
  };

  const handleLoadMore = async (parentKey: string) => {
    try {
      await tree.loadMore(parentKey);
    } catch (err: any) {
      message.error(err?.message || 'Không thể tải thêm dữ liệu');
    }
  };

  return (
    <Card
      title="Cây phả hệ (Hierarchy)"
      className="overview-section hierarchy-tree-section"
      extra={
        <Space>
          <Button icon={<ReloadOutlined />} size="small" onClick={handleReload} />
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
            onLoadData={handleLoadData}
            onLoadMore={handleLoadMore}
            onRetry={tree.refetch}
          />
        </>
      )}
    </Card>
  );
};

export default HierarchyTreeSection;
