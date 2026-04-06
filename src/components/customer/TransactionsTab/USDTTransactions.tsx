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
  Tooltip,
} from "antd";
import {
  FilterOutlined,
  ClearOutlined,
  ExportOutlined,
  CopyOutlined,
} from "@ant-design/icons";
import { formatCurrency, formatDate } from "../utils/formatters";
import { getStatusColor } from "../utils/helpers";
import {
  USDTTransaction,
  USDTTransactionType,
  USDTTransactionStatus,
} from "../types/customer.types";
import moment, { Moment } from "moment";

const { RangePicker } = DatePicker;
const { Option } = Select;

type RangeValue = [Moment, Moment] | null;

interface USDTTransactionsProps {
  transactions: USDTTransaction[];
  loading?: boolean;
  onFilter?: (params: any) => Promise<void>;
}

const USDTTransactions: React.FC<USDTTransactionsProps> = ({
  transactions,
  loading = false,
  onFilter,
}) => {
  const [filteredTransactions, setFilteredTransactions] =
    useState<USDTTransaction[]>(transactions);
  const [dateRange, setDateRange] = useState<RangeValue>(null);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(
    undefined
  );
  const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined);

  const getBSCScanUrl = (txHash: string): string => {
    return `https://bscscan.com/tx/${txHash}`;
  };

  const openBSCScan = (txHash: string) => {
    window.open(getBSCScanUrl(txHash), "_blank");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // Could add a message here if needed
    });
  };

  const formatTxHash = (txHash: string): string => {
    if (txHash.length <= 12) return txHash;
    return `${txHash.slice(0, 6)}...${txHash.slice(-6)}`;
  };

  // Server-side filter function
  const applyFilters = async () => {
    if (!onFilter) {
      // Fallback to client-side filtering if no onFilter provided
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
      return;
    }

    // Server-side filtering
    const params: any = {};

    // Date range filter - convert to milliseconds
    if (dateRange) {
      const [startDate, endDate] = dateRange;
      params.fromDate = startDate.valueOf(); // milliseconds
      params.toDate = endDate.valueOf(); // milliseconds
    }

    // Status filter
    if (statusFilter && statusFilter !== "ALL") {
      params.status = statusFilter;
    }

    // Type filter
    if (typeFilter && typeFilter !== "ALL") {
      params.type = typeFilter;
    }

    // Call parent component's filter function
    await onFilter(params);
  };

  // Clear filters
  const clearFilters = async () => {
    setDateRange(null);
    setStatusFilter(undefined);
    setTypeFilter(undefined);

    if (onFilter) {
      // Clear server-side filters
      await onFilter({});
    } else {
      // Fallback to client-side clear
      setFilteredTransactions(transactions);
    }
  };

  // Update filtered transactions when transactions change (for client-side only)
  React.useEffect(() => {
    if (!onFilter) {
      setFilteredTransactions(transactions);
    } else {
      // For server-side filtering, use the transactions directly
      setFilteredTransactions(transactions);
    }
  }, [transactions, onFilter]);

  const getTypeText = (type: USDTTransactionType) => {
    switch (type) {
      case USDTTransactionType.DEPOSIT:
        return "Nạp USDT";
      case USDTTransactionType.WITHDRAW:
        return "Rút USDT";
      case USDTTransactionType.PAYMENT:
        return "Thanh toán";
      case USDTTransactionType.DEPOSIT_INTERNAL:
        return "Nạp nội bộ";
      case USDTTransactionType.WITHDRAW_INTERNAL:
        return "Rút nội bộ";
      default:
        return type;
    }
  };

  const getStatusText = (status: USDTTransactionStatus) => {
    switch (status) {
      case USDTTransactionStatus.SUCCESS:
        return "Thành công";
      case USDTTransactionStatus.PENDING:
        return "Chờ xử lý";
      case USDTTransactionStatus.FAILED:
        return "Thất bại";
      default:
        return status;
    }
  };

  const getTypeColor = (type: USDTTransactionType) => {
    switch (type) {
      case USDTTransactionType.DEPOSIT:
      case USDTTransactionType.DEPOSIT_INTERNAL:
        return "green";
      case USDTTransactionType.WITHDRAW:
      case USDTTransactionType.WITHDRAW_INTERNAL:
        return "red";
      case USDTTransactionType.PAYMENT:
        return "blue";
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
      sorter: (a: USDTTransaction, b: USDTTransaction) =>
        (a.createdAt || 0) - (b.createdAt || 0),
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      render: (type: USDTTransactionType) => (
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
            {formatCurrency(Math.abs(amount), "USDT")}
          </span>
        );
      },
      sorter: (a: USDTTransaction, b: USDTTransaction) => a.amount - b.amount,
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
      render: (status: USDTTransactionStatus) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      key: "note",
      render: (note?: string) => (
        <span className="transaction-description" title={note}>
          {note || "-"}
        </span>
      ),
    },
    {
      title: "TX Hash",
      dataIndex: "txHash",
      key: "txHash",
      render: (txHash?: string) => {
        if (!txHash) return <span style={{ color: "#999" }}>-</span>;
        return (
          <div className="tx-hash-container">
            <Space size="small">
              <Tooltip title={`TX Hash: ${txHash}`}>
                <Button
                  type="text"
                  size="small"
                  style={{
                    padding: 0,
                    height: "auto",
                    color: "#666",
                    fontSize: "11px",
                  }}
                >
                  {formatTxHash(txHash)}
                </Button>
              </Tooltip>
              <Tooltip title="Sao chép TX Hash">
                <Button
                  type="text"
                  size="small"
                  icon={<CopyOutlined />}
                  onClick={() => copyToClipboard(txHash)}
                  style={{ padding: 0, height: "auto" }}
                />
              </Tooltip>
              <Tooltip title="Xem trên BSCScan">
                <Button
                  type="text"
                  size="small"
                  icon={<ExportOutlined />}
                  onClick={() => openBSCScan(txHash)}
                  style={{ padding: 0, height: "auto", color: "#1890ff" }}
                />
              </Tooltip>
            </Space>
          </div>
        );
      },
    },
  ];

  return (
    <div className="usdt-transactions">
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
                format="DD/MM/YYYY HH:mm"
                showTime={{
                  format: "HH:mm",
                  defaultValue: [
                    moment("00:00", "HH:mm"),
                    moment("23:59", "HH:mm"),
                  ],
                }}
                placeholder={["Từ ngày giờ", "Đến ngày giờ"]}
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
                <Option value={USDTTransactionStatus.SUCCESS}>
                  Thành công
                </Option>
                <Option value={USDTTransactionStatus.PENDING}>Chờ xử lý</Option>
                <Option value={USDTTransactionStatus.FAILED}>Thất bại</Option>
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
                <Option value={USDTTransactionType.DEPOSIT}>Nạp USDT</Option>
                <Option value={USDTTransactionType.WITHDRAW}>Rút USDT</Option>
                <Option value={USDTTransactionType.PAYMENT}>Thanh toán</Option>
                <Option value={USDTTransactionType.DEPOSIT_INTERNAL}>
                  Nạp nội bộ
                </Option>
                <Option value={USDTTransactionType.WITHDRAW_INTERNAL}>
                  Rút nội bộ
                </Option>
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
        className="usdt-transactions-table"
      />
    </div>
  );
};

export default USDTTransactions;
