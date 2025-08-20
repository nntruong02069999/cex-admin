import React, { useState } from 'react';
import { Card, Select, Row, Col, Statistic } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { VipDailyLog, VipDailyChartData } from '../types/vipDailyLog.types';
import { formatCurrency, formatDate } from '../utils/formatters';

const { Option } = Select;

interface VipDailyChartProps {
  customerId: number;
}

const VipDailyChart: React.FC<VipDailyChartProps> = ({ customerId }) => {
  const [chartType, setChartType] = useState<'commission' | 'performance'>('commission');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  // Mock VIP Daily Log data for the last 30 days
  const generateMockData = (days: number): VipDailyLog[] => {
    const data: VipDailyLog[] = [];
    const currentDate = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() - i);
      
      // Simulate progressive growth with some randomness
      const baseCommission = 100 + (days - i) * 3;
      const randomFactor = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
      
      data.push({
        id: i + 1,
        customerId,
        date: date.toISOString().split('T')[0],
        vipLevel: 3 + Math.floor(i / 10), // Gradual VIP level increase
        totalMemberCount: 50 + i * 2,
        f1TotalCount: 10 + Math.floor(i / 3),
        f1VipCount: 3 + Math.floor(i / 5),
        dailyF1TradingVolume: (5000 + i * 100) * randomFactor,
        dailyTradingVolume: (8000 + i * 150) * randomFactor,
        dailyVipCommission: baseCommission * 0.6 * randomFactor,
        dailyTradingCommission: baseCommission * 0.4 * randomFactor,
        currentRank: Math.max(1, 100 - Math.floor(i / 2)),
        rankChange: Math.floor(Math.random() * 6) - 3, // -3 to +3
        f1RetentionRate: 0.85 + Math.random() * 0.1,
        conversionRate: 0.15 + Math.random() * 0.1,
        avgF1TradingVolume: (800 + i * 20) * randomFactor,
        calculatedAt: Date.now() / 1000,
        dataVersion: '1.0',
      });
    }
    
    return data;
  };

  const getDaysFromRange = (range: string): number => {
    switch (range) {
      case '7d': return 7;
      case '30d': return 30;
      case '90d': return 90;
      default: return 30;
    }
  };

  const mockData = generateMockData(getDaysFromRange(timeRange));

  // Process data for charts
  const chartData: VipDailyChartData[] = mockData.map(item => ({
    date: formatDate(new Date(item.date).getTime() / 1000, 'DISPLAY_DATE'), // DD/MM/YYYY format
    totalCommission: item.dailyVipCommission + item.dailyTradingCommission,
    vipCommission: item.dailyVipCommission,
    tradingCommission: item.dailyTradingCommission,
    f1VipCount: item.f1VipCount,
    tradingVolume: item.dailyTradingVolume,
    rank: item.currentRank,
  }));

  // Calculate totals for summary cards
  const totals = mockData.reduce(
    (acc, item) => ({
      totalCommission: acc.totalCommission + item.dailyVipCommission + item.dailyTradingCommission,
      vipCommission: acc.vipCommission + item.dailyVipCommission,
      tradingCommission: acc.tradingCommission + item.dailyTradingCommission,
      totalVolume: acc.totalVolume + item.dailyTradingVolume,
      avgF1Count: acc.avgF1Count + item.f1VipCount,
    }),
    { totalCommission: 0, vipCommission: 0, tradingCommission: 0, totalVolume: 0, avgF1Count: 0 }
  );

  const avgF1Count = Math.round(totals.avgF1Count / mockData.length);
  const currentRank = mockData[mockData.length - 1]?.currentRank || 0;
  const rankChange = mockData[mockData.length - 1]?.rankChange || 0;

  return (
    <Card title="📈 Biểu đồ Hoa hồng VIP" style={{ marginBottom: 24 }}>
      {/* Controls */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={12}>
          <Select
            value={chartType}
            onChange={setChartType}
            style={{ width: 180 }}
          >
            <Option value="commission">Hoa hồng hàng ngày</Option>
            <Option value="performance">Hiệu suất F1 VIP</Option>
          </Select>
        </Col>
        <Col span={12} style={{ textAlign: 'right' }}>
          <Select
            value={timeRange}
            onChange={setTimeRange}
            style={{ width: 120 }}
          >
            <Option value="7d">7 ngày</Option>
            <Option value="30d">30 ngày</Option>
            <Option value="90d">90 ngày</Option>
          </Select>
        </Col>
      </Row>

      {/* Summary Cards */}
      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="💰 Tổng HH"
              value={totals.totalCommission}
              formatter={(value) => formatCurrency(Number(value))}
              valueStyle={{ fontSize: 16, color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="👥 TB F1 VIP"
              value={avgF1Count}
              suffix="người"
              valueStyle={{ fontSize: 16, color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="📊 Xếp hạng"
              value={currentRank}
              suffix={rankChange !== 0 ? (rankChange > 0 ? `↗️+${rankChange}` : `↘️${rankChange}`) : ''}
              valueStyle={{ 
                fontSize: 16, 
                color: rankChange > 0 ? '#52c41a' : rankChange < 0 ? '#ff4d4f' : '#666' 
              }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="💱 Tổng Volume"
              value={totals.totalVolume}
              formatter={(value) => formatCurrency(Number(value))}
              valueStyle={{ fontSize: 16, color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <div style={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'commission' ? (
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                interval={timeRange === '90d' ? 'preserveStartEnd' : 0}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `${Math.round(value)}`}
              />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  formatCurrency(value),
                  name === 'totalCommission' ? 'Tổng HH' :
                  name === 'vipCommission' ? 'HH VIP' : 'HH Trading'
                ]}
                labelStyle={{ color: '#666' }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="totalCommission"
                stroke="#52c41a"
                strokeWidth={3}
                name="Tổng hoa hồng"
                dot={{ fill: '#52c41a', strokeWidth: 2, r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="vipCommission"
                stroke="#722ed1"
                strokeWidth={2}
                name="HH VIP"
                strokeDasharray="5 5"
              />
              <Line
                type="monotone"
                dataKey="tradingCommission"
                stroke="#1890ff"
                strokeWidth={2}
                name="HH Trading"
                strokeDasharray="5 5"
              />
            </LineChart>
          ) : (
            <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                interval={timeRange === '90d' ? 'preserveStartEnd' : 0}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  name === 'f1VipCount' ? `${value} người` : formatCurrency(value),
                  name === 'f1VipCount' ? 'F1 VIP' : 'Trading Volume'
                ]}
                labelStyle={{ color: '#666' }}
              />
              <Legend />
              <Bar
                dataKey="f1VipCount"
                fill="#fa8c16"
                name="F1 VIP Count"
                yAxisId={0}
              />
              <Line
                type="monotone"
                dataKey="tradingVolume"
                stroke="#1890ff"
                strokeWidth={3}
                name="Trading Volume"
                yAxisId={1}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      <div style={{ 
        marginTop: 12, 
        fontSize: 12, 
        color: '#666', 
        textAlign: 'center' 
      }}>
        Dữ liệu được cập nhật hàng ngày • Hiển thị {timeRange === '7d' ? '7 ngày' : timeRange === '30d' ? '30 ngày' : '90 ngày'} gần nhất
      </div>
    </Card>
  );
};

export default VipDailyChart;