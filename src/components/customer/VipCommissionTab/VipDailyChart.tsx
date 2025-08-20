import React, { useState, useEffect } from "react";
import { Card, Select, Row, Col, Statistic, message } from "antd";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  Line,
} from "recharts";
import { VipDailyLog, VipDailyChartData } from "../types/vipDailyLog.types";
import { formatCurrency, formatDate } from "../utils/formatters";
import { getCustomerVipDailyLog } from "../../../services/customer";
import moment from "moment";

const { Option } = Select;

interface VipDailyChartProps {
  customerId: number;
}

const VipDailyChart: React.FC<VipDailyChartProps> = ({ customerId }) => {
  const [chartType, setChartType] = useState<"commission" | "performance">(
    "commission"
  );
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");
  const [loading, setLoading] = useState(false);
  const [dailyData, setDailyData] = useState<VipDailyLog[]>([]);

  // Load data from API
  useEffect(() => {
    loadDailyLogData();
  }, [customerId, timeRange]);

  const getDaysFromRange = (range: string): number => {
    switch (range) {
      case "7d":
        return 7;
      case "30d":
        return 30;
      case "90d":
        return 90;
      default:
        return 30;
    }
  };

  const loadDailyLogData = async () => {
    setLoading(true);
    try {
      const days = getDaysFromRange(timeRange);
      const endDate = moment().valueOf();
      const startDate = moment().subtract(days, "days").valueOf();

      const params = {
        startDate,
        endDate,
      };

      const response = await getCustomerVipDailyLog(customerId, params);

      if (response.errorCode) {
        message.error(
          response.message || "Có lỗi xảy ra khi tải dữ liệu biểu đồ"
        );
        return;
      }

      setDailyData(response.data || []);
    } catch (error) {
      message.error("Có lỗi xảy ra khi tải dữ liệu biểu đồ");
      console.error("Error loading VIP daily log:", error);
    } finally {
      setLoading(false);
    }
  };

  // Process data for charts
  const chartData: VipDailyChartData[] = dailyData.map((item) => ({
    date: formatDate(new Date(item.date).getTime() / 1000, "DISPLAY_DATE"), // DD/MM/YYYY format
    totalCommission: item.dailyVipCommission + item.dailyTradingCommission,
    vipCommission: item.dailyVipCommission,
    tradingCommission: item.dailyTradingCommission,
    f1VipCount: item.f1VipCount,
    tradingVolume: item.dailyTradingVolume,
    totalF1TradingVolume: item.dailyF1TradingVolume,
    rank: item.currentRank,
  }));

  // Calculate totals for summary cards
  const totals = dailyData.reduce(
    (acc, item) => ({
      totalCommission:
        acc.totalCommission +
        item.dailyVipCommission +
        item.dailyTradingCommission,
      vipCommission: acc.vipCommission + item.dailyVipCommission,
      tradingCommission: acc.tradingCommission + item.dailyTradingCommission,
      totalVolume: acc.totalVolume + item.dailyTradingVolume,
      totalF1TradingVolume:
        acc.totalF1TradingVolume + item.dailyF1TradingVolume,
    }),
    {
      totalCommission: 0,
      vipCommission: 0,
      tradingCommission: 0,
      totalVolume: 0,
      totalF1TradingVolume: 0,
    }
  );

  const currentRank = dailyData[dailyData.length - 1]?.currentRank || 0;
  const rankChange = dailyData[dailyData.length - 1]?.rankChange || 0;

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
        <Col span={12} style={{ textAlign: "right" }}>
          <Select
            value={timeRange}
            onChange={(value) => setTimeRange(value)}
            style={{ width: 120 }}
            loading={loading}
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
              valueStyle={{ fontSize: 16, color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="📈 Tổng F1 Trading Volume"
              value={totals.totalF1TradingVolume}
              formatter={(value) => formatCurrency(Number(value), "USDT")}
              valueStyle={{ fontSize: 16, color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="📊 Xếp hạng"
              value={currentRank}
              suffix={
                rankChange !== 0
                  ? rankChange > 0
                    ? `↗️+${rankChange}`
                    : `↘️${rankChange}`
                  : ""
              }
              valueStyle={{
                fontSize: 16,
                color:
                  rankChange > 0
                    ? "#52c41a"
                    : rankChange < 0
                    ? "#ff4d4f"
                    : "#666",
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
              valueStyle={{ fontSize: 16, color: "#722ed1" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <div style={{ height: 300 }}>
        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          >
            <span>Đang tải dữ liệu...</span>
          </div>
        ) : chartData.length === 0 ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          >
            <span>Không có dữ liệu</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "commission" ? (
              <BarChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  interval={timeRange === "90d" ? "preserveStartEnd" : 0}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `${Math.round(value)}`}
                />
                <Tooltip
                  formatter={(value: number, name: string, props: any) => {
                    console.log("Tooltip formatter:", {
                      value,
                      name,
                      dataKey: props?.dataKey,
                      props,
                    });
                    let label: string;
                    // Check both name (from Bar name prop) and dataKey
                    const dataKey = props?.dataKey;
                    switch (dataKey || name) {
                      case "totalCommission":
                      case "Tổng hoa hồng":
                        label = "Tổng HH";
                        break;
                      case "vipCommission":
                      case "HH VIP":
                        label = "HH VIP";
                        break;
                      case "tradingCommission":
                      case "HH Trading":
                        label = "HH Trading";
                        break;
                      default:
                        label = name;
                    }
                    return [formatCurrency(value, "USDT"), label];
                  }}
                  labelStyle={{ color: "#666" }}
                />
                <Legend />
                <Bar
                  dataKey="vipCommission"
                  fill="#722ed1"
                  name="HH VIP"
                  stackId="breakdown"
                  radius={[0, 0, 4, 4]}
                />
                <Bar
                  dataKey="tradingCommission"
                  fill="#1890ff"
                  name="HH Trading"
                  stackId="breakdown"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="totalCommission"
                  fill="rgba(82, 196, 26, 0.3)"
                  stroke="#52c41a"
                  strokeWidth={2}
                  name="Tổng hoa hồng"
                  radius={[4, 4, 4, 4]}
                />
              </BarChart>
            ) : (
              <BarChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  interval={timeRange === "90d" ? "preserveStartEnd" : 0}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    name === "f1VipCount"
                      ? `${value} người`
                      : formatCurrency(value, "USDT"),
                    name === "f1VipCount"
                      ? "F1 VIP"
                      : name === "tradingVolume"
                      ? "Trading Volume"
                      : "F1 Trading Volume",
                  ]}
                  labelStyle={{ color: "#666" }}
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
        )}
      </div>

      <div
        style={{
          marginTop: 12,
          fontSize: 12,
          color: "#666",
          textAlign: "center",
        }}
      >
        Dữ liệu được cập nhật hàng ngày • Hiển thị{" "}
        {timeRange === "7d"
          ? "7 ngày"
          : timeRange === "30d"
          ? "30 ngày"
          : "90 ngày"}{" "}
        gần nhất
      </div>
    </Card>
  );
};

export default VipDailyChart;
