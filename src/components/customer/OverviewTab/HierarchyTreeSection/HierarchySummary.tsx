import React, { memo } from 'react';
import { Row, Col, Skeleton, Alert, Empty, Statistic, Tag } from 'antd';
import { TeamOutlined, WalletOutlined, CrownOutlined, UserOutlined, RiseOutlined } from '@ant-design/icons';
import type { HierarchySummary as HierarchySummaryType } from './hierarchy.types';
import type { Customer, CustomerVip } from '../../types/customer.types';
import { formatCurrency, formatNumber } from '@src/components/customer/utils/formatters';

interface HierarchySummaryProps {
  summary: HierarchySummaryType | null;
  loading: boolean;
  error: string | null;
  customer?: Customer;
  customerVip?: CustomerVip;
}

const HierarchySummaryComponent: React.FC<HierarchySummaryProps> = ({ summary, loading, error, customer, customerVip }) => {
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

  // 4 KPIs from customer data
  const customerStats = [
    { key: 'members', label: 'Members', value: customer?.totalMember ?? 0, icon: <UserOutlined />, accent: 'primary' },
    { key: 'vip', label: 'VIP', value: customer?.totalMemberVip ?? 0, icon: <CrownOutlined />, accent: 'purple' },
    { key: 'f1', label: 'F1', value: customer?.totalMemberVip1 ?? 0, icon: <TeamOutlined />, accent: 'blue' },
    { key: 'level', label: 'Cấp hiện tại', value: customerVip?.currentVipLevel ?? 0, icon: <RiseOutlined />, accent: 'gold' },
  ];

  return (
    <div className="hierarchy-tree-section__summary">
      {/* Customer KPIs with accent borders */}
      <Row gutter={[12, 12]} className="hierarchy-kpi-row">
        {customerStats.map((stat) => (
          <Col key={stat.key} xs={12} sm={6}>
            <div className={`hierarchy-kpi hierarchy-kpi--${stat.accent}`}>
              <div className="hierarchy-kpi__icon">{stat.icon}</div>
              <div className="hierarchy-kpi__content">
                <div className="hierarchy-kpi__value">{formatNumber(stat.value)}</div>
                <div className="hierarchy-kpi__label">{stat.label}</div>
              </div>
            </div>
          </Col>
        ))}
      </Row>

      {/* Backend summary stats */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={12} sm={8}>
          <Statistic
            title="Tổng thành viên (hệ thống)"
            value={totalMembers}
            prefix={<TeamOutlined />}
            formatter={(value) => formatNumber(value as number)}
          />
        </Col>
        <Col xs={12} sm={8}>
          <Statistic
            title="Tổng balance (hệ thống)"
            value={totalBalance}
            prefix={<WalletOutlined />}
            formatter={(value) => formatCurrency(value as number)}
          />
        </Col>
      </Row>

      {/* F1-F7 Level tags */}
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

export const HierarchySummary = memo(HierarchySummaryComponent);
