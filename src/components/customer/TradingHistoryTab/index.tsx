import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Statistic,
  Table,
  Tag,
  Button,
  Input,
  Select,
  DatePicker,
  Space,
  message,
  Spin,
} from "antd";
import {
  FilterOutlined,
  ReloadOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { Moment } from "moment";
import {
  Order,
  OrderSide,
  OrderStatus,
  OrderType,
  TradingPnLSummary,
} from "../types/customer.types";
import {
  getCustomerTradingHistory,
  getCustomerTradingPnLSummary,
  getCustomerTradingSummary,
} from "../../../services/customer";
import { formatCurrency, formatDate } from "../utils/formatters";
import OrderDetailModal from "./OrderDetailModal";
import PnLChart from "./PnLChart";
import "./styles.less";
import {
  TradingHistoryParams,
  TradingPnLSummaryParams,
  TradingSummaryResponse,
} from "../types/trading.types";

const { RangePicker } = DatePicker;
const { Option } = Select;
type RangeValue = [Moment | null, Moment | null] | null;

interface TradingHistoryTabProps {
  customerId: number;
}

const TradingHistoryTab: React.FC<TradingHistoryTabProps> = ({
  customerId,
}) => {
  // API State
  const [tradingHistory, setTradingHistory] = useState<Order[]>([]);
  const [tradingSummary, setTradingSummary] =
    useState<TradingSummaryResponse | null>(null);
  const [pnlSummaryData, setPnlSummaryData] = useState<TradingPnLSummary[]>([]);

  // Loading States
  const [historyLoading, setHistoryLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [pnlLoading, setPnlLoading] = useState(false);

  // Pagination State
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Filter State
  const [dateRange, setDateRange] = useState<RangeValue>(null);
  const [sideFilter, setSideFilter] = useState<string | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(
    undefined
  );
  const [issueNumberFilter, setIssueNumberFilter] = useState<string>("");
  const [resultFilter, setResultFilter] = useState<string | undefined>(
    undefined
  );

  // Modal State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Load all data on component mount
  useEffect(() => {
    loadTradingSummary();
    loadPnLSummary();
    loadTradingHistory();
  }, [customerId]);

  // Load trading history when filters or pagination changes
  useEffect(() => {
    loadTradingHistory();
  }, [pagination.current, pagination.pageSize]);

  // API Loading Functions
  const loadTradingSummary = async () => {
    setSummaryLoading(true);
    try {
      const response = await getCustomerTradingSummary(customerId);

      if (response.errorCode) {
        message.error(
          response.message || "Có lỗi xảy ra khi tải dữ liệu tổng quan"
        );
        return;
      }

      setTradingSummary(response.data);
    } catch (error) {
      message.error("Có lỗi xảy ra khi tải dữ liệu tổng quan");
      console.error("Error loading trading summary:", error);
    } finally {
      setSummaryLoading(false);
    }
  };

  const loadPnLSummary = async () => {
    setPnlLoading(true);
    try {

      const response = await getCustomerTradingPnLSummary(customerId);

      if (response.errorCode) {
        message.error(
          response.message || "Có lỗi xảy ra khi tải dữ liệu biểu đồ"
        );
        return;
      }

      setPnlSummaryData(response.data || []);
    } catch (error) {
      message.error("Có lỗi xảy ra khi tải dữ liệu biểu đồ");
      console.error("Error loading PnL summary:", error);
    } finally {
      setPnlLoading(false);
    }
  };

  const loadTradingHistory = async () => {
    setHistoryLoading(true);
    try {
      const params: TradingHistoryParams = {
        page: pagination.current,
        limit: pagination.pageSize,
        side: sideFilter,
        status: statusFilter,
        issueNumber: issueNumberFilter || undefined,
        result: resultFilter,
        fromDate: dateRange?.[0]?.valueOf(),
        toDate: dateRange?.[1]?.valueOf(),
      };

      const response = await getCustomerTradingHistory(customerId, params);

      if (response.errorCode) {
        message.error(
          response.message || "Có lỗi xảy ra khi tải lịch sử giao dịch"
        );
        return;
      }

      setTradingHistory(response.data || []);
      setPagination((prev) => ({
        ...prev,
        total: response.total || 0,
      }));
    } catch (error) {
      message.error("Có lỗi xảy ra khi tải lịch sử giao dịch");
      console.error("Error loading trading history:", error);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Helper functions
  const getOrderResult = (order: Order): "WIN" | "LOSS" | "DRAW" => {
    if (order.status !== OrderStatus.SUCCESS) return "LOSS";
    if (order.resultProfit > 0) return "WIN";
    if (order.resultProfit < 0) return "LOSS";
    return "DRAW";
  };

  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return "⏳ Chờ";
      case OrderStatus.SUCCESS:
        return "🏆 WIN";
      case OrderStatus.FAILED:
        return "❌ LOST";
      case OrderStatus.CANCELLED:
        return "❌ LOST";
      case OrderStatus.EXPIRED:
        return "❌ LOST";
      default:
        return status;
    }
  };

  const getSideText = (side: OrderSide) => {
    switch (side) {
      case OrderSide.BUY:
        return "📈 MUA";
      case OrderSide.SELL:
        return "📉 BÁN";
      default:
        return side;
    }
  };

  const getTypeText = (type: OrderType) => {
    switch (type) {
      case OrderType.LIVE:
        return "🔴 LIVE";
      case OrderType.DEMO:
        return "🟡 DEMO";
      default:
        return type;
    }
  };

  // Handle filter changes - reload data from API
  const handleFilterChange = () => {
    setPagination((prev) => ({ ...prev, current: 1 })); // Reset to first page
    loadTradingHistory();
  };

  const clearFilters = () => {
    setDateRange(null);
    setSideFilter(undefined);
    setStatusFilter(undefined);
    setIssueNumberFilter("");
    setResultFilter(undefined);
    setPagination((prev) => ({ ...prev, current: 1 })); // Reset to first page
    // Data will reload via useEffect dependency
  };

  // Trigger reload when filters change
  useEffect(() => {
    if (pagination.current !== 1) {
      setPagination((prev) => ({ ...prev, current: 1 }));
    } else {
      loadTradingHistory();
    }
  }, [dateRange, sideFilter, statusFilter, issueNumberFilter, resultFilter]);

  const handleTableChange = (paginationInfo: any) => {
    setPagination((prev) => ({
      ...prev,
      current: paginationInfo.current,
      pageSize: paginationInfo.pageSize,
    }));
  };

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedOrder(null);
  };

  const columns = [
    {
      title: "Thời gian",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 140,
      render: (createdAt: number) => formatDate(createdAt, "DISPLAY"),
    },
    {
      title: "Số phiên",
      dataIndex: "issueNumber",
      key: "issueNumber",
      width: 120,
      render: (issueNumber: string) => (
        <span
          style={{
            fontFamily: "monospace",
            fontSize: "12px",
            color: "#1890ff",
          }}
        >
          {issueNumber}
        </span>
      ),
    },
    {
      title: "Cược",
      dataIndex: "side",
      key: "side",
      width: 90,
      render: (side: OrderSide) => (
        <Tag
          color={side === OrderSide.BUY ? "green" : "red"}
          style={{ margin: 0 }}
        >
          {getSideText(side)}
        </Tag>
      ),
    },
    {
      title: "Loại Giao dịch",
      dataIndex: "type",
      key: "type",
      width: 80,
      render: (type: OrderType) => (
        <Tag
          color={type === OrderType.LIVE ? "red" : "orange"}
          style={{ margin: 0 }}
        >
          {getTypeText(type)}
        </Tag>
      ),
    },
    {
      title: "Số tiền",
      dataIndex: "amount",
      key: "amount",
      width: 100,
      render: (amount: number) => (
        <span className="transaction-amount neutral">
          {formatCurrency(amount)}
        </span>
      ),
    },
    {
      title: "Phí",
      dataIndex: "fee",
      key: "fee",
      width: 80,
      render: (fee: number) => (
        <span style={{ color: "#999", fontSize: "12px" }}>
          {formatCurrency(fee)}
        </span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 110,
      render: (status: OrderStatus) => {
        let color = "default";
        switch (status) {
          case OrderStatus.SUCCESS:
            color = "success";
            break;
          case OrderStatus.FAILED:
            color = "error";
            break;
          case OrderStatus.PENDING:
            color = "processing";
            break;
          case OrderStatus.CANCELLED:
            color = "warning";
            break;
          case OrderStatus.EXPIRED:
            color = "default";
            break;
        }
        return (
          <Tag color={color} style={{ margin: 0 }}>
            {getStatusText(status)}
          </Tag>
        );
      },
    },
    {
      title: "Kết quả",
      key: "result",
      width: 90,
      render: (_: any, order: Order) => {
        const result = getOrderResult(order);
        return (
          <Tag
            color={
              result === "WIN"
                ? "success"
                : result === "LOSS"
                ? "error"
                : "warning"
            }
            style={{ margin: 0 }}
          >
            {result === "WIN"
              ? "🏆 THẮNG"
              : result === "LOSS"
              ? "❌ THUA"
              : "🤝 HÒA"}
          </Tag>
        );
      },
    },
    {
      title: "P&L",
      dataIndex: "resultProfit",
      key: "resultProfit",
      width: 100,
      render: (resultProfit: number) => (
        <span
          className={`transaction-amount ${
            resultProfit > 0
              ? "positive"
              : resultProfit < 0
              ? "negative"
              : "neutral"
          }`}
        >
          {resultProfit > 0 ? "+" : ""}
          {formatCurrency(resultProfit)}
        </span>
      ),
    },
    {
      title: "Thắng",
      dataIndex: "winAmount",
      key: "winAmount",
      width: 100,
      render: (winAmount: number) => (
        <span className="transaction-amount positive">
          {formatCurrency(winAmount)}
        </span>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 80,
      render: (_: any, order: Order) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => handleOrderClick(order)}
          size="small"
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div className="trading-history-tab">
      {/* Dashboard Metrics */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card>
            {summaryLoading ? (
              <div style={{ textAlign: "center", padding: "20px" }}>
                <Spin />
              </div>
            ) : (
              <Statistic
                title="📊 Tổng lệnh"
                value={tradingSummary?.totalTradeCount || 0}
                valueStyle={{ color: "#1890ff" }}
              />
            )}
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card>
            {summaryLoading ? (
              <div style={{ textAlign: "center", padding: "20px" }}>
                <Spin />
              </div>
            ) : (
              <Statistic
                title="🏆 Tỷ lệ thắng"
                value={tradingSummary?.winRate || 0}
                precision={1}
                suffix="%"
                valueStyle={{
                  color:
                    (tradingSummary?.winRate || 0) >= 70
                      ? "#3f8600"
                      : (tradingSummary?.winRate || 0) >= 50
                      ? "#faad14"
                      : "#cf1322",
                }}
              />
            )}
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card>
            {summaryLoading ? (
              <div style={{ textAlign: "center", padding: "20px" }}>
                <Spin />
              </div>
            ) : (
              <Statistic
                title="💰 Volume"
                value={tradingSummary?.totalTradeAmount || 0}
                precision={2}
                suffix="$"
                valueStyle={{ color: "#52c41a" }}
              />
            )}
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card>
            {summaryLoading ? (
              <div style={{ textAlign: "center", padding: "20px" }}>
                <Spin />
              </div>
            ) : (
              <Statistic
                title="💎 Lời/Lỗ"
                value={tradingSummary?.netPnL || 0}
                precision={2}
                suffix="$"
                valueStyle={{
                  color:
                    (tradingSummary?.netPnL || 0) >= 0 ? "#3f8600" : "#cf1322",
                }}
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* P&L Chart Section */}
      {pnlLoading ? (
        <Card title="📈 Biểu đồ P&L" style={{ marginBottom: 24 }}>
          <div style={{ textAlign: "center", padding: "40px" }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>Đang tải dữ liệu biểu đồ...</div>
          </div>
        </Card>
      ) : (
        <PnLChart data={pnlSummaryData} />
      )}

      {/* Filter Section */}
      <Card
        style={{
          marginBottom: 24,
          background: "linear-gradient(135deg, #f9f9f9 0%, #ffffff 100%)",
          border: "1px solid #e8e8e8",
          borderRadius: 8,
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
        }}
        bodyStyle={{
          background: "linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)",
          borderRadius: "0 0 8px 8px",
        }}
      >
        <div style={{ marginBottom: 16 }}>
          <Space wrap>
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              placeholder={["Từ ngày", "Đến ngày"]}
              format="DD/MM/YYYY"
              style={{ width: 240 }}
            />

            <Input
              placeholder="Tìm theo số phiên"
              value={issueNumberFilter}
              onChange={(e) => setIssueNumberFilter(e.target.value)}
              style={{ width: 150 }}
              allowClear
            />

            <Select
              placeholder="Cược"
              value={sideFilter}
              onChange={setSideFilter}
              style={{ width: 120 }}
              allowClear
            >
              <Option value={OrderSide.BUY}>📈 MUA</Option>
              <Option value={OrderSide.SELL}>📉 BÁN</Option>
            </Select>

            <Select
              placeholder="Trạng thái"
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 120 }}
              allowClear
            >
              <Option value={OrderStatus.PENDING}>Chờ</Option>
              <Option value={OrderStatus.SUCCESS}>WIN</Option>
              <Option value={OrderStatus.FAILED}>LOST</Option>
            </Select>

            <Select
              placeholder="Kết quả"
              value={resultFilter}
              onChange={setResultFilter}
              style={{ width: 100 }}
              allowClear
            >
              <Option value="WIN">🏆 THẮNG</Option>
              <Option value="LOSS">❌ THUA</Option>
              <Option value="DRAW">🤝 HÒA</Option>
            </Select>

            <Button
              icon={<ReloadOutlined />}
              onClick={clearFilters}
              loading={historyLoading}
            >
              Xóa bộ lọc
            </Button>

            <Button
              type="primary"
              icon={<FilterOutlined />}
              onClick={handleFilterChange}
              loading={historyLoading}
              style={{
                background: "linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)",
                border: "none",
                boxShadow: "0 2px 4px rgba(24, 144, 255, 0.3)",
              }}
            >
              Lọc ({pagination.total})
            </Button>
          </Space>
        </div>
      </Card>

      {/* Orders History Table */}
      <Card
        title={`📋 Lịch sử Lệnh (${pagination.total})`}
        style={{
          background: "linear-gradient(135deg, #fdfdfd 0%, #ffffff 100%)",
          border: "1px solid #f0f0f0",
          borderRadius: 8,
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.02)",
        }}
        bodyStyle={{
          background: "#ffffff",
          borderRadius: "0 0 8px 8px",
        }}
      >
        <Table
          dataSource={tradingHistory}
          columns={columns}
          rowKey="id"
          loading={historyLoading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} lệnh`,
            pageSizeOptions: ["10", "20", "50", "100"],
          }}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
          size="small"
        />
      </Card>

      {/* Order Detail Modal */}
      <OrderDetailModal
        visible={isModalVisible}
        onClose={handleModalClose}
        order={selectedOrder}
      />
    </div>
  );
};

export default TradingHistoryTab;
