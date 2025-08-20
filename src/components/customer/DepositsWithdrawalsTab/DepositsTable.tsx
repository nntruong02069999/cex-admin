import React, { useState } from "react";
import { Table, Tag, Button, Tooltip, Card, Row, Col, DatePicker, Select, Space } from "antd";
import { EyeOutlined, ExportOutlined, FilterOutlined, ClearOutlined } from "@ant-design/icons";
import { formatCurrency, formatDate } from "../utils/formatters";
import { getStatusColor } from "../utils/helpers";
import { DepositTransaction } from "../types/customer.types";
import moment, { Moment } from "moment";

const { RangePicker } = DatePicker;
const { Option } = Select;

type RangeValue = [Moment, Moment] | null;

interface DepositsTableProps {
  deposits: DepositTransaction[];
  loading?: boolean;
  onViewDetails?: (record: DepositTransaction) => void;
}

const DepositsTable: React.FC<DepositsTableProps> = ({
  deposits,
  loading = false,
  onViewDetails,
}) => {
  const [filteredDeposits, setFilteredDeposits] = useState<DepositTransaction[]>(deposits);
  const [dateRange, setDateRange] = useState<RangeValue>(null);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  const getBSCScanUrl = (txHash: string): string => {
    return `https://bscscan.com/tx/${txHash}`;
  };

  const openBSCScan = (txHash: string) => {
    window.open(getBSCScanUrl(txHash), '_blank');
  };

  const formatTxHash = (txHash: string): string => {
    if (txHash.length <= 12) return txHash;
    return `${txHash.slice(0, 6)}...${txHash.slice(-6)}`;
  };

  // Filter function
  const applyFilters = () => {
    let filtered = [...deposits];

    // Date range filter
    if (dateRange) {
      const [startDate, endDate] = dateRange;
      filtered = filtered.filter(deposit => {
        const depositDate = moment.unix(deposit.createdAt || 0);
        return depositDate.isAfter(startDate.startOf('day')) && depositDate.isBefore(endDate.endOf('day'));
      });
    }

    // Status filter
    if (statusFilter && statusFilter !== 'ALL') {
      filtered = filtered.filter(deposit => deposit.status === statusFilter);
    }

    setFilteredDeposits(filtered);
  };

  // Clear filters
  const clearFilters = () => {
    setDateRange(null);
    setStatusFilter(undefined);
    setFilteredDeposits(deposits);
  };

  // Apply filters whenever filters change
  React.useEffect(() => {
    applyFilters();
  }, [dateRange, statusFilter, deposits]);

  const columns = [
    {
      title: "Ngày",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (createdAt: number) => formatDate(createdAt, "DISPLAY"),
      sorter: (a: DepositTransaction, b: DepositTransaction) => (a.createdAt || 0) - (b.createdAt || 0),
    },
    {
      title: "Mã đơn",
      dataIndex: "orderId",
      key: "orderId",
      render: (orderId: string) => (
        <span className="order-id" title={orderId}>
          {orderId}
        </span>
      ),
    },
    {
      title: "USDT",
      dataIndex: "usdtAmount",
      key: "usdtAmount",
      render: (amount: number) => (
        <span style={{ fontWeight: 'bold', color: '#3f8600' }}>
          {formatCurrency(amount, 'USDT')}
        </span>
      ),
      sorter: (a: DepositTransaction, b: DepositTransaction) => a.usdtAmount - b.usdtAmount,
    },
    {
      title: "Bonus",
      dataIndex: "bonusAmount",
      key: "bonusAmount",
      render: (bonusAmount?: number) => (
        <span style={{ color: '#fa8c16' }}>
          {bonusAmount ? `+${formatCurrency(bonusAmount, 'USDT')}` : '-'}
        </span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status === "SUCCESS"
            ? "Thành công"
            : status === "PENDING"
            ? "Chờ xử lý"
            : status === "FAILED"
            ? "Thất bại"
            : status === "CANCELLED"
            ? "Đã hủy"
            : status}
        </Tag>
      ),
    },
    {
      title: "TxHash",
      dataIndex: "txHash",
      key: "txHash",
      render: (txHash: string) => (
        <div className="tx-hash-container">
          <Tooltip title={`Nhấn để xem trên BSCScan: ${txHash}`}>
            <Button
              type="link"
              size="small"
              icon={<ExportOutlined />}
              onClick={() => openBSCScan(txHash)}
              style={{ padding: 0, height: 'auto', color: '#1890ff' }}
            >
              {formatTxHash(txHash)}
            </Button>
          </Tooltip>
        </div>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_: any, record: DepositTransaction) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => onViewDetails?.(record)}
          size="small"
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div className="deposits-table">
      {/* Filter Section */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col span={8}>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <span style={{ fontSize: '12px', fontWeight: 500 }}>Khoảng thời gian:</span>
              <RangePicker
                size="small"
                value={dateRange}
                onChange={(dates) => setDateRange(dates as RangeValue)}
                format="DD/MM/YYYY"
                placeholder={['Từ ngày', 'Đến ngày']}
                style={{ width: '100%' }}
              />
            </Space>
          </Col>
          
          <Col span={6}>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <span style={{ fontSize: '12px', fontWeight: 500 }}>Trạng thái:</span>
              <Select
                size="small"
                value={statusFilter}
                onChange={setStatusFilter}
                placeholder="Chọn trạng thái"
                style={{ width: '100%' }}
                allowClear
              >
                <Option value="ALL">Tất cả</Option>
                <Option value="SUCCESS">Thành công</Option>
                <Option value="PENDING">Chờ xử lý</Option>
                <Option value="FAILED">Thất bại</Option>
                <Option value="CANCELLED">Đã hủy</Option>
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
            <div style={{ textAlign: 'right', marginTop: 18 }}>
              <span style={{ fontSize: '12px', color: '#666' }}>
                Hiển thị: {filteredDeposits.length}/{deposits.length}
              </span>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Table
        dataSource={filteredDeposits}
        columns={columns}
        loading={loading}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} của ${total} giao dịch`,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
        scroll={{ x: 1200 }}
        size="small"
        className="deposit-transactions-table"
      />
    </div>
  );
};

export default DepositsTable;
