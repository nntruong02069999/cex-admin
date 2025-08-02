import React from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Statistic, 
  Typography,
  Skeleton,
  Space,
  Tag,
  Avatar
} from 'antd';
import {
  UserOutlined,
  UsergroupAddOutlined,
  DollarCircleOutlined,
  RiseOutlined,
  CrownOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined
} from '@ant-design/icons';
import { VipSummaryCardsProps, MetricCardProps } from './types';

const { Text } = Typography;

// Individual metric card component
const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  prefix,
  suffix,
  loading = false,
  color = 'primary',
  onClick
}) => {
  const getColorConfig = () => {
    switch (color) {
      case 'success':
        return { primary: '#10b981', secondary: '#d1fae5' };
      case 'warning':
        return { primary: '#f59e0b', secondary: '#fef3c7' };
      case 'danger':
        return { primary: '#ef4444', secondary: '#fee2e2' };
      default:
        return { primary: '#2563eb', secondary: '#dbeafe' };
    }
  };

  const colorConfig = getColorConfig();
  
  const renderChangeIndicator = () => {
    if (change === undefined || change === null) return null;
    
    const isPositive = change > 0;
    const isNegative = change < 0;
    
    if (change === 0) {
      return (
        <Text type="secondary" style={{ fontSize: '12px' }}>
          No change
        </Text>
      );
    }
    
    return (
      <Space align="center" size={4}>
        {isPositive && <ArrowUpOutlined style={{ color: '#10b981', fontSize: '12px' }} />}
        {isNegative && <ArrowDownOutlined style={{ color: '#ef4444', fontSize: '12px' }} />}
        <Text 
          style={{ 
            color: isPositive ? '#10b981' : '#ef4444',
            fontSize: '12px',
            fontWeight: 600
          }}
        >
          {isPositive ? '+' : ''}{change.toFixed(1)}%
        </Text>
        <Text type="secondary" style={{ fontSize: '12px' }}>
          vs last month
        </Text>
      </Space>
    );
  };

  return (
    <Card
      className={`metric-card metric-card-${color}`}
      hoverable={!!onClick}
      onClick={onClick}
      style={{
        height: '140px',
        border: `1px solid ${colorConfig.secondary}`,
        borderRadius: '12px',
        overflow: 'hidden'
      }}
      bodyStyle={{ 
        padding: '20px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}
    >
      {loading ? (
        <Skeleton active paragraph={false} />
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ flex: 1 }}>
              <Text 
                type="secondary" 
                style={{ 
                  fontSize: '14px',
                  fontWeight: 500,
                  marginBottom: '8px',
                  display: 'block'
                }}
              >
                {title}
              </Text>
              <Statistic
                value={value}
                suffix={suffix}
                valueStyle={{
                  fontSize: '28px',
                  fontWeight: 700,
                  color: colorConfig.primary,
                  lineHeight: 1
                }}
              />
            </div>
            {prefix && (
              <div 
                style={{
                  fontSize: '32px',
                  color: colorConfig.primary,
                  opacity: 0.8,
                  marginLeft: '16px'
                }}
              >
                {prefix}
              </div>
            )}
          </div>
          
          <div style={{ marginTop: '12px' }}>
            {renderChangeIndicator()}
          </div>
        </>
      )}
    </Card>
  );
};

const VipSummaryCards: React.FC<VipSummaryCardsProps> = ({
  summaryData,
  loading = false
}) => {
  
  const calculateChange = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const formatCurrency = (amount: number, currency: string = 'USDT') => {
    if (currency === 'USDT') {
      return new Intl.NumberFormat('en-US', {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount);
    }
    
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const cards = [
    {
      title: 'Total VIP Customers',
      value: summaryData?.totalVipCustomers || 0,
      change: summaryData ? calculateChange(
        summaryData.totalVipCustomers, 
        summaryData.previousMonth.totalVipCustomers
      ) : undefined,
      prefix: <UserOutlined />,
      color: 'primary' as const
    },
    {
      title: 'Active Customers',
      value: summaryData?.activeCustomers || 0,
      change: summaryData ? calculateChange(
        summaryData.activeCustomers, 
        summaryData.previousMonth.activeCustomers
      ) : undefined,
      prefix: <UsergroupAddOutlined />,
      color: 'success' as const
    },
    {
      title: 'Monthly Revenue',
      value: summaryData ? formatCurrency(summaryData.monthlyRevenue) : '0.00',
      suffix: 'USDT',
      change: summaryData ? calculateChange(
        summaryData.monthlyRevenue, 
        summaryData.previousMonth.monthlyRevenue
      ) : undefined,
      prefix: <DollarCircleOutlined />,
      color: 'warning' as const
    },
    {
      title: 'Upgrade Rate',
      value: summaryData?.upgradeRate || 0,
      suffix: '%',
      change: summaryData ? calculateChange(
        summaryData.upgradeRate, 
        summaryData.previousMonth.upgradeRate
      ) : undefined,
      prefix: <RiseOutlined />,
      color: 'success' as const
    },
    {
      title: 'Top Rank Customer',
      value: summaryData?.topRankCustomer?.name || 'N/A',
      prefix: <CrownOutlined />,
      color: 'primary' as const,
      loading: loading
    }
  ];

  return (
    <div className="vip-summary-cards">
      <Row gutter={[16, 16]}>
        {cards.map((card, index) => {
          // Special handling for top rank customer card
          if (index === 4 && summaryData?.topRankCustomer) {
            return (
              <Col xs={24} sm={12} lg={8} xl={4} key={index}>
                <Card
                  className="metric-card metric-card-primary top-customer-card"
                  style={{
                    height: '140px',
                    border: '1px solid #dbeafe',
                    borderRadius: '12px',
                    overflow: 'hidden'
                  }}
                  bodyStyle={{ 
                    padding: '20px',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  {loading ? (
                    <Skeleton active paragraph={{ rows: 2 }} />
                  ) : (
                    <>
                      <div>
                        <Text 
                          type="secondary" 
                          style={{ 
                            fontSize: '14px',
                            fontWeight: 500,
                            marginBottom: '8px',
                            display: 'block'
                          }}
                        >
                          Top Rank Customer
                        </Text>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <Avatar 
                            size={40}
                            style={{ 
                              backgroundColor: '#2563eb',
                              fontSize: '16px'
                            }}
                            icon={<CrownOutlined />}
                          />
                          <div>
                            <Text 
                              strong 
                              style={{ 
                                fontSize: '16px',
                                color: '#2563eb',
                                display: 'block',
                                lineHeight: 1.2
                              }}
                            >
                              {summaryData.topRankCustomer.name}
                            </Text>
                            <Space size={8} style={{ marginTop: '4px' }}>
                              <Tag color="gold">
                                Rank #{summaryData.topRankCustomer.rank}
                              </Tag>
                              <Tag color="blue">
                                VIP {summaryData.topRankCustomer.vipLevel}
                              </Tag>
                            </Space>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </Card>
              </Col>
            );
          }

          return (
            <Col xs={24} sm={12} lg={8} xl={5} key={index}>
              <MetricCard
                title={card.title}
                value={card.value}
                change={card.change}
                prefix={card.prefix}
                suffix={card.suffix}
                color={card.color}
                loading={loading}
              />
            </Col>
          );
        })}
      </Row>
    </div>
  );
};

export default VipSummaryCards;