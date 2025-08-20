import React, { useState } from "react";
import {
  Table,
  Tag,
  Card,
  Row,
  Col,
  DatePicker,
  Input,
  Select,
  Button,
  Space,
} from "antd";
import { SearchOutlined, ReloadOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import {
  VipCommission,
  VipCommissionType,
  VipCommissionStatus,
  VipCommissionFilter,
} from "../types/vipCommission.types";
import { formatCurrency, formatDate } from "../utils/formatters";
import { getStatusColor } from "../utils/helpers";

const { RangePicker } = DatePicker;
const { Option } = Select;

interface VipCommissionTableProps {
  customerId: number;
}

const VipCommissionTable: React.FC<VipCommissionTableProps> = ({
  customerId,
}) => {
  const [filters, setFilters] = useState<VipCommissionFilter>({});
  const [loading, setLoading] = useState(false);

  // Mock data with updated structure
  const mockCommissions: VipCommission[] = [
    {
      id: 1,
      customerId,
      fromCustomerId: 12345,
      fromNickname: "trader_001",
      levelReferral: 1,
      commissionType: VipCommissionType.TRADING,
      amount: 25.5,
      type: "percentage",
      value: 2.5,
      vipLevel: 3,
      sourceAmount: 1020.0,
      sourceOrderId: 789123,
      status: VipCommissionStatus.PAID,
      paidAt: "2024-01-15T10:30:00Z",
      description: "Trading commission from F1 referral",
      createdAt: Date.now() / 1000,
      updatedAt: Date.now() / 1000,
    },
    {
      id: 2,
      customerId,
      fromCustomerId: 12346,
      fromNickname: "vip_user_002",
      levelReferral: 2,
      commissionType: VipCommissionType.UPGRADE,
      amount: 50.0,
      type: "fixed",
      value: 50,
      vipLevel: 4,
      sourceAmount: 500.0,
      sourceTransactionId: 456789,
      status: VipCommissionStatus.PENDING,
      description: "VIP upgrade commission from F2 referral",
      createdAt: (Date.now() - 86400000) / 1000,
      updatedAt: (Date.now() - 86400000) / 1000,
    },
    {
      id: 3,
      customerId,
      fromCustomerId: 12347,
      fromNickname: "active_trader_003",
      levelReferral: 1,
      commissionType: VipCommissionType.TRADING,
      amount: 15.75,
      type: "percentage",
      value: 1.5,
      vipLevel: 2,
      sourceAmount: 1050.0,
      sourceOrderId: 789124,
      status: VipCommissionStatus.PAID,
      paidAt: "2024-01-14T16:45:00Z",
      description: "Trading commission from F1 referral",
      createdAt: (Date.now() - 172800000) / 1000,
      updatedAt: (Date.now() - 172800000) / 1000,
    },
  ];

  const [commissions, setCommissions] =
    useState<VipCommission[]>(mockCommissions);

  const columns: ColumnsType<VipCommission> = [
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (timestamp: number) => formatDate(timestamp, "DISPLAY"),
      sorter: (a, b) => (a.createdAt || 0) - (b.createdAt || 0),
    },
    {
      title: "Loại hoa hồng",
      dataIndex: "commissionType",
      key: "commissionType",
      render: (type: VipCommissionType) => {
        const colorMap: Record<VipCommissionType, string> = {
          [VipCommissionType.TRADING]: "blue",
          [VipCommissionType.UPGRADE]: "purple",
          [VipCommissionType.REFERRAL]: "green",
          [VipCommissionType.F1_TRADING]: "cyan",
          [VipCommissionType.DEPOSIT]: "gold",
        };
        const nameMap: Record<VipCommissionType, string> = {
          [VipCommissionType.TRADING]: "Trading",
          [VipCommissionType.UPGRADE]: "Nâng cấp VIP",
          [VipCommissionType.REFERRAL]: "Giới thiệu",
          [VipCommissionType.F1_TRADING]: "F1 Trading",
          [VipCommissionType.DEPOSIT]: "Nạp tiền",
        };
        return <Tag color={colorMap[type]}>{nameMap[type]}</Tag>;
      },
      filters: [
        { text: "Trading", value: VipCommissionType.TRADING },
        { text: "Nâng cấp VIP", value: VipCommissionType.UPGRADE },
      ],
      onFilter: (value, record) => record.commissionType === value,
    },
    {
      title: "Từ Nickname",
      dataIndex: "fromNickname",
      key: "fromNickname",
      render: (nickname: string) => (
        <span style={{ fontWeight: 500, color: "#1890ff" }}>{nickname}</span>
      ),
    },
    {
      title: "Cấp giới thiệu",
      dataIndex: "levelReferral",
      key: "levelReferral",
      render: (level: number) => <Tag color="orange">F{level}</Tag>,
      sorter: (a, b) => a.levelReferral - b.levelReferral,
    },
    {
      title: "Giao dịch",
      dataIndex: "sourceAmount",
      key: "sourceAmount",
      render: (amount: number) => (
        <span style={{ color: "#666" }}>{formatCurrency(amount)}</span>
      ),
      sorter: (a, b) => a.sourceAmount - b.sourceAmount,
    },
    {
      title: "Hoa hồng",
      dataIndex: "amount",
      key: "amount",
      render: (amount: number, record: VipCommission) => (
        <div>
          <div style={{ color: "#3f8600", fontWeight: "bold" }}>
            {formatCurrency(amount)}
          </div>
          <div style={{ fontSize: 12, color: "#666" }}>
            {record.type === "percentage" ? `${record.value}%` : "Cố định"}
          </div>
        </div>
      ),
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: VipCommissionStatus, record: VipCommission) => {
        const statusMap = {
          [VipCommissionStatus.PAID]: "✅ Đã trả",
          [VipCommissionStatus.PENDING]: "⏳ Chờ xử lý",
          [VipCommissionStatus.CANCELLED]: "❌ Đã hủy",
        };

        return (
          <div>
            <Tag color={getStatusColor(status)}>{statusMap[status]}</Tag>
            {status === VipCommissionStatus.PAID && record.paidAt && (
              <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>
                {formatDate(
                  new Date(record.paidAt).getTime() / 1000,
                  "DISPLAY"
                )}
              </div>
            )}
          </div>
        );
      },
      filters: [
        { text: "Đã trả", value: VipCommissionStatus.PAID },
        { text: "Chờ xử lý", value: VipCommissionStatus.PENDING },
        { text: "Đã hủy", value: VipCommissionStatus.CANCELLED },
      ],
      onFilter: (value, record) => record.status === value,
    },
  ];

  const handleFilterChange = (key: keyof VipCommissionFilter, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSearch = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      let filteredData = [...mockCommissions];

      // Apply filters
      if (filters.fromNickname) {
        filteredData = filteredData.filter((item) =>
          item.fromNickname
            ?.toLowerCase()
            .includes(filters.fromNickname!.toLowerCase())
        );
      }

      if (filters.levelReferral) {
        filteredData = filteredData.filter(
          (item) => item.levelReferral === filters.levelReferral
        );
      }

      if (filters.commissionType) {
        filteredData = filteredData.filter(
          (item) => item.commissionType === filters.commissionType
        );
      }

      if (filters.dateRange && filters.dateRange[0] && filters.dateRange[1]) {
        const [startDate, endDate] = filters.dateRange;
        const start = new Date(startDate).getTime() / 1000;
        const end = new Date(endDate).getTime() / 1000;
        filteredData = filteredData.filter(
          (item) =>
            (item.createdAt || 0) >= start && (item.createdAt || 0) <= end
        );
      }

      setCommissions(filteredData);
      setLoading(false);
    }, 500);
  };

  const handleReset = () => {
    setFilters({});
    setCommissions(mockCommissions);
  };

  return (
    <Card title="📋 Lịch sử Hoa hồng VIP">
      {/* Filters */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col xs={24} sm={8} md={6}>
            <div style={{ marginBottom: 8 }}>
              <label style={{ fontSize: 12, color: "#666" }}>
                Khoảng thời gian:
              </label>
            </div>
            <RangePicker
              style={{ width: "100%" }}
              placeholder={["Từ ngày", "Đến ngày"]}
              format="DD/MM/YYYY"
              onChange={(_dates, dateStrings) =>
                handleFilterChange(
                  "dateRange",
                  dateStrings[0] && dateStrings[1] ? dateStrings : undefined
                )
              }
              value={
                filters.dateRange
                  ? [
                      filters.dateRange[0]
                        ? (new Date(filters.dateRange[0]) as any)
                        : null,
                      filters.dateRange[1]
                        ? (new Date(filters.dateRange[1]) as any)
                        : null,
                    ]
                  : null
              }
            />
          </Col>

          <Col xs={24} sm={8} md={6}>
            <div style={{ marginBottom: 8 }}>
              <label style={{ fontSize: 12, color: "#666" }}>
                Từ Nickname:
              </label>
            </div>
            <Input
              placeholder="Tìm theo nickname"
              value={filters.fromNickname}
              onChange={(e) =>
                handleFilterChange("fromNickname", e.target.value)
              }
              allowClear
            />
          </Col>

          <Col xs={24} sm={8} md={4}>
            <div style={{ marginBottom: 8 }}>
              <label style={{ fontSize: 12, color: "#666" }}>
                Cấp giới thiệu:
              </label>
            </div>
            <Select
              style={{ width: "100%" }}
              placeholder="Chọn cấp"
              value={filters.levelReferral}
              onChange={(value) => handleFilterChange("levelReferral", value)}
              allowClear
            >
              {[1, 2, 3, 4, 5, 6, 7].map((level) => (
                <Option key={level} value={level}>
                  F{level}
                </Option>
              ))}
            </Select>
          </Col>

          <Col xs={24} sm={8} md={4}>
            <div style={{ marginBottom: 8 }}>
              <label style={{ fontSize: 12, color: "#666" }}>
                Loại hoa hồng:
              </label>
            </div>
            <Select
              style={{ width: "100%" }}
              placeholder="Chọn loại"
              value={filters.commissionType}
              onChange={(value) => handleFilterChange("commissionType", value)}
              allowClear
            >
              <Option value={VipCommissionType.TRADING}>Trading</Option>
              <Option value={VipCommissionType.UPGRADE}>Nâng cấp VIP</Option>
            </Select>
          </Col>

          <Col xs={24} sm={24} md={6}>
            <div style={{ marginBottom: 8 }}>
              <label style={{ fontSize: 12, color: "transparent" }}>
                Actions:
              </label>
            </div>
            <Space>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={handleSearch}
                loading={loading}
              >
                Tìm kiếm
              </Button>
              <Button icon={<ReloadOutlined />} onClick={handleReset}>
                Làm mới
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Table
        dataSource={commissions}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 20,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} của ${total} bản ghi`,
        }}
        scroll={{ x: "max-content" }}
        size="small"
      />
    </Card>
  );
};

export default VipCommissionTable;
