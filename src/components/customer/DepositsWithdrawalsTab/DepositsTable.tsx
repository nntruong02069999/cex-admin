import React, { useState } from "react";
import { Table, Tag, Button, Tooltip, Card, Row, Col, DatePicker, Select, Space } from "antd";
import { EyeOutlined, ExportOutlined, ClearOutlined } from "@ant-design/icons";
import { formatCurrency, formatDate } from "../utils/formatters";
import { getStatusColor } from "../utils/helpers";
import { DepositTransaction } from "../types/customer.types";
import moment, { Moment } from "moment";

const { RangePicker } = DatePicker;
const { Option } = Select;

type RangeValue = [Moment, Moment] | null;
type DatePickerRangeValue = [Moment | null, Moment | null] | null;

export interface DepositsFilterState {
  dateRange?: [number, number] | null; // timestamps in milliseconds
  status?: string;
}

interface DepositsTableProps {
  deposits: DepositTransaction[];
  loading?: boolean;
  filterLoading?: boolean;
  filters?: DepositsFilterState;
  onViewDetails?: (record: DepositTransaction) => void;
  onFiltersChange?: (filters: DepositsFilterState) => void;
}

const DepositsTable: React.FC<DepositsTableProps> = ({
  deposits,
  loading = false,
  filterLoading = false,
  filters,
  onViewDetails,
  onFiltersChange,
}) => {
  const [dateRange, setDateRange] = useState<RangeValue>(null);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  // Initialize local filter state from props
  React.useEffect(() => {
    if (filters?.dateRange) {
      const [start, end] = filters.dateRange;
      setDateRange([moment(start), moment(end)]);
    } else {
      setDateRange(null);
    }
    setStatusFilter(filters?.status);
  }, [filters]);

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

  // Handle filter changes and notify parent
  const handleDateRangeChange = (dates: DatePickerRangeValue) => {
    const dateRange: RangeValue = dates && dates[0] && dates[1] ? [dates[0], dates[1]] : null;
    setDateRange(dateRange);
    const newFilters: DepositsFilterState = {
      dateRange: dateRange ? [dateRange[0].valueOf(), dateRange[1].valueOf()] : null,
      status: statusFilter,
    };
    onFiltersChange?.(newFilters);
  };

  const handleStatusChange = (value: string | undefined) => {
    setStatusFilter(value);
    const newFilters: DepositsFilterState = {
      dateRange: dateRange ? [dateRange[0]!.valueOf(), dateRange[1]!.valueOf()] : null,
      status: value,
    };
    onFiltersChange?.(newFilters);
  };

  // Clear filters
  const clearFilters = () => {
    setDateRange(null);
    setStatusFilter(undefined);
    onFiltersChange?.({ dateRange: null, status: undefined });
  };

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
                onChange={handleDateRangeChange}
                format="DD/MM/YYYY"
                placeholder={['Từ ngày', 'Đến ngày']}
                style={{ width: '100%' }}
                disabled={filterLoading}
              />
            </Space>
          </Col>
          
          <Col span={6}>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <span style={{ fontSize: '12px', fontWeight: 500 }}>Trạng thái:</span>
              <Select
                size="small"
                value={statusFilter}
                onChange={handleStatusChange}
                placeholder="Chọn trạng thái"
                style={{ width: '100%' }}
                allowClear
                disabled={filterLoading}
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
                icon={<ClearOutlined />}
                size="small"
                onClick={clearFilters}
                disabled={filterLoading}
              >
                Xóa bộ lọc
              </Button>
              {filterLoading && (
                <span style={{ color: '#666', fontSize: '12px' }}>
                  Đang lọc...
                </span>
              )}
            </Space>
          </Col>
          
          <Col span={4}>
            <div style={{ textAlign: 'right', marginTop: 18 }}>
              <span style={{ fontSize: '12px', color: '#666' }}>
                {filterLoading ? 'Đang tải...' : `Hiển thị: ${deposits.length} giao dịch`}
              </span>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Table
        dataSource={deposits}
        columns={columns}
        loading={loading || filterLoading}
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
