import React, { useState } from "react";
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
  Modal,
  Descriptions,
  Divider,
} from "antd";
import {
  EyeOutlined,
  UserOutlined,
  DollarOutlined,
  CheckOutlined,
  CloseOutlined,
  FileTextOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { WithdrawRecord, WithdrawStatus } from "./types";
import { ColumnsType } from "antd/es/table";

interface WithdrawTableProps {
  data: WithdrawRecord[];
  total: number;
  loading?: boolean;
  pagination: {
    current: number;
    pageSize: number;
  };
  onPaginationChange: (page: number, pageSize?: number) => void;
  onAction: (
    record: WithdrawRecord,
    action: "view" | "confirm" | "reject"
  ) => void;
}

const { Text } = Typography;

const WithdrawTable: React.FC<WithdrawTableProps> = ({
  data,
  total,
  loading = false,
  pagination,
  onPaginationChange,
  onAction,
}) => {
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<WithdrawRecord | null>(
    null
  );

  const getStatusConfig = (status: string | WithdrawStatus) => {
    switch (status) {
      case WithdrawStatus.PENDING:
      case "PENDING":
        return { color: "orange", text: "Chờ xử lý" };
      case WithdrawStatus.SUCCESS:
      case "SUCCESS":
        return { color: "green", text: "Thành công" };
      case WithdrawStatus.REJECTED:
      case "REJECTED":
        return { color: "red", text: "Bị từ chối" };
      default:
        return { color: "default", text: "Không xác định" };
    }
  };

  const formatCurrency = (amount: number) => {
    return `${amount} USDT`;
  };

  const formatDateTime = (timestamp: number | null) => {
    if (!timestamp) return 'N/A';
    return moment(timestamp).format("DD/MM/YYYY HH:mm");
  };

  const formatFullDateTime = (timestamp: number | null) => {
    if (!timestamp) return 'N/A';
    return moment(timestamp).format("DD/MM/YYYY HH:mm:ss");
  };

  // Handle customer click to open customer detail in new tab
  const handleCustomerClick = (customerId: number) => {
    window.open(`/#/customer/${customerId}`, "_blank");
  };

  // Handle view detail
  const handleViewDetail = (record: WithdrawRecord) => {
    setSelectedRecord(record);
    setDetailVisible(true);
  };

  const renderCustomerInfo = (customerInfo: any) => (
    <div
      className="customer-card-compact main"
      onClick={() => handleCustomerClick(customerInfo.id)}
    >
      <div className="customer-header">
        <Avatar
          size={28}
          icon={<UserOutlined />}
          className="customer-avatar-main"
        />
        <div className="customer-main-info">
          <div className="customer-id-primary">
            <Text strong style={{ fontSize: "13px", color: "#fa8c16" }}>
              #{customerInfo.id}
            </Text>
          </div>
          <div className="customer-nickname-primary">
            <UserOutlined
              style={{ fontSize: "11px", marginRight: "4px", color: "#52c41a" }}
            />
            <Text strong style={{ fontSize: "12px", color: "#262626" }}>
              {customerInfo.nickname || customerInfo.name}
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

  const renderTransferInfo = (record: WithdrawRecord) => (
    <div className="transfer-info">
      <div className="transfer-header">
        <div className="transfer-badge">{record.type}</div>
        <Text strong className="transfer-type">
          {record.type === 'INTERNAL' ? 'Nội bộ' : 'Bên ngoài'}
        </Text>
      </div>
      <div className="transfer-details">
        {record.txHash && (
          <div className="transfer-row">
            <Text className="transfer-label">TX Hash:</Text>
            <Text className="transfer-value" code>
              {record.txHash.substring(0, 10)}...
            </Text>
          </div>
        )}
        {record.fromAddress && (
          <div className="transfer-row">
            <Text className="transfer-label">From:</Text>
            <Text className="transfer-value" code>
              {record.fromAddress.substring(0, 10)}...
            </Text>
          </div>
        )}
        {record.toAddress && (
          <div className="transfer-row">
            <Text className="transfer-label">To:</Text>
            <Text className="transfer-value" code>
              {record.toAddress.substring(0, 10)}...
            </Text>
          </div>
        )}
      </div>
    </div>
  );

  const renderFinancialInfo = (record: WithdrawRecord) => {
    const netAmount = record.amount - record.feeWithdraw;
    const hasFee = record.feeWithdraw > 0;

    return (
      <div className="financial-info">
        <Card size="small" className="financial-card">
          <Row gutter={8}>
            <Col span={24}>
              <div className="amount-main">
                <DollarOutlined style={{ color: "#fa8c16", marginRight: 4 }} />
                <Text strong style={{ fontSize: "14px", color: "#fa8c16" }}>
                  {formatCurrency(record.amount)}
                </Text>
              </div>
            </Col>
            {hasFee && (
              <Col span={24}>
                <div className="amount-fee">
                  <Text style={{ fontSize: "12px", color: "#f5222d" }}>
                    - {formatCurrency(record.feeWithdraw)} phí
                  </Text>
                </div>
              </Col>
            )}
            <Col span={24}>
              <div className="amount-total">
                <Text style={{ fontSize: "12px" }} type="secondary">
                  Thực nhận: {formatCurrency(netAmount)}
                </Text>
              </div>
            </Col>
          </Row>
        </Card>
      </div>
    );
  };

  const renderWithdrawInfo = (record: WithdrawRecord) => (
    <div className="withdraw-info">
      <div className="withdraw-code-primary">
        <FileTextOutlined
          style={{ fontSize: "12px", marginRight: 4, color: "#fa541c" }}
        />
        <Text strong style={{ fontSize: "13px", color: "#fa541c" }}>
          {record.withdrawCode}
        </Text>
      </div>
    </div>
  );

  const renderActions = (record: WithdrawRecord) => {
    const actions = [];

    // View action - always available
    actions.push(
      <Button
        key="view"
        type="link"
        icon={<EyeOutlined />}
        onClick={() => handleViewDetail(record)}
        size="small"
      >
        Chi tiết
      </Button>
    );

    // Confirm and Reject actions - only for PENDING status
    if (record.status === WithdrawStatus.PENDING || record.status === "PENDING") {
      actions.push(
        <Button
          key="confirm"
          type="primary"
          size="small"
          icon={<CheckOutlined />}
          onClick={() => onAction(record, "confirm")}
          style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
        >
          Xác nhận
        </Button>
      );

      actions.push(
        <Button
          key="reject"
          danger
          size="small"
          icon={<CloseOutlined />}
          onClick={() => onAction(record, "reject")}
        >
          Từ chối
        </Button>
      );
    }

    return <Space size="small">{actions}</Space>;
  };

  const renderDetailModal = () => {
    if (!selectedRecord) return null;

    const statusConfig = getStatusConfig(selectedRecord.status);
    const netAmount = selectedRecord.amount - selectedRecord.feeWithdraw;

    return (
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <FileTextOutlined style={{ color: "#fa8c16" }} />
            <span>Chi tiết yêu cầu rút tiền</span>
            <Tag color={statusConfig.color}>{statusConfig.text}</Tag>
          </div>
        }
        visible={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailVisible(false)}>
            Đóng
          </Button>,
          (selectedRecord.status === WithdrawStatus.PENDING || selectedRecord.status === "PENDING") && (
            <Button
              key="confirm"
              type="primary"
              icon={<CheckOutlined />}
              onClick={() => {
                onAction(selectedRecord, "confirm");
                setDetailVisible(false);
              }}
              style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
            >
              Xác nhận
            </Button>
          ),
          (selectedRecord.status === WithdrawStatus.PENDING || selectedRecord.status === "PENDING") && (
            <Button
              key="reject"
              danger
              icon={<CloseOutlined />}
              onClick={() => {
                onAction(selectedRecord, "reject");
                setDetailVisible(false);
              }}
            >
              Từ chối
            </Button>
          ),
        ].filter(Boolean)}
        width={800}
      >
        <Descriptions bordered column={2} size="small">
          <Descriptions.Item label="ID yêu cầu" span={1}>
            <Text code>{selectedRecord.id}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Mã rút tiền" span={1}>
            <Text strong style={{ color: "#fa541c" }}>
              {selectedRecord.withdrawCode}
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái" span={1}>
            <Tag color={statusConfig.color}>{statusConfig.text}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Loại giao dịch" span={1}>
            <Tag color="blue">
              {selectedRecord.type === 'INTERNAL' ? 'Nội bộ' : 'Bên ngoài'}
            </Tag>
          </Descriptions.Item>
        </Descriptions>

        <Divider orientation="left">Thông tin khách hàng</Divider>
        <Descriptions bordered column={2} size="small">
          <Descriptions.Item label="ID khách hàng" span={1}>
            <Button
              type="link"
              onClick={() => handleCustomerClick(selectedRecord.Customer.id)}
              style={{ padding: 0 }}
            >
              #{selectedRecord.Customer.id}
            </Button>
          </Descriptions.Item>
          <Descriptions.Item label="Nickname" span={1}>
            <Text>{selectedRecord.Customer.nickname || 'N/A'}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Tên khách hàng" span={1}>
            <Text>{selectedRecord.Customer.name}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Mã giới thiệu" span={1}>
            <Text code>{selectedRecord.Customer.inviteCode || 'N/A'}</Text>
          </Descriptions.Item>
        </Descriptions>

        <Divider orientation="left">Thông tin tài chính</Divider>
        <Descriptions bordered column={2} size="small">
          <Descriptions.Item label="Số tiền yêu cầu" span={1}>
            <Text strong style={{ color: "#fa8c16", fontSize: "16px" }}>
              {formatCurrency(selectedRecord.amount)}
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="Phí rút tiền" span={1}>
            <Text style={{ color: "#f5222d" }}>
              {formatCurrency(selectedRecord.feeWithdraw)}
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="Số tiền thực nhận" span={2}>
            <Text strong style={{ color: "#52c41a", fontSize: "16px" }}>
              {formatCurrency(netAmount)}
            </Text>
          </Descriptions.Item>
        </Descriptions>

        <Divider orientation="left">Thông tin chuyển tiền</Divider>
        <Descriptions bordered column={2} size="small">
          <Descriptions.Item label="Loại giao dịch" span={1}>
            <Tag color="blue">{selectedRecord.type === 'INTERNAL' ? 'Nội bộ' : 'Bên ngoài'}</Tag>
          </Descriptions.Item>
          {selectedRecord.txHash && (
            <Descriptions.Item label="Transaction Hash" span={1}>
              <Text code copyable>{selectedRecord.txHash}</Text>
            </Descriptions.Item>
          )}
          {selectedRecord.fromAddress && (
            <Descriptions.Item label="Địa chỉ gửi" span={1}>
              <Text code copyable>{selectedRecord.fromAddress}</Text>
            </Descriptions.Item>
          )}
          {selectedRecord.toAddress && (
            <Descriptions.Item label="Địa chỉ nhận" span={1}>
              <Text code copyable>{selectedRecord.toAddress}</Text>
            </Descriptions.Item>
          )}
          {selectedRecord.reasonRejected && (
            <Descriptions.Item label="Lý do từ chối" span={2}>
              <Text type="danger">{selectedRecord.reasonRejected}</Text>
            </Descriptions.Item>
          )}
        </Descriptions>

        <Divider orientation="left">Thông tin thời gian</Divider>
        <Descriptions bordered column={2} size="small">
          <Descriptions.Item label="Thời gian tạo" span={1}>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <CalendarOutlined style={{ color: "#1890ff" }} />
              <Text>{formatFullDateTime(selectedRecord.createdAt)}</Text>
            </div>
          </Descriptions.Item>
          <Descriptions.Item label="Cập nhật cuối" span={1}>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <CalendarOutlined style={{ color: "#fa8c16" }} />
              <Text>{formatFullDateTime(selectedRecord.updatedAt)}</Text>
            </div>
          </Descriptions.Item>
        </Descriptions>
      </Modal>
    );
  };

  const columns: ColumnsType<WithdrawRecord> = [
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
      render: (_, record) => renderCustomerInfo(record.Customer),
    },
    {
      title: "Thông tin chuyển tiền",
      key: "transfer",
      width: 220,
      render: (_, record) => renderTransferInfo(record),
    },
    {
      title: "Thông tin tài chính",
      key: "financial",
      width: 150,
      render: (_, record) => renderFinancialInfo(record),
    },
    {
      title: "Mã rút tiền",
      key: "withdrawCode",
      width: 160,
      render: (_, record) => renderWithdrawInfo(record),
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
              Tạo: {formatDateTime(record.createdAt)}
            </Text>
          </div>
          {record.updatedAt && record.updatedAt !== record.createdAt && (
            <div>
              <Text style={{ fontSize: "12px", color: "#fa8c16" }}>
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
    <div className="withdraw-table">
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
        }}
        rowKey="id"
        scroll={{ x: 1300 }}
        size="middle"
      />

      {renderDetailModal()}
    </div>
  );
};

export default WithdrawTable;
