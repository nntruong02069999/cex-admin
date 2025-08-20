import React, { useState } from "react";
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
} from "antd";
import {
  FilterOutlined,
  ReloadOutlined,
  DownloadOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import moment, { Moment } from "moment";
import {
  CustomerDetailData,
  Order,
  OrderSide,
  OrderStatus,
  OrderType,
  TradingPnLSummary,
} from "../types/customer.types";
import { formatCurrency, formatDate } from "../utils/formatters";
import { calculateWinRate } from "../utils/helpers";
import OrderDetailModal from "./OrderDetailModal";
import PnLChart from "./PnLChart";
import "./styles.less";

const { RangePicker } = DatePicker;
const { Option } = Select;
type RangeValue = [Moment | null, Moment | null] | null;

interface TradingHistoryTabProps {
  customerId: number;
  customerData: CustomerDetailData;
}

const TradingHistoryTab: React.FC<TradingHistoryTabProps> = ({
  customerId,
  customerData,
}) => {
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [dateRange, setDateRange] = useState<RangeValue>(null);
  const [sideFilter, setSideFilter] = useState<string | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(
    undefined
  );
  const [issueNumberFilter, setIssueNumberFilter] = useState<string>("");
  const [resultFilter, setResultFilter] = useState<string | undefined>(
    undefined
  );
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const winRate = calculateWinRate(
    customerData.customerMoney.totalTradeWinCount,
    customerData.customerMoney.totalTradeCount
  );

  // Mock trading orders with complete Order model
  const tradingOrders: Order[] = [
    {
      id: 1,
      customerId: customerId,
      customer: customerData.customer,
      side: OrderSide.BUY,
      amount: 100.0,
      fee: 2.0,
      realAmount: 98.0,
      symbol: "BTCUSDT",
      configProfit: 0.95,
      status: OrderStatus.SUCCESS,
      type: OrderType.LIVE,
      issueNumber: "BTC20240820001",
      idChart: 12345,
      chartResult: "BUY",
      entryPrice: 65000.0,
      openingPrice: 65000.0,
      closingPrice: 65850.0,
      resultProfit: 85.0,
      winAmount: 183.0,
      duration: 300,
      orderNumber: "ORD001",
      notes: "Lệnh BUY thành công",
      fromMktAccount: false,
      createdAt: Date.now() / 1000,
      updatedAt: Date.now() / 1000,
    },
    {
      id: 2,
      customerId: customerId,
      customer: customerData.customer,
      side: OrderSide.SELL,
      amount: 50.0,
      fee: 1.0,
      realAmount: 49.0,
      symbol: "ETHUSDT",
      configProfit: 0.95,
      status: OrderStatus.FAILED,
      type: OrderType.LIVE,
      issueNumber: "ETH20240820002",
      idChart: 12346,
      chartResult: "BUY",
      entryPrice: 3200.0,
      openingPrice: 3200.0,
      closingPrice: 3180.0,
      resultProfit: -50.0,
      winAmount: 0.0,
      duration: 300,
      orderNumber: "ORD002",
      notes: "Lệnh SELL thất bại",
      fromMktAccount: false,
      createdAt: (Date.now() - 300000) / 1000,
      updatedAt: (Date.now() - 300000) / 1000,
    },
    {
      id: 3,
      customerId: customerId,
      customer: customerData.customer,
      side: OrderSide.BUY,
      amount: 200.0,
      fee: 4.0,
      realAmount: 196.0,
      symbol: "BTCUSDT",
      configProfit: 0.95,
      status: OrderStatus.SUCCESS,
      type: OrderType.DEMO,
      issueNumber: "BTC20240820003",
      idChart: 12347,
      chartResult: "BUY",
      entryPrice: 65100.0,
      openingPrice: 65100.0,
      closingPrice: 65100.0,
      resultProfit: 0.0,
      winAmount: 196.0,
      duration: 300,
      orderNumber: "ORD003",
      notes: "Lệnh BUY hòa (Demo)",
      fromMktAccount: true,
      createdAt: (Date.now() - 600000) / 1000,
      updatedAt: (Date.now() - 600000) / 1000,
    },
    {
      id: 4,
      customerId: customerId,
      customer: customerData.customer,
      side: OrderSide.SELL,
      amount: 150.0,
      fee: 3.0,
      realAmount: 147.0,
      symbol: "BNBUSDT",
      configProfit: 0.95,
      status: OrderStatus.SUCCESS,
      type: OrderType.LIVE,
      issueNumber: "BNB20240820004",
      idChart: 12348,
      chartResult: "SELL",
      entryPrice: 580.0,
      openingPrice: 580.0,
      closingPrice: 575.0,
      resultProfit: 139.65,
      winAmount: 286.65,
      duration: 300,
      orderNumber: "ORD004",
      notes: "Lệnh SELL thành công",
      fromMktAccount: false,
      createdAt: (Date.now() - 900000) / 1000,
      updatedAt: (Date.now() - 900000) / 1000,
    },
    {
      id: 5,
      customerId: customerId,
      customer: customerData.customer,
      side: OrderSide.BUY,
      amount: 75.0,
      fee: 1.5,
      realAmount: 73.5,
      symbol: "ADAUSDT",
      configProfit: 0.95,
      status: OrderStatus.PENDING,
      type: OrderType.LIVE,
      issueNumber: "ADA20240820005",
      idChart: 12349,
      entryPrice: 0.45,
      openingPrice: 0.45,
      closingPrice: 0.0,
      resultProfit: 0.0,
      winAmount: 0.0,
      duration: 300,
      orderNumber: "ORD005",
      notes: "Lệnh BUY đang chờ",
      fromMktAccount: false,
      createdAt: (Date.now() - 1200000) / 1000,
      updatedAt: (Date.now() - 1200000) / 1000,
    },
  ];

  // Mock P&L Summary Data
  const pnlSummaryData: TradingPnLSummary[] = [
    {
      date: moment().format("YYYY-MM-DD"),
      totalTrading: 525.0,
      totalWinAmount: 469.65,
    },
    {
      date: moment().subtract(1, "day").format("YYYY-MM-DD"),
      totalTrading: 300.0,
      totalWinAmount: 285.0,
    },
    {
      date: moment().subtract(2, "days").format("YYYY-MM-DD"),
      totalTrading: 450.0,
      totalWinAmount: 200.0,
    },
    {
      date: moment().subtract(3, "days").format("YYYY-MM-DD"),
      totalTrading: 525.0,
      totalWinAmount: 469.65,
    },
    {
      date: moment().subtract(4, "days").format("YYYY-MM-DD"),
      totalTrading: 300.0,
      totalWinAmount: 285.0,
    },
    {
      date: moment().subtract(5, "days").format("YYYY-MM-DD"),
      totalTrading: 450.0,
      totalWinAmount: 200.0,
    },
  ];

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

  // Apply filters
  const applyFilters = () => {
    let filtered = [...tradingOrders];

    // Date range filter
    if (dateRange) {
      const [startDate, endDate] = dateRange;
      filtered = filtered.filter((order) => {
        const orderDate = moment.unix(order.createdAt || 0);
        return (
          orderDate.isAfter(startDate?.startOf("day")) &&
          orderDate.isBefore(endDate?.endOf("day"))
        );
      });
    }

    // Side filter
    if (sideFilter) {
      filtered = filtered.filter((order) => order.side === sideFilter);
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    // Issue number filter
    if (issueNumberFilter) {
      filtered = filtered.filter((order) =>
        order.issueNumber
          .toLowerCase()
          .includes(issueNumberFilter.toLowerCase())
      );
    }

    // Result filter (WIN/LOSS/DRAW)
    if (resultFilter) {
      filtered = filtered.filter((order) => {
        const result = getOrderResult(order);
        return result === resultFilter;
      });
    }

    setFilteredOrders(filtered);
  };

  // Apply filters whenever filter values change
  React.useEffect(() => {
    applyFilters();
  }, [dateRange, sideFilter, statusFilter, issueNumberFilter, resultFilter]);

  // Initialize filtered orders
  React.useEffect(() => {
    setFilteredOrders(tradingOrders);
  }, []);

  const clearFilters = () => {
    setDateRange(null);
    setSideFilter(undefined);
    setStatusFilter(undefined);
    setIssueNumberFilter("");
    setResultFilter(undefined);
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
            <Statistic
              title="📊 Tổng lệnh"
              value={customerData.customerMoney.totalTradeCount}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="🏆 Tỷ lệ thắng"
              value={winRate}
              precision={1}
              suffix="%"
              valueStyle={{
                color:
                  winRate >= 70
                    ? "#3f8600"
                    : winRate >= 50
                    ? "#faad14"
                    : "#cf1322",
              }}
            />
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="💰 Volume"
              value={customerData.customerMoney.totalTradeAmount}
              precision={2}
              suffix="$"
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="💎 Lời/Lỗ"
              value={
                customerData.customerMoney.totalTradeAmountWin -
                customerData.customerMoney.totalTradeAmountLose
              }
              precision={2}
              suffix="$"
              valueStyle={{
                color:
                  customerData.customerMoney.totalTradeAmountWin -
                    customerData.customerMoney.totalTradeAmountLose >=
                  0
                    ? "#3f8600"
                    : "#cf1322",
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* P&L Chart Section */}
      <PnLChart data={pnlSummaryData} />

      {/* Filter Section */}
      <Card 
        style={{ 
          marginBottom: 24,
          background: 'linear-gradient(135deg, #f9f9f9 0%, #ffffff 100%)',
          border: '1px solid #e8e8e8',
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
        }}
        bodyStyle={{
          background: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)',
          borderRadius: '0 0 8px 8px'
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

            <Button icon={<ReloadOutlined />} onClick={clearFilters}>
              Xóa bộ lọc
            </Button>

            <Button 
              type="primary" 
              icon={<FilterOutlined />}
              style={{
                background: 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)',
                border: 'none',
                boxShadow: '0 2px 4px rgba(24, 144, 255, 0.3)'
              }}
            >
              Lọc ({filteredOrders.length})
            </Button>
          </Space>
        </div>
      </Card>

      {/* Orders History Table */}
      <Card 
        title={`📋 Lịch sử Lệnh (${filteredOrders.length})`}
        style={{
          background: 'linear-gradient(135deg, #fdfdfd 0%, #ffffff 100%)',
          border: '1px solid #f0f0f0',
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)'
        }}
        bodyStyle={{
          background: '#ffffff',
          borderRadius: '0 0 8px 8px'
        }}
      >
        <Table
          dataSource={filteredOrders}
          columns={columns}
          rowKey="id"
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} lệnh`,
            pageSizeOptions: ["10", "20", "50", "100"],
          }}
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
