import React from 'react';
import {
  Modal,
  Descriptions,
  Typography,
  Divider,
  Button,
  Card,
  Row,
  Col,
  Statistic,
  Tag,
} from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { Order, OrderSide, OrderStatus, OrderType } from '../types/customer.types';
import { formatCurrency, formatDate } from '../utils/formatters';

const { Title, Text } = Typography;

interface OrderDetailModalProps {
  visible: boolean;
  onClose: () => void;
  order: Order | null;
}

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  visible,
  onClose,
  order,
}) => {
  // Helper functions
  const getOrderResult = (order: Order): 'WIN' | 'LOSS' | 'DRAW' => {
    if (order.status !== OrderStatus.SUCCESS) return 'LOSS';
    if (order.resultProfit > 0) return 'WIN';
    if (order.resultProfit < 0) return 'LOSS';
    return 'DRAW';
  };

  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'Chờ';
      case OrderStatus.SUCCESS:
        return 'WIN';
      case OrderStatus.FAILED:
        return 'LOST';
      case OrderStatus.CANCELLED:
        return 'LOST';
      case OrderStatus.EXPIRED:
        return 'LOST';
      default:
        return status;
    }
  };

  const getSideText = (side: OrderSide) => {
    switch (side) {
      case OrderSide.BUY:
        return 'MUA';
      case OrderSide.SELL:
        return 'BÁN';
      default:
        return side;
    }
  };

  const getTypeText = (type: OrderType) => {
    switch (type) {
      case OrderType.LIVE:
        return 'LIVE';
      case OrderType.DEMO:
        return 'DEMO';
      default:
        return type;
    }
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <EyeOutlined />
          <Title level={4} style={{ margin: 0 }}>
            Chi tiết lệnh #{order?.orderNumber}
          </Title>
        </div>
      }
      visible={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Đóng
        </Button>,
      ]}
      width={800}
      centered
    >
      {order && (
        <div>
          {/* Order Summary */}
          <Card size="small" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={6}>
                <Statistic
                  title="Trạng thái"
                  value={getStatusText(order.status)}
                  valueStyle={{
                    color:
                      order.status === OrderStatus.SUCCESS
                        ? '#52c41a'
                        : order.status === OrderStatus.PENDING
                        ? '#1890ff'
                        : '#ff4d4f',
                  }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="P&L"
                  value={`${order.resultProfit > 0 ? '+' : ''}${formatCurrency(
                    order.resultProfit
                  )}`}
                  valueStyle={{
                    color:
                      order.resultProfit > 0
                        ? '#3f8600'
                        : order.resultProfit < 0
                        ? '#cf1322'
                        : '#666',
                  }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Kết quả"
                  value={getOrderResult(order)}
                  valueStyle={{
                    color:
                      getOrderResult(order) === 'WIN'
                        ? '#3f8600'
                        : getOrderResult(order) === 'LOSS'
                        ? '#cf1322'
                        : '#faad14',
                  }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Thắng"
                  value={formatCurrency(order.winAmount)}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
            </Row>
          </Card>

          {/* Order Details */}
          <Descriptions
            title="Thông tin cơ bản"
            bordered
            column={2}
            size="small"
          >
            <Descriptions.Item label="ID lệnh">
              {order.id}
            </Descriptions.Item>
            <Descriptions.Item label="Số lệnh">
              <Text code>{order.orderNumber}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Số phiên">
              <Text code style={{ color: '#1890ff' }}>
                {order.issueNumber}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="ID Chart">
              {order.idChart || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Symbol">
              <Tag color="blue">{order.symbol}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Cược">
              <Tag
                color={order.side === OrderSide.BUY ? 'green' : 'red'}
              >
                {getSideText(order.side)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Loại giao dịch">
              <Tag
                color={order.type === OrderType.LIVE ? 'red' : 'orange'}
              >
                {getTypeText(order.type)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Tài khoản Marketing">
              {order.fromMktAccount ? 'Có' : 'Không'}
            </Descriptions.Item>
          </Descriptions>

          <Divider />

          {/* Amount Information */}
          <Descriptions
            title="Thông tin số tiền"
            bordered
            column={2}
            size="small"
          >
            <Descriptions.Item label="Số tiền giao dịch">
              <Text strong>{formatCurrency(order.amount)}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Phí giao dịch">
              <Text type="secondary">{formatCurrency(order.fee)}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Số tiền thực">
              <Text>{formatCurrency(order.realAmount)}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Cấu hình lợi nhuận">
              {(order.configProfit * 100).toFixed(1)}%
            </Descriptions.Item>
          </Descriptions>

          <Divider />

          {/* Price Information */}
          <Descriptions
            title="Thông tin giá"
            bordered
            column={2}
            size="small"
          >
            <Descriptions.Item label="Giá vào lệnh">
              {order.entryPrice
                ? `$${order.entryPrice.toFixed(2)}`
                : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Giá mở cửa">
              ${order.openingPrice.toFixed(2)}
            </Descriptions.Item>
            <Descriptions.Item label="Giá đóng cửa">
              ${order.closingPrice.toFixed(2)}
            </Descriptions.Item>
            <Descriptions.Item label="Kết quả Chart">
              {order.chartResult ? (
                <Tag
                  color={
                    order.chartResult === 'BUY' ? 'green' : 'red'
                  }
                >
                  {order.chartResult}
                </Tag>
              ) : (
                'N/A'
              )}
            </Descriptions.Item>
          </Descriptions>

          <Divider />

          {/* Timing Information */}
          <Descriptions
            title="Thông tin thời gian"
            bordered
            column={2}
            size="small"
          >
            <Descriptions.Item label="Thời gian tạo">
              {order.createdAt
                ? formatDate(order.createdAt, 'DISPLAY')
                : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Thời gian cập nhật">
              {order.updatedAt
                ? formatDate(order.updatedAt, 'DISPLAY')
                : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Thời gian tồn tại">
              {order.duration
                ? `${order.duration}s`
                : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Hết hạn lúc">
              {order.expiresAt
                ? formatDate(order.expiresAt, 'DISPLAY')
                : 'N/A'}
            </Descriptions.Item>
          </Descriptions>

          {/* Notes */}
          {order.notes && (
            <>
              <Divider />
              <Descriptions
                title="Ghi chú"
                bordered
                column={1}
                size="small"
              >
                <Descriptions.Item label="Ghi chú">
                  <Text type="secondary">{order.notes}</Text>
                </Descriptions.Item>
              </Descriptions>
            </>
          )}
        </div>
      )}
    </Modal>
  );
};

export default OrderDetailModal;