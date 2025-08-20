import React, { useState, useEffect } from "react";
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
  message,
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
import { getCustomerVipCommissions } from "../../../services/customer";
import moment, { Moment } from "moment";

const { RangePicker } = DatePicker;
const { Option } = Select;

type RangeValue = [Moment, Moment] | null;

interface VipCommissionTableProps {
  customerId: number;
}

const VipCommissionTable: React.FC<VipCommissionTableProps> = ({
  customerId,
}) => {
  const [filters, setFilters] = useState<VipCommissionFilter>({});
  const [loading, setLoading] = useState(false);
  const [commissions, setCommissions] = useState<VipCommission[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const columns: ColumnsType<VipCommission> = [
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (timestamp: number) => formatDate(timestamp, "TIMESTAMP"),
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

  // Load data on component mount
  useEffect(() => {
    loadCommissions();
  }, [customerId, pagination.current, pagination.pageSize]);

  const loadCommissions = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        commissionType: filters.commissionType,
        status: filters.status,
        fromNickname: filters.fromNickname,
        levelReferral: filters.levelReferral,
        fromDate: filters.dateRange?.[0]
          ? moment(filters.dateRange[0]).valueOf()
          : undefined,
        toDate: filters.dateRange?.[1]
          ? moment(filters.dateRange[1]).valueOf()
          : undefined,
      };

      const response = await getCustomerVipCommissions(customerId, params);

      if (response.errorCode) {
        message.error(response.message || "Có lỗi xảy ra khi tải dữ liệu");
        return;
      }

      setCommissions(response.data || []);
      setPagination((prev) => ({
        ...prev,
        total: response.total || 0,
      }));
    } catch (error) {
      message.error("Có lỗi xảy ra khi tải dữ liệu");
      console.error("Error loading VIP commissions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof VipCommissionFilter, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, current: 1 }));
    loadCommissions();
  };

  const handleReset = () => {
    setFilters({});
    setPagination((prev) => ({ ...prev, current: 1 }));
    loadCommissions();
  };

  const handleTableChange = (pag: any) => {
    setPagination((prev) => ({
      ...prev,
      current: pag.current,
      pageSize: pag.pageSize,
    }));
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
              format="DD/MM/YYYY HH:mm"
              showTime={{
                format: "HH:mm",
                defaultValue: [
                  moment().startOf("day"),
                  moment().endOf("day"),
                ] as [Moment, Moment],
              }}
              onChange={(dates) =>
                handleFilterChange(
                  "dateRange",
                  dates && dates[0] && dates[1]
                    ? [dates[0].toISOString(), dates[1].toISOString()]
                    : undefined
                )
              }
              value={
                filters.dateRange &&
                filters.dateRange[0] &&
                filters.dateRange[1]
                  ? ([
                      moment(filters.dateRange[0]),
                      moment(filters.dateRange[1]),
                    ] as RangeValue)
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
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} của ${total} bản ghi`,
          pageSizeOptions: ["10", "20", "50", "100"],
        }}
        onChange={handleTableChange}
        scroll={{ x: "max-content" }}
        size="small"
      />
    </Card>
  );
};

export default VipCommissionTable;
