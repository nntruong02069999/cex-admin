import React from 'react';
import { Row, Col, Skeleton, Alert, Empty, Statistic, Tag } from 'antd';
import { TeamOutlined, WalletOutlined } from '@ant-design/icons';
import type { HierarchySummary as HierarchySummaryType } from './hierarchy.types';
import { formatCurrency, formatNumber } from '@src/components/customer/utils/formatters';

interface HierarchySummaryProps {
  summary: HierarchySummaryType | null;
  loading: boolean;
  error: string | null;
}

export const HierarchySummary: React.FC<HierarchySummaryProps> = ({ summary, loading, error }) => {
  if (loading) {
    return <Skeleton active paragraph={{ rows: 2 }} />;
  }

  if (error) {
    return <Alert type="error" showIcon message={error} />;
  }

  if (!summary) {
    return <Empty description="Không có dữ liệu" />;
  }

  const { totalMembers, totalBalance, levelCounts } = summary;

  return (
    <div className="hierarchy-tree-section__summary">
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={8}>
          <Statistic
            title="Tổng thành viên"
            value={totalMembers}
            prefix={<TeamOutlined />}
            formatter={(value) => formatNumber(value as number)}
          />
        </Col>
        <Col xs={12} sm={8}>
          <Statistic
            title="Tổng balance"
            value={totalBalance}
            prefix={<WalletOutlined />}
            formatter={(value) => formatCurrency(value as number)}
          />
        </Col>
      </Row>
      <Row gutter={[8, 8]} style={{ marginTop: 16 }}>
        {[
          { key: 'F1', count: levelCounts.level1 },
          { key: 'F2', count: levelCounts.level2 },
          { key: 'F3', count: levelCounts.level3 },
          { key: 'F4', count: levelCounts.level4 },
          { key: 'F5', count: levelCounts.level5 },
          { key: 'F6', count: levelCounts.level6 },
          { key: 'F7', count: levelCounts.level7 },
        ].map(({ key, count }) => (
          <Col key={key}>
            <Tag color="blue">
              {key}: {formatNumber(count)}
            </Tag>
          </Col>
        ))}
      </Row>
    </div>
  );
};
