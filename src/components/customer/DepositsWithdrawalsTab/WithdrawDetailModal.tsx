import React from "react";
import {
  Modal,
  Descriptions,
  Tag,
  Button,
  Space,
  Typography,
  Card,
  Row,
  Col,
  Tooltip,
} from "antd";
import {
  ExportOutlined,
  CopyOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import {
  WithdrawTransaction,
  WithdrawStatus,
  WithdrawType,
} from "../types/customer.types";
import { formatCurrency, formatDate } from "../utils/formatters";
import { getStatusColor } from "../utils/helpers";

const { Text } = Typography;

interface WithdrawDetailModalProps {
  withdrawal: WithdrawTransaction;
  visible: boolean;
  onClose: () => void;
}

const WithdrawDetailModal: React.FC<WithdrawDetailModalProps> = ({
  withdrawal,
  visible,
  onClose,
}) => {
  const getBSCScanUrl = (txHash: string): string => {
    return `https://bscscan.com/tx/${txHash}`;
  };

  const openBSCScan = (txHash: string) => {
    window.open(getBSCScanUrl(txHash), "_blank");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // You could add a message here if needed
    });
  };

  const getStatusIcon = (status: WithdrawStatus) => {
    switch (status) {
      case WithdrawStatus.SUCCESS:
        return <CheckCircleOutlined style={{ color: "#52c41a" }} />;
      case WithdrawStatus.PENDING:
        return <ClockCircleOutlined style={{ color: "#faad14" }} />;
      case WithdrawStatus.REJECTED:
        return <CloseCircleOutlined style={{ color: "#ff4d4f" }} />;
      default:
        return null;
    }
  };

  const getStatusText = (status: WithdrawStatus) => {
    switch (status) {
      case WithdrawStatus.SUCCESS:
        return "Thành công";
      case WithdrawStatus.PENDING:
        return "Chờ xử lý";
      case WithdrawStatus.REJECTED:
        return "Từ chối";
      default:
        return status;
    }
  };

  const getTypeText = (type: WithdrawType) => {
    switch (type) {
      case WithdrawType.INTERNAL:
        return "Nội bộ";
      case WithdrawType.EXTERNAL:
        return "Bên ngoài";
      default:
        return type;
    }
  };

  const totalWithdrawAmount = withdrawal.amount + withdrawal.feeWithdraw;

  return (
    <Modal
      title={
        <Space>
          <span>Chi tiết giao dịch rút tiền</span>
          <Tag color={getStatusColor(withdrawal.status)}>
            {getStatusIcon(withdrawal.status)}{" "}
            {getStatusText(withdrawal.status)}
          </Tag>
        </Space>
      }
      visible={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Đóng
        </Button>,
        ...(withdrawal.txHash
          ? [
              <Button
                key="bscscan"
                type="primary"
                icon={<ExportOutlined />}
                onClick={() => openBSCScan(withdrawal.txHash!)}
              >
                Xem trên BSCScan
              </Button>,
            ]
          : []),
      ]}
      width={800}
      destroyOnClose
    >
      <div style={{ marginTop: 16 }}>
        {/* Basic Information */}
        <Card
          title="Thông tin cơ bản"
          size="small"
          style={{ marginBottom: 16 }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Mã rút tiền">
                  <Text code copyable={{ text: withdrawal.withdrawCode }}>
                    {withdrawal.withdrawCode}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Ngày tạo">
                  {formatDate(withdrawal.createdAt || 0, "DISPLAY")}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày cập nhật">
                  {formatDate(withdrawal.updatedAt || 0, "DISPLAY")}
                </Descriptions.Item>
              </Descriptions>
            </Col>
            <Col span={12}>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Loại rút tiền">
                  <Tag
                    color={
                      withdrawal.type === WithdrawType.INTERNAL
                        ? "blue"
                        : "green"
                    }
                  >
                    {getTypeText(withdrawal.type)}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="ID Khách hàng">
                  <Text code>{withdrawal.customerId}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  <Tag color={getStatusColor(withdrawal.status)}>
                    {getStatusIcon(withdrawal.status)}{" "}
                    {getStatusText(withdrawal.status)}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
            </Col>
          </Row>
        </Card>

        {/* Amount Information */}
        <Card
          title="Thông tin số tiền"
          size="small"
          style={{ marginBottom: 16 }}
        >
          <Row gutter={16}>
            <Col span={8}>
              <div style={{ textAlign: "center", padding: "16px" }}>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: "bold",
                    color: "#cf1322",
                  }}
                >
                  {formatCurrency(withdrawal.amount, "USDT")}
                </div>
                <div style={{ color: "#666", marginTop: "4px" }}>
                  Số tiền rút
                </div>
              </div>
            </Col>
            <Col span={8}>
              <div style={{ textAlign: "center", padding: "16px" }}>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: "bold",
                    color: "#fa8c16",
                  }}
                >
                  {withdrawal.feeWithdraw > 0
                    ? formatCurrency(withdrawal.feeWithdraw, "USDT")
                    : "-"}
                </div>
                <div style={{ color: "#666", marginTop: "4px" }}>
                  Phí rút tiền
                </div>
              </div>
            </Col>
            <Col span={8}>
              <div style={{ textAlign: "center", padding: "16px" }}>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: "bold",
                    color: "#1890ff",
                  }}
                >
                  {formatCurrency(totalWithdrawAmount, "USDT")}
                </div>
                <div style={{ color: "#666", marginTop: "4px" }}>Tổng trừ</div>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Blockchain Information */}
        {withdrawal.type === WithdrawType.EXTERNAL && (
          <Card
            title="Thông tin Blockchain"
            size="small"
            style={{ marginBottom: 16 }}
          >
            <Descriptions column={1} size="small">
              {withdrawal.fromAddress && (
                <Descriptions.Item label="Địa chỉ gửi">
                  <Space>
                    <Text code style={{ fontSize: "12px" }}>
                      {withdrawal.fromAddress}
                    </Text>
                    <Tooltip title="Sao chép địa chỉ">
                      <Button
                        type="text"
                        size="small"
                        icon={<CopyOutlined />}
                        onClick={() => copyToClipboard(withdrawal.fromAddress!)}
                      />
                    </Tooltip>
                  </Space>
                </Descriptions.Item>
              )}
              {withdrawal.toAddress && (
                <Descriptions.Item label="Địa chỉ nhận">
                  <Space>
                    <Text code style={{ fontSize: "12px" }}>
                      {withdrawal.toAddress}
                    </Text>
                    <Tooltip title="Sao chép địa chỉ">
                      <Button
                        type="text"
                        size="small"
                        icon={<CopyOutlined />}
                        onClick={() => copyToClipboard(withdrawal.toAddress!)}
                      />
                    </Tooltip>
                  </Space>
                </Descriptions.Item>
              )}
              {withdrawal.txHash && (
                <Descriptions.Item label="Transaction Hash">
                  <Space>
                    <Text code style={{ fontSize: "12px" }}>
                      {withdrawal.txHash}
                    </Text>
                    <Tooltip title="Sao chép TX Hash">
                      <Button
                        type="text"
                        size="small"
                        icon={<CopyOutlined />}
                        onClick={() => copyToClipboard(withdrawal.txHash!)}
                      />
                    </Tooltip>
                    <Tooltip title="Xem trên BSCScan">
                      <Button
                        type="text"
                        size="small"
                        icon={<ExportOutlined />}
                        onClick={() => openBSCScan(withdrawal.txHash!)}
                      />
                    </Tooltip>
                  </Space>
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        )}

        {/* Admin Information */}
        {(withdrawal.adminIdApproved ||
          withdrawal.adminIdRejected ||
          withdrawal.reasonRejected) && (
          <Card
            title="Thông tin xử lý"
            size="small"
            style={{ marginBottom: 16 }}
          >
            <Descriptions column={2} size="small">
              {withdrawal.adminIdApproved && (
                <Descriptions.Item label="Admin duyệt">
                  <Tag color="green">
                    Admin ID: {withdrawal.adminIdApproved}
                  </Tag>
                </Descriptions.Item>
              )}
              {withdrawal.adminIdRejected && (
                <Descriptions.Item label="Admin từ chối">
                  <Tag color="red">Admin ID: {withdrawal.adminIdRejected}</Tag>
                </Descriptions.Item>
              )}
              {withdrawal.reasonRejected && (
                <Descriptions.Item label="Lý do từ chối" span={2}>
                  <Text type="danger">{withdrawal.reasonRejected}</Text>
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        )}

        {/* Customer Information */}
        <Card title="Thông tin khách hàng" size="small">
          <Descriptions column={2} size="small">
            <Descriptions.Item label="Email">
              {withdrawal.customer.email}
            </Descriptions.Item>
            <Descriptions.Item label="Nickname">
              {withdrawal.customer.nickname}
            </Descriptions.Item>
            <Descriptions.Item label="Tên">
              {withdrawal.customer.firstName} {withdrawal.customer.lastName}
            </Descriptions.Item>
            <Descriptions.Item label="VIP Level">
              <Tag color="purple">
                Level {withdrawal.customer.currentVipLevel}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </div>
    </Modal>
  );
};

export default WithdrawDetailModal;
