import React, { useState } from 'react';
import { Table, Tag, Button, Card, Row, Col, DatePicker, Select, Space, Tooltip } from 'antd';
import { EyeOutlined, CheckOutlined, CloseOutlined, FilterOutlined, ClearOutlined, ExportOutlined } from '@ant-design/icons';
import { formatCurrency, formatDate } from '../utils/formatters';
import { getStatusColor } from '../utils/helpers';
import { WithdrawTransaction, WithdrawStatus, WithdrawType } from '../types/customer.types';
import moment, { Moment } from 'moment';

const { RangePicker } = DatePicker;
const { Option } = Select;

type RangeValue = [Moment, Moment] | null;

interface WithdrawalsTableProps {
  withdrawals: WithdrawTransaction[];
  loading?: boolean;
  onApprove?: (record: WithdrawTransaction) => void;
  onReject?: (record: WithdrawTransaction) => void;
  onViewDetails?: (record: WithdrawTransaction) => void;
}

const WithdrawalsTable: React.FC<WithdrawalsTableProps> = ({
  withdrawals,
  loading = false,
  onApprove,
  onReject,
  onViewDetails
}) => {
  const [filteredWithdrawals, setFilteredWithdrawals] = useState<WithdrawTransaction[]>(withdrawals);
  const [dateRange, setDateRange] = useState<RangeValue>(null);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined);

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
    let filtered = [...withdrawals];

    // Date range filter
    if (dateRange) {
      const [startDate, endDate] = dateRange;
      filtered = filtered.filter(withdrawal => {
        const withdrawalDate = moment.unix(withdrawal.createdAt || 0);
        return withdrawalDate.isAfter(startDate.startOf('day')) && withdrawalDate.isBefore(endDate.endOf('day'));
      });
    }

    // Status filter
    if (statusFilter && statusFilter !== 'ALL') {
      filtered = filtered.filter(withdrawal => withdrawal.status === statusFilter);
    }

    // Type filter
    if (typeFilter && typeFilter !== 'ALL') {
      filtered = filtered.filter(withdrawal => withdrawal.type === typeFilter);
    }

    setFilteredWithdrawals(filtered);
  };

  // Clear filters
  const clearFilters = () => {
    setDateRange(null);
    setStatusFilter(undefined);
    setTypeFilter(undefined);
    setFilteredWithdrawals(withdrawals);
  };

  // Apply filters whenever filters change
  React.useEffect(() => {
    applyFilters();
  }, [dateRange, statusFilter, typeFilter, withdrawals]);

  const getStatusText = (status: WithdrawStatus) => {
    switch (status) {
      case WithdrawStatus.SUCCESS:
        return 'Thành công';
      case WithdrawStatus.PENDING:
        return 'Chờ xử lý';
      case WithdrawStatus.REJECTED:
        return 'Từ chối';
      default:
        return status;
    }
  };

  const getTypeText = (type: WithdrawType) => {
    switch (type) {
      case WithdrawType.INTERNAL:
        return 'Nội bộ';
      case WithdrawType.EXTERNAL:
        return 'Bên ngoài';
      default:
        return type;
    }
  };
  const columns = [
    {
      title: 'Ngày',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (createdAt: number) => formatDate(createdAt, 'DISPLAY'),
      sorter: (a: WithdrawTransaction, b: WithdrawTransaction) => (a.createdAt || 0) - (b.createdAt || 0),
    },
    {
      title: 'Mã rút tiền',
      dataIndex: 'withdrawCode',
      key: 'withdrawCode',
      render: (withdrawCode: string) => (
        <span className="withdrawal-code" title={withdrawCode}>
          {withdrawCode}
        </span>
      )
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => (
        <span style={{ fontWeight: 'bold', color: '#cf1322' }}>
          -{formatCurrency(amount, 'USDT')}
        </span>
      ),
      sorter: (a: WithdrawTransaction, b: WithdrawTransaction) => a.amount - b.amount,
    },
    {
      title: 'Phí',
      dataIndex: 'feeWithdraw',
      key: 'feeWithdraw',
      render: (feeWithdraw: number) => (
        <span style={{ color: '#fa8c16' }}>
          {feeWithdraw > 0 ? formatCurrency(feeWithdraw, 'USDT') : '-'}
        </span>
      ),
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      render: (type: WithdrawType) => (
        <Tag color={type === WithdrawType.INTERNAL ? 'blue' : 'green'}>
          {getTypeText(type)}
        </Tag>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: WithdrawStatus) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'TxHash',
      dataIndex: 'txHash',
      key: 'txHash',
      render: (txHash?: string) => {
        if (!txHash) return <span style={{ color: '#999' }}>-</span>;
        return (
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
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: WithdrawTransaction) => (
        <div className="withdrawal-actions">
          {record.status === WithdrawStatus.PENDING && (
            <>
              <Button
                type="link"
                size="small"
                icon={<CheckOutlined />}
                onClick={() => onApprove?.(record)}
                style={{ color: '#52c41a' }}
              >
                Duyệt
              </Button>
              <Button
                type="link"
                size="small"
                icon={<CloseOutlined />}
                danger
                onClick={() => onReject?.(record)}
              >
                Từ chối
              </Button>
            </>
          )}
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => onViewDetails?.(record)}
          >
            Chi tiết
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="withdrawals-table">
      {/* Filter Section */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col span={6}>
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
          
          <Col span={4}>
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
                <Option value={WithdrawStatus.SUCCESS}>Thành công</Option>
                <Option value={WithdrawStatus.PENDING}>Chờ xử lý</Option>
                <Option value={WithdrawStatus.REJECTED}>Từ chối</Option>
              </Select>
            </Space>
          </Col>
          
          <Col span={4}>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <span style={{ fontSize: '12px', fontWeight: 500 }}>Loại:</span>
              <Select
                size="small"
                value={typeFilter}
                onChange={setTypeFilter}
                placeholder="Chọn loại"
                style={{ width: '100%' }}
                allowClear
              >
                <Option value="ALL">Tất cả</Option>
                <Option value={WithdrawType.INTERNAL}>Nội bộ</Option>
                <Option value={WithdrawType.EXTERNAL}>Bên ngoài</Option>
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
                Hiển thị: {filteredWithdrawals.length}/{withdrawals.length}
              </span>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Table
        dataSource={filteredWithdrawals}
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
        className="withdrawal-transactions-table"
      />
    </div>
  );
};

export default WithdrawalsTable;