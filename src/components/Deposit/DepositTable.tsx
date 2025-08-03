import React from "react";
import {
  Table,
  Tag,
  Button,
  Space,
  Typography,
  Avatar,
  Card,
  Row,
  Col,
} from "antd";
import {
  EyeOutlined,
  UserOutlined,
  DollarOutlined,
  CreditCardOutlined,
  BankOutlined,
  CheckOutlined,
  CloseOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { DepositRecord, PaymentStatus, DepositTransactionStatus } from "./types";
import { ColumnsType } from "antd/es/table";

interface DepositTableProps {
  data: DepositRecord[];
  total: number;
  loading?: boolean;
  pagination: {
    current: number;
    pageSize: number;
  };
  onPaginationChange: (page: number, pageSize?: number) => void;
  onAction: (
    record: DepositRecord,
    action: "view" | "confirm" | "cancel"
  ) => void;
}

const { Text } = Typography;

const DepositTable: React.FC<DepositTableProps> = ({
  data,
  total,
  loading = false,
  pagination,
  onPaginationChange,
  onAction,
}) => {
  const getStatusConfig = (status: DepositTransactionStatus | PaymentStatus) => {
    switch (status) {
      case DepositTransactionStatus.PENDING:
      case PaymentStatus.PENDING:
        return { color: "orange", text: "Chờ xử lý" };
      case DepositTransactionStatus.SUCCESS:
      case PaymentStatus.SUCCESS:
        return { color: "green", text: "Thành công" };
      case DepositTransactionStatus.FAILED:
      case PaymentStatus.FAILED:
        return { color: "red", text: "Thất bại" };
      default:
        return { color: "default", text: "Không xác định" };
    }
  };

  // Remove unused function - formatting is handled directly in components

  const formatDateTime = (timestamp: number) => {
    return moment(timestamp).format("DD/MM/YYYY HH:mm");
  };

  // Handle customer click to open customer detail in new tab
  const handleCustomerClick = (customerId: number) => {
    window.open(`/#/customer/${customerId}`, "_blank");
  };

  const renderCustomerInfo = (customerInfo: any, type: "main" | "invite") => (
    <div
      className={`customer-card-compact ${type}`}
      onClick={() => handleCustomerClick(customerInfo.id)}
    >
      <div className="customer-header">
        <Avatar
          size={28}
          icon={<UserOutlined />}
          className={`customer-avatar-${type}`}
        />
        <div className="customer-main-info">
          <div className="customer-id-primary">
            <Text strong style={{ fontSize: "13px", color: "#1890ff" }}>
              #{customerInfo.id}
            </Text>
          </div>
          <div className="customer-nickname-primary">
            <UserOutlined
              style={{ fontSize: "11px", marginRight: "4px", color: "#52c41a" }}
            />
            <Text strong style={{ fontSize: "12px", color: "#262626" }}>
              {customerInfo.nickname}
            </Text>
          </div>
        </div>
      </div>
      <div className="customer-meta">
        <Text className="customer-name-secondary">{customerInfo.name}</Text>
        <Text className="invite-code-compact">{customerInfo.inviteCode}</Text>
      </div>
    </div>
  );

  const renderFinancialInfo = (record: DepositRecord) => {
    const totalAmount = record.usdtAmount + (record.bonusAmount || 0);
    const hasBonus = record.bonusAmount && record.bonusAmount > 0;
    const asset = record.asset || 'USDT';

    return (
      <div className="financial-info">
        <Card size="small" className="financial-card">
          <Row gutter={8}>
            {/* Primary Amount Display */}
            <Col span={24}>
              <div className="amount-primary">
                <DollarOutlined style={{ color: "#722ed1", marginRight: 4 }} />
                <Text strong style={{ fontSize: "15px", color: "#722ed1" }}>
                  {record.usdtAmount} {asset}
                </Text>
              </div>
            </Col>
            
            {hasBonus && (
              <Col span={24}>
                <div className="amount-bonus">
                  <Text style={{ fontSize: "12px", color: "#52c41a" }}>
                    + {record.bonusAmount} {asset} bonus
                  </Text>
                </div>
              </Col>
            )}
            
            <Col span={24}>
              <div className="amount-total">
                <Text style={{ fontSize: "12px" }} type="secondary">
                  Tổng: {totalAmount} {asset}
                </Text>
              </div>
            </Col>
          </Row>
        </Card>
      </div>
    );
  };

  const renderPaymentInfo = (record: DepositRecord) => (
    <div className="payment-info">
      <div className="order-id-primary">
        <FileTextOutlined
          style={{ fontSize: "12px", marginRight: 4, color: "#722ed1" }}
        />
        <Text strong style={{ fontSize: "13px", color: "#722ed1" }}>
          {record.orderId}
        </Text>
      </div>
      <div className="payment-row">
        <CreditCardOutlined style={{ marginRight: 4 }} />
        <Text style={{ fontSize: "11px", color: "#666" }}>
          {record.chain}
        </Text>
      </div>
      <div className="payment-row">
        <BankOutlined style={{ marginRight: 4 }} />
        <Text style={{ fontSize: "11px", color: "#666" }}>
          {record.asset}
        </Text>
      </div>
    </div>
  );

  const renderActions = (record: DepositRecord) => {
    const actions = [];

    // View action - always available
    actions.push(
      <Button
        key="view"
        type="link"
        icon={<EyeOutlined />}
        onClick={() => onAction(record, "view")}
        size="small"
      >
        Chi tiết
      </Button>
    );

    // Confirm and Cancel actions - only for PENDING status
    if (record.status === DepositTransactionStatus.PENDING) {
      actions.push(
        <Button
          key="confirm"
          type="primary"
          size="small"
          icon={<CheckOutlined />}
          onClick={() => onAction(record, "confirm")}
        >
          Xác nhận
        </Button>
      );

      actions.push(
        <Button
          key="cancel"
          danger
          size="small"
          icon={<CloseOutlined />}
          onClick={() => onAction(record, "cancel")}
        >
          Hủy
        </Button>
      );
    }

    return <Space size="small">{actions}</Space>;
  };

  const columns: ColumnsType<DepositRecord> = [
    {
      title: "STT",
      key: "index",
      width: 60,
      render: (_, __, index) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      render: (id) => <Text code>{id}</Text>,
    },
    {
      title: "Khách hàng",
      key: "customer",
      width: 180,
      render: (_, record) => renderCustomerInfo(record.customer || record.customerInfo, "main"),
    },
    {
      title: "Người giới thiệu",
      key: "inviteCustomer",
      width: 180,
      render: (_, record) =>
        record.inviteCustomer ? (
          renderCustomerInfo(record.inviteCustomer, "invite")
        ) : (
          <Text type="secondary">Không có</Text>
        ),
    },
    {
      title: "Thông tin tài chính",
      key: "financial",
      width: 150,
      render: (_, record) => renderFinancialInfo(record),
    },
    {
      title: "Blockchain",
      key: "blockchain",
      width: 140,
      render: (_, record) => renderPaymentInfo(record),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => {
        const config = getStatusConfig(status);
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: "Thời gian",
      key: "time",
      width: 160,
      render: (_, record) => (
        <div className="time-info">
          <div>
            <Text style={{ fontSize: "12px" }}>
              Tạo: {record.createdAt ? formatDateTime(record.createdAt) : 'N/A'}
            </Text>
          </div>
          {record.updatedAt && record.updatedAt !== record.createdAt && (
            <div>
              <Text style={{ fontSize: "12px", color: "#52c41a" }}>
                Cập nhật: {formatDateTime(record.updatedAt)}
              </Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 180,
      fixed: "right",
      render: (_, record) => renderActions(record),
    },
  ];

  return (
    <div className="deposit-table">
      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} của ${total} bản ghi`,
          onChange: onPaginationChange,
          onShowSizeChange: onPaginationChange,
          pageSizeOptions: ["10", "20", "50", "100"],
        }}
        rowKey="id"
        scroll={{ x: 1400 }}
        size="middle"
      />
    </div>
  );
};

export default DepositTable;
