import React, { useMemo } from 'react';
import { 
  Card, 
  Typography, 
  Skeleton,
  Space,
  Tag,
  Empty,
  Tooltip
} from 'antd';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
  Tooltip as RechartsTooltip
} from 'recharts';
import { 
  UserOutlined,
  PieChartOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import { VipLevelDistributionProps, VIP_COLORS } from './types';

const { Text } = Typography;

const VipLevelDistribution: React.FC<VipLevelDistributionProps> = ({
  distributionData,
  loading = false
}) => {
  const [chartType, setChartType] = React.useState<'bar' | 'pie'>('bar');

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!distributionData?.distribution) return [];
    
    return distributionData.distribution.map((item, index) => ({
      name: `Level ${item.level}`,
      value: item.count,
      percentage: item.percentage,
      color: VIP_COLORS.LEVEL_GRADIENT[index] || VIP_COLORS.PRIMARY,
      level: item.level
    }));
  }, [distributionData]);

  // Calculate total customers
  const totalCustomers = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.value, 0);
  }, [chartData]);

  // Custom label for pie chart
  const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null; // Don't show label for small slices

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight={600}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
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
                <UserOutlined style={{ marginRight: 4 }} />
                {data.value.toLocaleString()} customers
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

  const renderChart = () => {
    if (chartData.length === 0) {
      return (
        <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Empty description="No distribution data available" />
        </div>
      );
    }

    if (chartType === 'bar') {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="name" 
              stroke="#666"
              fontSize={12}
            />
            <YAxis 
              stroke="#666"
              fontSize={12}
            />
            <RechartsTooltip content={CustomTooltip} />
            <Bar 
              dataKey="value" 
              radius={[4, 4, 0, 0]}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderPieLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <RechartsTooltip content={CustomTooltip} />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            iconType="circle"
          />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  if (loading) {
    return (
      <Card 
        title="VIP Level Distribution" 
        className="vip-distribution-card"
        style={{ height: '400px' }}
        extra={
          <Space>
            <Skeleton.Button size="small" />
            <Skeleton.Button size="small" />
          </Space>
        }
      >
        <Skeleton active paragraph={{ rows: 8 }} />
      </Card>
    );
  }

  return (
    <Card 
      className="vip-distribution-card"
      style={{ height: '400px' }}
      title={
        <Space align="center">
          <PieChartOutlined style={{ color: VIP_COLORS.PRIMARY }} />
          <span>VIP Level Distribution</span>
        </Space>
      }
      extra={
        <Space>
          <Tooltip title="Bar Chart">
            <div
              className={`chart-type-button ${chartType === 'bar' ? 'active' : ''}`}
              onClick={() => setChartType('bar')}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                backgroundColor: chartType === 'bar' ? VIP_COLORS.PRIMARY : 'transparent',
                color: chartType === 'bar' ? 'white' : VIP_COLORS.PRIMARY,
                border: `1px solid ${VIP_COLORS.PRIMARY}`,
                transition: 'all 0.3s'
              }}
            >
              <BarChartOutlined />
            </div>
          </Tooltip>
          <Tooltip title="Pie Chart">
            <div
              className={`chart-type-button ${chartType === 'pie' ? 'active' : ''}`}
              onClick={() => setChartType('pie')}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                backgroundColor: chartType === 'pie' ? VIP_COLORS.PRIMARY : 'transparent',
                color: chartType === 'pie' ? 'white' : VIP_COLORS.PRIMARY,
                border: `1px solid ${VIP_COLORS.PRIMARY}`,
                transition: 'all 0.3s'
              }}
            >
              <PieChartOutlined />
            </div>
          </Tooltip>
        </Space>
      }
    >
      <div className="distribution-content">
        {/* Summary Stats */}
        <div className="distribution-summary" style={{ marginBottom: '16px' }}>
          <Space wrap>
            <Tag color="blue" style={{ fontSize: '12px' }}>
              <UserOutlined style={{ marginRight: '4px' }} />
              Total: {totalCustomers.toLocaleString()} customers
            </Tag>
            <Tag color="green" style={{ fontSize: '12px' }}>
              {chartData.length} VIP levels active
            </Tag>
          </Space>
        </div>

        {/* Chart */}
        <div className="chart-container">
          {renderChart()}
        </div>

        {/* Level Details */}
        {chartData.length > 0 && (
          <div className="level-details" style={{ marginTop: '16px' }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
              gap: '8px' 
            }}>
              {chartData.slice(0, 5).map((item) => (
                <div
                  key={item.level}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    backgroundColor: item.color,
                    color: 'white',
                    textAlign: 'center',
                    fontSize: '12px'
                  }}
                >
                  <div style={{ fontWeight: 600 }}>Level {item.level}</div>
                  <div>{item.percentage.toFixed(1)}%</div>
                  <div>{item.value.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default VipLevelDistribution;