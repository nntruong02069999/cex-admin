import React, { useMemo, useState } from 'react';
import { 
  Card, 
  Typography, 
  Skeleton,
  Space,
  Select,
  Row,
  Col,
  Statistic,
  Empty,
  List,
  Avatar,
  Tag
} from 'antd';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { 
  DollarCircleOutlined,
  LineChartOutlined,
  RiseOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { VipCommissionAnalyticsProps, CommissionPeriod, VIP_COLORS } from './types';

const { Title, Text } = Typography;
const { Option } = Select;

const VipCommissionAnalytics: React.FC<VipCommissionAnalyticsProps> = ({
  commissionData,
  loading = false,
  onPeriodChange
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<CommissionPeriod>('daily');

  // Format currency
  const formatCurrency = (amount: number, currency: string = 'USDT') => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Prepare line chart data
  const lineChartData = useMemo(() => {
    if (!commissionData?.dailyTrend) return [];
    
    return commissionData.dailyTrend.map(item => ({
      date: moment(item.date).format('MMM DD'),
      amount: item.amount,
      formatted: formatCurrency(item.amount)
    }));
  }, [commissionData]);

  // Prepare pie chart data
  const pieChartData = useMemo(() => {
    if (!commissionData?.commissionByType) return [];
    
    const colors = [VIP_COLORS.PRIMARY, VIP_COLORS.SUCCESS, VIP_COLORS.WARNING, '#8b5cf6'];
    
    return Object.entries(commissionData.commissionByType).map(([key, value], index) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value: value,
      color: colors[index] || VIP_COLORS.NEUTRAL,
      percentage: (value / commissionData.totalCommission) * 100
    }));
  }, [commissionData]);

  // Handle period change
  const handlePeriodChange = (period: CommissionPeriod) => {
    setSelectedPeriod(period);
    onPeriodChange?.(period);
  };

  // Custom tooltip for line chart
  const LineChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="custom-tooltip">
          <Card size="small" style={{ border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
            <Space direction="vertical" size={4}>
              <Text strong>{label}</Text>
              <Text style={{ color: VIP_COLORS.PRIMARY }}>
                <DollarCircleOutlined style={{ marginRight: 4 }} />
                {data.payload.formatted} USDT
              </Text>
            </Space>
          </Card>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for pie chart
  const PieChartTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <Card size="small" style={{ border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
            <Space direction="vertical" size={4}>
              <Text strong style={{ color: data.color }}>
                {data.name}
              </Text>
              <Text>
                {formatCurrency(data.value)} USDT
              </Text>
              <Text type="secondary">
                {data.percentage.toFixed(1)}% of total
              </Text>
            </Space>
          </Card>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card 
        title="Commission Analytics" 
        className="vip-commission-card"
        style={{ height: '400px' }}
        extra={<Skeleton.Button size="small" />}
      >
        <Skeleton active paragraph={{ rows: 8 }} />
      </Card>
    );
  }

  return (
    <Card 
      className="vip-commission-card"
      style={{ height: '400px' }}
      title={
        <Space align="center">
          <DollarCircleOutlined style={{ color: VIP_COLORS.PRIMARY }} />
          <span>Commission Analytics</span>
        </Space>
      }
      extra={
        <Select
          value={selectedPeriod}
          onChange={handlePeriodChange}
          style={{ width: 100 }}
          size="small"
        >
          <Option value="daily">Daily</Option>
          <Option value="weekly">Weekly</Option>
          <Option value="monthly">Monthly</Option>
        </Select>
      }
    >
      <div className="commission-content">
        {/* Summary Stats */}
        <Row gutter={16} style={{ marginBottom: '16px' }}>
          <Col span={12}>
            <Statistic
              title="Total Commission"
              value={commissionData?.totalCommission || 0}
              suffix="USDT"
              valueStyle={{ color: VIP_COLORS.PRIMARY, fontSize: '18px' }}
              prefix={<DollarCircleOutlined />}
            />
          </Col>
          <Col span={12}>
            <Statistic
              title="Top Earner"
              value={commissionData?.topEarners?.[0]?.amount || 0}
              suffix="USDT"
              valueStyle={{ color: VIP_COLORS.SUCCESS, fontSize: '18px' }}
              prefix={<TrophyOutlined />}
            />
          </Col>
        </Row>

        {/* Charts Row */}
        <Row gutter={16}>
          {/* Trend Chart */}
          <Col span={14}>
            <div className="chart-section">
              <Title level={5} style={{ marginBottom: '12px', fontSize: '14px' }}>
                <LineChartOutlined style={{ marginRight: '8px', color: VIP_COLORS.PRIMARY }} />
                Commission Trend ({selectedPeriod})
              </Title>
              {lineChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={lineChartData}>
                    <defs>
                      <linearGradient id="colorCommission" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={VIP_COLORS.PRIMARY} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={VIP_COLORS.PRIMARY} stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#666"
                      fontSize={11}
                    />
                    <YAxis 
                      stroke="#666"
                      fontSize={11}
                    />
                    <RechartsTooltip content={LineChartTooltip} />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke={VIP_COLORS.PRIMARY}
                      fillOpacity={1}
                      fill="url(#colorCommission)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Empty description="No trend data" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                </div>
              )}
            </div>
          </Col>

          {/* Commission Breakdown */}
          <Col span={10}>
            <div className="chart-section">
              <Title level={5} style={{ marginBottom: '12px', fontSize: '14px' }}>
                <RiseOutlined style={{ marginRight: '8px', color: VIP_COLORS.PRIMARY }} />
                Commission Breakdown
              </Title>
              {pieChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={60}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip content={PieChartTooltip} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Empty description="No breakdown data" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                </div>
              )}
            </div>
          </Col>
        </Row>

        {/* Top Earners */}
        {commissionData?.topEarners && commissionData.topEarners.length > 0 && (
          <div style={{ marginTop: '16px', borderTop: '1px solid #f0f0f0', paddingTop: '12px' }}>
            <Title level={5} style={{ marginBottom: '8px', fontSize: '14px' }}>
              <TrophyOutlined style={{ marginRight: '8px', color: VIP_COLORS.PRIMARY }} />
              Top Commission Earners
            </Title>
            <List
              dataSource={commissionData.topEarners.slice(0, 3)}
              renderItem={(item, index) => (
                <List.Item style={{ padding: '6px 0', border: 'none' }}>
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        size="small" 
                        style={{ 
                          backgroundColor: index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : '#cd7f32',
                          fontSize: '12px'
                        }}
                      >
                        #{index + 1}
                      </Avatar>
                    }
                    title={
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={{ fontSize: '13px' }}>{item.name}</Text>
                        <Tag color="blue" style={{ fontSize: '11px' }}>
                          {formatCurrency(item.amount)} USDT
                        </Tag>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </div>
        )}
      </div>
    </Card>
  );
};

export default VipCommissionAnalytics;