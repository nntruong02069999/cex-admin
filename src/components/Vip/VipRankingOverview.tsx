import React, { useMemo } from 'react';
import { 
  Card, 
  Typography, 
  Skeleton,
  Space,
  Table,
  Tag,
  Avatar,
  Statistic,
  Empty,
  Row,
  Col
} from 'antd';
import {
  TrophyOutlined,
  UserOutlined,
  RiseOutlined,
  FallOutlined,
  MinusOutlined,
  CrownOutlined,
  TeamOutlined,
  LineChartOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { VipRankingOverviewProps, VipRankedCustomer, VIP_COLORS } from './types';

const { Text } = Typography;

const VipRankingOverview: React.FC<VipRankingOverviewProps> = ({
  rankingData,
  loading = false
}) => {

  // Format large numbers
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(num);
  };

  // Format currency
  // const formatCurrency = (amount: number) => {
  //   return new Intl.NumberFormat('en-US', {
  //     style: 'decimal',
  //     minimumFractionDigits: 2,
  //     maximumFractionDigits: 2
  //   }).format(amount);
  // };

  // Get rank change indicator
  const getRankChangeIndicator = (change: number) => {
    if (change > 0) {
      return (
        <Tag color="green" style={{ fontSize: '11px', margin: 0 }}>
          <RiseOutlined style={{ fontSize: '10px' }} />
          +{change}
        </Tag>
      );
    } else if (change < 0) {
      return (
        <Tag color="red" style={{ fontSize: '11px', margin: 0 }}>
          <FallOutlined style={{ fontSize: '10px' }} />
          {change}
        </Tag>
      );
    } else {
      return (
        <Tag color="default" style={{ fontSize: '11px', margin: 0 }}>
          <MinusOutlined style={{ fontSize: '10px' }} />
          0
        </Tag>
      );
    }
  };

  // Get VIP level color
  const getVipLevelColor = (level: number) => {
    if (level >= 8) return 'gold';
    if (level >= 6) return 'orange';
    if (level >= 4) return 'blue';
    if (level >= 2) return 'green';
    return 'default';
  };

  // Get rank medal
  const getRankMedal = (rank: number) => {
    if (rank === 1) {
      return <TrophyOutlined style={{ color: '#ffd700', fontSize: '16px' }} />;
    } else if (rank === 2) {
      return <TrophyOutlined style={{ color: '#c0c0c0', fontSize: '16px' }} />;
    } else if (rank === 3) {
      return <TrophyOutlined style={{ color: '#cd7f32', fontSize: '16px' }} />;
    }
    return <span style={{ color: '#666', fontSize: '14px', fontWeight: 600 }}>#{rank}</span>;
  };

  // Table columns configuration
  const columns: ColumnsType<VipRankedCustomer> = [
    {
      title: 'Rank',
      dataIndex: 'rank',
      key: 'rank',
      width: 70,
      align: 'center',
      render: (rank: number) => getRankMedal(rank),
    },
    {
      title: 'Customer',
      dataIndex: 'name',
      key: 'customer',
      width: 180,
      render: (name: string, record: VipRankedCustomer) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Avatar 
            size="small" 
            style={{ backgroundColor: VIP_COLORS.PRIMARY }}
            icon={<UserOutlined />}
          />
          <div>
            <div style={{ fontSize: '13px', fontWeight: 500 }}>
              {name}
            </div>
            <div style={{ fontSize: '11px', color: '#666' }}>
              ID: {record.customerId}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'VIP Level',
      dataIndex: 'vipLevel',
      key: 'vipLevel',
      width: 90,
      align: 'center',
      render: (level: number) => (
        <Tag 
          color={getVipLevelColor(level)} 
          style={{ fontSize: '11px', fontWeight: 600 }}
        >
          <CrownOutlined style={{ fontSize: '10px', marginRight: '2px' }} />
          VIP {level}
        </Tag>
      ),
    },
    {
      title: 'F1 Network',
      dataIndex: 'f1Count',
      key: 'f1Count',
      width: 100,
      align: 'center',
      render: (count: number) => (
        <Space align="center" size={4}>
          <TeamOutlined style={{ color: VIP_COLORS.SUCCESS, fontSize: '12px' }} />
          <Text style={{ fontSize: '12px', fontWeight: 500 }}>
            {count.toLocaleString()}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Trading Volume',
      dataIndex: 'tradingVolume',
      key: 'tradingVolume',
      width: 120,
      align: 'right',
      render: (volume: number) => (
        <Space align="center" size={4}>
          <LineChartOutlined style={{ color: VIP_COLORS.WARNING, fontSize: '12px' }} />
          <Text style={{ fontSize: '12px', fontWeight: 500 }}>
            {formatNumber(volume)} USDT
          </Text>
        </Space>
      ),
    },
    {
      title: 'Score',
      dataIndex: 'totalScore',
      key: 'totalScore',
      width: 80,
      align: 'center',
      render: (score: number) => (
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            fontSize: '13px', 
            fontWeight: 600, 
            color: VIP_COLORS.PRIMARY 
          }}>
            {score.toFixed(1)}
          </div>
          <div style={{ 
            fontSize: '10px', 
            color: '#666',
            transform: 'scale(0.9)'
          }}>
            / 100
          </div>
        </div>
      ),
    },
    {
      title: 'Change',
      dataIndex: 'rankChange',
      key: 'rankChange',
      width: 80,
      align: 'center',
      render: (change: number) => getRankChangeIndicator(change),
    },
  ];

  // Prepare table data
  const tableData = useMemo(() => {
    return rankingData?.topRanked?.map(customer => ({
      ...customer,
      key: customer.customerId
    })) || [];
  }, [rankingData]);

  if (loading) {
    return (
      <Card 
        title="Ranking Overview" 
        className="vip-ranking-card"
        style={{ height: '400px' }}
      >
        <Skeleton active paragraph={{ rows: 8 }} />
      </Card>
    );
  }

  return (
    <Card 
      className="vip-ranking-card"
      style={{ height: '400px' }}
      title={
        <Space align="center">
          <TrophyOutlined style={{ color: VIP_COLORS.PRIMARY }} />
          <span>VIP Rankings</span>
        </Space>
      }
    >
      <div className="ranking-content">
        {/* Competition Stats */}
        {rankingData?.competitionStats && (
          <Row gutter={16} style={{ marginBottom: '16px' }}>
            <Col span={8}>
              <Statistic
                title="Total Participants"
                value={rankingData.competitionStats.totalParticipants}
                valueStyle={{ fontSize: '16px', color: VIP_COLORS.PRIMARY }}
                prefix={<UserOutlined />}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="Average Score"
                value={rankingData.competitionStats.averageScore}
                precision={1}
                valueStyle={{ fontSize: '16px', color: VIP_COLORS.SUCCESS }}
                prefix={<RiseOutlined />}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="Top Percentile"
                value={rankingData.competitionStats.topPercentileThreshold}
                precision={1}
                suffix="%"
                valueStyle={{ fontSize: '16px', color: VIP_COLORS.WARNING }}
                prefix={<TrophyOutlined />}
              />
            </Col>
          </Row>
        )}

        {/* Rankings Table */}
        <div className="rankings-table" style={{ height: '240px', overflow: 'auto' }}>
          {tableData.length > 0 ? (
            <Table
              columns={columns}
              dataSource={tableData}
              pagination={false}
              size="small"
              scroll={{ y: 200 }}
              style={{ fontSize: '12px' }}
              rowClassName={(record, index) => {
                if (record.rank === 1) return 'rank-gold';
                if (record.rank === 2) return 'rank-silver';
                if (record.rank === 3) return 'rank-bronze';
                return '';
              }}
            />
          ) : (
            <div style={{ 
              height: '200px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <Empty 
                description="No ranking data available" 
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </div>
          )}
        </div>

        {/* Legend */}
        {tableData.length > 0 && (
          <div style={{ 
            marginTop: '12px', 
            paddingTop: '12px', 
            borderTop: '1px solid #f0f0f0' 
          }}>
            <Space wrap size={8}>
              <Text type="secondary" style={{ fontSize: '11px' }}>
                <TrophyOutlined style={{ color: '#ffd700', marginRight: '4px' }} />
                1st Place
              </Text>
              <Text type="secondary" style={{ fontSize: '11px' }}>
                <TrophyOutlined style={{ color: '#c0c0c0', marginRight: '4px' }} />
                2nd Place
              </Text>
              <Text type="secondary" style={{ fontSize: '11px' }}>
                <TrophyOutlined style={{ color: '#cd7f32', marginRight: '4px' }} />
                3rd Place
              </Text>
              <Text type="secondary" style={{ fontSize: '11px' }}>
                <RiseOutlined style={{ color: '#10b981', marginRight: '2px' }} />
                Rank Up
              </Text>
              <Text type="secondary" style={{ fontSize: '11px' }}>
                <FallOutlined style={{ color: '#ef4444', marginRight: '2px' }} />
                Rank Down
              </Text>
            </Space>
          </div>
        )}
      </div>
    </Card>
  );
};

export default VipRankingOverview;