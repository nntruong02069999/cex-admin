import React from 'react';
import { Modal, Descriptions, Tag, Button, Space, Typography, Card, Row, Col, Tooltip } from 'antd';
import { ExportOutlined, CopyOutlined, CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { DepositTransaction } from '../types/customer.types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { getStatusColor } from '../utils/helpers';

const { Text } = Typography;

interface DepositDetailModalProps {
  deposit: DepositTransaction;
  visible: boolean;
  onClose: () => void;
}

const DepositDetailModal: React.FC<DepositDetailModalProps> = ({
  deposit,
  visible,
  onClose,
}) => {
  const getBSCScanUrl = (txHash: string): string => {
    return `https://bscscan.com/tx/${txHash}`;
  };

  const openBSCScan = (txHash: string) => {
    window.open(getBSCScanUrl(txHash), '_blank');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // You could add a message here if needed
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'PENDING':
        return <ClockCircleOutlined style={{ color: '#faad14' }} />;
      case 'FAILED':
      case 'CANCELLED':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'Thành công';
      case 'PENDING':
        return 'Chờ xử lý';
      case 'FAILED':
        return 'Thất bại';
      case 'CANCELLED':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  return (
    <Modal
      title={
        <Space>
          <span>Chi tiết giao dịch nạp tiền</span>
          <Tag color={getStatusColor(deposit.status)}>
            {getStatusIcon(deposit.status)} {getStatusText(deposit.status)}
          </Tag>
        </Space>
      }
      visible={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Đóng
        </Button>,
        <Button
          key="bscscan"
          type="primary"
          icon={<ExportOutlined />}
          onClick={() => openBSCScan(deposit.txHash)}
        >
          Xem trên BSCScan
        </Button>,
      ]}
      width={800}
      destroyOnClose
    >
      <div style={{ marginTop: 16 }}>
        {/* Basic Information */}
        <Card title="Thông tin cơ bản" size="small" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Mã đơn hàng">
                  <Text code copyable={{ text: deposit.orderId }}>
                    {deposit.orderId}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Ngày tạo">
                  {formatDate(deposit.createdAt || 0, 'DISPLAY')}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày cập nhật">
                  {formatDate(deposit.updatedAt || 0, 'DISPLAY')}
                </Descriptions.Item>
              </Descriptions>
            </Col>
            <Col span={12}>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Asset">
                  <Tag color="blue">{deposit.asset}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Blockchain">
                  <Tag color="gold">{deposit.chain}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="ID Khách hàng">
                  <Text code>{deposit.customerId}</Text>
                </Descriptions.Item>
              </Descriptions>
            </Col>
          </Row>
        </Card>

        {/* Amount Information */}
        <Card title="Thông tin số tiền" size="small" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={8}>
              <div style={{ textAlign: 'center', padding: '16px' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3f8600' }}>
                  {formatCurrency(deposit.usdtAmount, 'USDT')}
                </div>
                <div style={{ color: '#666', marginTop: '4px' }}>Số tiền nạp</div>
              </div>
            </Col>
            <Col span={8}>
              <div style={{ textAlign: 'center', padding: '16px' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fa8c16' }}>
                  {deposit.bonusAmount ? `+${formatCurrency(deposit.bonusAmount, 'USDT')}` : '-'}
                </div>
                <div style={{ color: '#666', marginTop: '4px' }}>Bonus</div>
              </div>
            </Col>
            <Col span={8}>
              <div style={{ textAlign: 'center', padding: '16px' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                  {formatCurrency(deposit.usdtAmount + (deposit.bonusAmount || 0), 'USDT')}
                </div>
                <div style={{ color: '#666', marginTop: '4px' }}>Tổng cộng</div>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Blockchain Information */}
        <Card title="Thông tin Blockchain" size="small" style={{ marginBottom: 16 }}>
          <Descriptions column={1} size="small">
            <Descriptions.Item label="Địa chỉ gửi">
              <Space>
                <Text code style={{ fontSize: '12px' }}>{deposit.fromAddress}</Text>
                <Tooltip title="Sao chép địa chỉ">
                  <Button
                    type="text"
                    size="small"
                    icon={<CopyOutlined />}
                    onClick={() => copyToClipboard(deposit.fromAddress)}
                  />
                </Tooltip>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Địa chỉ nhận">
              <Space>
                <Text code style={{ fontSize: '12px' }}>{deposit.toAddress}</Text>
                <Tooltip title="Sao chép địa chỉ">
                  <Button
                    type="text"
                    size="small"
                    icon={<CopyOutlined />}
                    onClick={() => copyToClipboard(deposit.toAddress)}
                  />
                </Tooltip>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Transaction Hash">
              <Space>
                <Text code style={{ fontSize: '12px' }}>{deposit.txHash}</Text>
                <Tooltip title="Sao chép TX Hash">
                  <Button
                    type="text"
                    size="small"
                    icon={<CopyOutlined />}
                    onClick={() => copyToClipboard(deposit.txHash)}
                  />
                </Tooltip>
                <Tooltip title="Xem trên BSCScan">
                  <Button
                    type="text"
                    size="small"
                    icon={<ExportOutlined />}
                    onClick={() => openBSCScan(deposit.txHash)}
                  />
                </Tooltip>
              </Space>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Customer Information */}
        <Card title="Thông tin khách hàng" size="small">
          <Descriptions column={2} size="small">
            <Descriptions.Item label="Email">
              {deposit.customer.email}
            </Descriptions.Item>
            <Descriptions.Item label="Nickname">
              {deposit.customer.nickname}
            </Descriptions.Item>
            <Descriptions.Item label="Tên">
              {deposit.customer.firstName} {deposit.customer.lastName}
            </Descriptions.Item>
            <Descriptions.Item label="VIP Level">
              <Tag color="purple">Level {deposit.customer.currentVipLevel}</Tag>
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </div>
    </Modal>
  );
};

export default DepositDetailModal;