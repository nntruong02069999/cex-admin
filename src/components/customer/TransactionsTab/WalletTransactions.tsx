import React, { useState } from "react";
import {
  Table,
  Tag,
  Card,
  Row,
  Col,
  DatePicker,
  Select,
  Button,
  Space,
} from "antd";
import { FilterOutlined, ClearOutlined } from "@ant-design/icons";
import { formatCurrency, formatDate } from "../utils/formatters";
import { getStatusColor } from "../utils/helpers";
import {
  WalletTransaction,
  WalletTranferType,
  WalletTransactionStatus,
} from "../types/customer.types";
import moment, { Moment } from "moment";

const { RangePicker } = DatePicker;
const { Option } = Select;

type RangeValue = [Moment, Moment] | null;

interface WalletTransactionsProps {
  transactions: WalletTransaction[];
  loading?: boolean;
}

const WalletTransactions: React.FC<WalletTransactionsProps> = ({
  transactions,
  loading = false,
}) => {
  const [filteredTransactions, setFilteredTransactions] =
    useState<WalletTransaction[]>(transactions);
  const [dateRange, setDateRange] = useState<RangeValue>(null);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(
    undefined
  );
  const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined);

  // Filter function
  const applyFilters = () => {
    let filtered = [...transactions];

    // Date range filter
    if (dateRange) {
      const [startDate, endDate] = dateRange;
      filtered = filtered.filter((transaction) => {
        const transactionDate = moment.unix(transaction.createdAt || 0);
        return (
          transactionDate.isAfter(startDate.startOf("day")) &&
          transactionDate.isBefore(endDate.endOf("day"))
        );
      });
    }

    // Status filter
    if (statusFilter && statusFilter !== "ALL") {
      filtered = filtered.filter(
        (transaction) => transaction.status === statusFilter
      );
    }

    // Type filter
    if (typeFilter && typeFilter !== "ALL") {
      filtered = filtered.filter(
        (transaction) => transaction.type === typeFilter
      );
    }

    setFilteredTransactions(filtered);
  };

  // Clear filters
  const clearFilters = () => {
    setDateRange(null);
    setStatusFilter(undefined);
    setTypeFilter(undefined);
    setFilteredTransactions(transactions);
  };

  // Apply filters whenever filters change
  React.useEffect(() => {
    applyFilters();
  }, [dateRange, statusFilter, typeFilter, transactions]);

  const getTypeText = (type: WalletTranferType) => {
    switch (type) {
      case WalletTranferType.IN:
        return "⬇️ Vào ví";
      case WalletTranferType.OUT:
        return "⬆️ Ra khỏi ví";
      default:
        return type;
    }
  };

  const getStatusText = (status: WalletTransactionStatus) => {
    switch (status) {
      case WalletTransactionStatus.SUCCESS:
        return "Thành công";
      case WalletTransactionStatus.PENDING:
        return "Chờ xử lý";
      case WalletTransactionStatus.FAILED:
        return "Thất bại";
      default:
        return status;
    }
  };

  const getTypeColor = (type: WalletTranferType) => {
    switch (type) {
      case WalletTranferType.IN:
        return "green";
      case WalletTranferType.OUT:
        return "red";
      default:
        return "default";
    }
  };

  const columns = [
    {
      title: "Thời gian",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (createdAt: number) => formatDate(createdAt, "DISPLAY"),
      sorter: (a: WalletTransaction, b: WalletTransaction) =>
        (a.createdAt || 0) - (b.createdAt || 0),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (email: string) => (
        <span style={{ fontSize: "12px", color: "#666" }}>{email}</span>
      ),
    },
    {
      title: "Nickname",
      dataIndex: "nickname",
      key: "nickname",
      render: (nickname: string) => (
        <span style={{ fontSize: "12px", fontWeight: "500" }}>{nickname}</span>
      ),
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      render: (type: WalletTranferType) => (
        <Tag color={getTypeColor(type)}>{getTypeText(type)}</Tag>
      ),
    },
    {
      title: "Số tiền",
      dataIndex: "amount",
      key: "amount",
      render: (amount: number) => {
        const isPositive = amount > 0;
        return (
          <span
            style={{
              color: isPositive ? "#3f8600" : "#cf1322",
              fontWeight: "bold",
              fontFamily:
                "SFMono-Regular, Consolas, Liberation Mono, Menlo, Courier, monospace",
            }}
          >
            {isPositive ? "+" : ""}
            {formatCurrency(Math.abs(amount))}
          </span>
        );
      },
      sorter: (a: WalletTransaction, b: WalletTransaction) =>
        a.amount - b.amount,
    },
    {
      title: "Số dư Ví",
      dataIndex: "balance",
      key: "balance",
      render: (balance: number) => (
        <span
          style={{
            fontWeight: "500",
            color: "#666",
            fontFamily:
              "SFMono-Regular, Consolas, Liberation Mono, Menlo, Courier, monospace",
          }}
        >
          {formatCurrency(balance)}
        </span>
      ),
    },
    {
      title: "Số dư USDT",
      dataIndex: "balanceUSDT",
      key: "balanceUSDT",
      render: (balanceUSDT: number) => (
        <span
          style={{
            fontWeight: "500",
            color: "#666",
            fontFamily:
              "SFMono-Regular, Consolas, Liberation Mono, Menlo, Courier, monospace",
          }}
        >
          {formatCurrency(balanceUSDT, "USDT")}
        </span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: WalletTransactionStatus) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
  ];

  return (
    <div className="wallet-transactions">
      {/* Filter Section */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col span={6}>
            <Space direction="vertical" size="small" style={{ width: "100%" }}>
              <span style={{ fontSize: "12px", fontWeight: 500 }}>
                Khoảng thời gian:
              </span>
              <RangePicker
                size="small"
                value={dateRange}
                onChange={(dates) => setDateRange(dates as RangeValue)}
                format="DD/MM/YYYY"
                placeholder={["Từ ngày", "Đến ngày"]}
                style={{ width: "100%" }}
              />
            </Space>
          </Col>

          <Col span={4}>
            <Space direction="vertical" size="small" style={{ width: "100%" }}>
              <span style={{ fontSize: "12px", fontWeight: 500 }}>
                Trạng thái:
              </span>
              <Select
                size="small"
                value={statusFilter}
                onChange={setStatusFilter}
                placeholder="Chọn trạng thái"
                style={{ width: "100%" }}
                allowClear
              >
                <Option value="ALL">Tất cả</Option>
                <Option value={WalletTransactionStatus.SUCCESS}>
                  Thành công
                </Option>
                <Option value={WalletTransactionStatus.PENDING}>
                  Chờ xử lý
                </Option>
                <Option value={WalletTransactionStatus.FAILED}>Thất bại</Option>
              </Select>
            </Space>
          </Col>

          <Col span={4}>
            <Space direction="vertical" size="small" style={{ width: "100%" }}>
              <span style={{ fontSize: "12px", fontWeight: 500 }}>Loại:</span>
              <Select
                size="small"
                value={typeFilter}
                onChange={setTypeFilter}
                placeholder="Chọn loại"
                style={{ width: "100%" }}
                allowClear
              >
                <Option value="ALL">Tất cả</Option>
                <Option value={WalletTranferType.IN}>Vào ví</Option>
                <Option value={WalletTranferType.OUT}>Ra khỏi ví</Option>
              </Select>
            </Space>
          </Col>

          <Col span={6}>
            <Space style={{ marginTop: 18 }}>
              <Button
                type="primary"
                icon={<FilterOutlined />}
                size="small"
                onClick={applyFilters}
              >
                Lọc
              </Button>
              <Button
                icon={<ClearOutlined />}
                size="small"
                onClick={clearFilters}
              >
                Xóa bộ lọc
              </Button>
            </Space>
          </Col>

          <Col span={4}>
            <div style={{ textAlign: "right", marginTop: 18 }}>
              <span style={{ fontSize: "12px", color: "#666" }}>
                Hiển thị: {filteredTransactions.length}/{transactions.length}
              </span>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Table
        dataSource={filteredTransactions}
        columns={columns}
        loading={loading}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} của ${total} giao dịch`,
          pageSizeOptions: ["10", "20", "50", "100"],
        }}
        scroll={{ x: 1200 }}
        size="small"
        className="wallet-transactions-table"
      />
    </div>
  );
};

export default WalletTransactions;
