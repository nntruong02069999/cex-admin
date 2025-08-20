import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  ComposedChart,
} from "recharts";
import { Card, Typography, Radio, Space } from "antd";
import { TradingPnLSummary } from "../types/customer.types";
import { formatCurrency } from "../utils/formatters";
import moment from "moment";

const { Title } = Typography;

interface PnLChartProps {
  data: TradingPnLSummary[];
}

interface ChartDataPoint {
  date: string;
  dateDisplay: string;
  totalTrading: number;
  totalWinAmount: number;
  pnl: number;
  winRate: number;
}

const PnLChart: React.FC<PnLChartProps> = ({ data }) => {
  const [chartType, setChartType] = React.useState<"line" | "bar" | "composed">(
    "composed"
  );

  // Transform data for chart
  const chartData: ChartDataPoint[] = data.map((item) => {
    const pnl = item.totalWinAmount - item.totalTrading;
    const winRate = (item.totalWinAmount / item.totalTrading) * 100;

    return {
      date: item.date,
      dateDisplay: moment(item.date).format("DD/MM"),
      totalTrading: item.totalTrading,
      totalWinAmount: item.totalWinAmount,
      pnl: pnl,
      winRate: winRate,
    };
  });

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div
          style={{
            backgroundColor: "white",
            border: "1px solid #d9d9d9",
            borderRadius: 6,
            padding: 12,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <p style={{ margin: 0, fontWeight: "bold", marginBottom: 8 }}>
            📅 {moment(data.date).format("DD/MM/YYYY")}
          </p>
          <p style={{ margin: 0, color: "#1890ff" }}>
            💰 Tổng giao dịch:{" "}
            <strong>{formatCurrency(data.totalTrading)}</strong>
          </p>
          <p style={{ margin: 0, color: "#52c41a" }}>
            🏆 Tổng thắng:{" "}
            <strong>{formatCurrency(data.totalWinAmount)}</strong>
          </p>
          <p
            style={{
              margin: 0,
              color: data.pnl >= 0 ? "#3f8600" : "#cf1322",
            }}
          >
            📊 P&L:{" "}
            <strong>
              {data.pnl >= 0 ? "+" : ""}
              {formatCurrency(data.pnl)}
            </strong>
          </p>
          <p style={{ margin: 0, color: "#666" }}>
            📈 Tỷ lệ thắng: <strong>{data.winRate.toFixed(1)}%</strong>
          </p>
        </div>
      );
    }
    return null;
  };

  const renderLineChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={chartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="dateDisplay"
          tick={{ fontSize: 12 }}
          axisLine={{ stroke: "#d9d9d9" }}
        />
        <YAxis
          tick={{ fontSize: 12 }}
          axisLine={{ stroke: "#d9d9d9" }}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Line
          type="monotone"
          dataKey="totalTrading"
          stroke="#1890ff"
          strokeWidth={2}
          name="Tổng giao dịch"
          dot={{ fill: "#1890ff", strokeWidth: 2, r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="totalWinAmount"
          stroke="#52c41a"
          strokeWidth={2}
          name="Tổng thắng"
          dot={{ fill: "#52c41a", strokeWidth: 2, r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="pnl"
          stroke="#ff7300"
          strokeWidth={3}
          name="P&L"
          dot={{ fill: "#ff7300", strokeWidth: 2, r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );

  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={chartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="dateDisplay"
          tick={{ fontSize: 12 }}
          axisLine={{ stroke: "#d9d9d9" }}
        />
        <YAxis
          tick={{ fontSize: 12 }}
          axisLine={{ stroke: "#d9d9d9" }}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar dataKey="totalTrading" fill="#1890ff" name="Tổng giao dịch" />
        <Bar dataKey="totalWinAmount" fill="#52c41a" name="Tổng thắng" />
        <Bar dataKey="pnl" fill="#ff7300" name="P&L" />
      </BarChart>
    </ResponsiveContainer>
  );

  const renderComposedChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart
        data={chartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="dateDisplay"
          tick={{ fontSize: 12 }}
          axisLine={{ stroke: "#d9d9d9" }}
        />
        <YAxis
          yAxisId="left"
          tick={{ fontSize: 12 }}
          axisLine={{ stroke: "#d9d9d9" }}
          tickFormatter={(value) => `$${value}`}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tick={{ fontSize: 12 }}
          axisLine={{ stroke: "#d9d9d9" }}
          tickFormatter={(value) => `${value}%`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar
          yAxisId="left"
          dataKey="totalTrading"
          fill="#1890ff"
          fillOpacity={0.6}
          name="Tổng giao dịch"
        />
        <Bar
          yAxisId="left"
          dataKey="totalWinAmount"
          fill="#52c41a"
          fillOpacity={0.8}
          name="Tổng thắng"
        />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="pnl"
          stroke="#ff7300"
          strokeWidth={3}
          name="P&L"
          dot={{ fill: "#ff7300", strokeWidth: 2, r: 5 }}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="winRate"
          stroke="#722ed1"
          strokeWidth={2}
          strokeDasharray="5 5"
          name="Tỷ lệ thắng (%)"
          dot={{ fill: "#722ed1", strokeWidth: 2, r: 4 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );

  const renderChart = () => {
    switch (chartType) {
      case "line":
        return renderLineChart();
      case "bar":
        return renderBarChart();
      case "composed":
        return renderComposedChart();
      default:
        return renderComposedChart();
    }
  };

  return (
    <Card
      title={
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Title level={4} style={{ margin: 0, color: "#262626" }}>
            📈 Biểu đồ P&L theo ngày
          </Title>
          <Radio.Group
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
            size="small"
          >
            <Radio.Button value="composed">Tổng hợp</Radio.Button>
            <Radio.Button value="line">Đường</Radio.Button>
            <Radio.Button value="bar">Cột</Radio.Button>
          </Radio.Group>
        </div>
      }
      style={{
        marginBottom: 24,
        background: "linear-gradient(135deg, #f6f9fc 0%, #ffffff 100%)",
        border: "1px solid #e6f4ff",
        borderRadius: 8,
        boxShadow: "0 2px 8px rgba(24, 144, 255, 0.06)",
      }}
      bodyStyle={{
        background: "linear-gradient(135deg, #fafcff 0%, #f0f8ff 100%)",
        borderRadius: "0 0 8px 8px",
      }}
    >
      {chartData.length > 0 ? (
        <>
          {renderChart()}

          {/* Chart Legend Description */}
          <div
            style={{
              marginTop: 16,
              padding: 12,
              background: "linear-gradient(135deg, #f0f8ff 0%, #e6f4ff 100%)",
              borderRadius: 6,
              fontSize: 12,
              color: "#434343",
              border: "1px solid #d6e4ff",
            }}
          >
            <Space wrap style={{ gap: "16px" }}>
              {(chartType === 'line' || chartType === 'bar' || chartType === 'composed') && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "4px 12px",
                    backgroundColor: "rgba(24, 144, 255, 0.15)",
                    borderRadius: "12px",
                    border: "1px solid #1890ff",
                    fontSize: "13px",
                  }}
                >
                  <span
                    style={{
                      width: "10px",
                      height: "10px",
                      backgroundColor: "#1890ff",
                      borderRadius: "50%",
                      display: "inline-block",
                      border: "1px solid #fff",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                    }}
                  ></span>
                  <span style={{ fontWeight: 600, color: "#1890ff" }}>Tổng giao dịch</span>
                </span>
              )}

              {(chartType === 'line' || chartType === 'bar' || chartType === 'composed') && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "4px 12px",
                    backgroundColor: "rgba(82, 196, 26, 0.15)",
                    borderRadius: "12px",
                    border: "1px solid #52c41a",
                    fontSize: "13px",
                  }}
                >
                  <span
                    style={{
                      width: "10px",
                      height: "10px",
                      backgroundColor: "#52c41a",
                      borderRadius: "50%",
                      display: "inline-block",
                      border: "1px solid #fff",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                    }}
                  ></span>
                  <span style={{ fontWeight: 600, color: "#52c41a" }}>Tổng thắng</span>
                </span>
              )}

              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "4px 12px",
                  backgroundColor: "rgba(255, 115, 0, 0.15)",
                  borderRadius: "12px",
                  border: "1px solid #ff7300",
                  fontSize: "13px",
                }}
              >
                <span
                  style={{
                    width: "10px",
                    height: "10px",
                    backgroundColor: "#ff7300",
                    borderRadius: "50%",
                    display: "inline-block",
                    border: "1px solid #fff",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                  }}
                ></span>
                <span style={{ fontWeight: 600, color: "#ff7300" }}>P&L (Lợi nhuận/Lỗ)</span>
              </span>

              {chartType === "composed" && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "4px 12px",
                    backgroundColor: "rgba(114, 46, 209, 0.15)",
                    borderRadius: "12px",
                    border: "1px solid #722ed1",
                    fontSize: "13px",
                  }}
                >
                  <span
                    style={{
                      width: "10px",
                      height: "10px",
                      backgroundColor: "#722ed1",
                      borderRadius: "50%",
                      display: "inline-block",
                      border: "1px solid #fff",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                    }}
                  ></span>
                  <span style={{ fontWeight: 600, color: "#722ed1" }}>Tỷ lệ thắng (%)</span>
                </span>
              )}
            </Space>
          </div>
        </>
      ) : (
        <div
          style={{
            height: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#8c8c8c",
            background: "linear-gradient(135deg, #fafcff 0%, #f0f8ff 100%)",
            borderRadius: 6,
            border: "1px dashed #d6e4ff",
          }}
        >
          Không có dữ liệu để hiển thị biểu đồ
        </div>
      )}
    </Card>
  );
};

export default PnLChart;
