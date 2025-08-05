import React from 'react';
import { connect } from 'dva';
import { Modal, Descriptions, Tag, Divider, Row, Col, Typography, Space, Alert } from 'antd';
import { CloseOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { HouseWalletState } from '@src/models/houseWallet';
import BSCScanLink from '../Common/BSCScanLink';
import AmountDisplay from '../Common/AmountDisplay';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface PayoutDetailModalProps {
  houseWallet: HouseWalletState;
  dispatch: any;
}

const PayoutDetailModal: React.FC<PayoutDetailModalProps> = ({
  houseWallet,
  dispatch
}) => {
  const { payoutDetailModal } = houseWallet;
  const { visible, record } = payoutDetailModal;

  const handleClose = () => {
    dispatch({ type: 'houseWallet/closePayoutDetailModal' });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'PENDING': 'orange',
      'PROCESSING': 'blue',
      'SUCCESS': 'green',
      'FAILED': 'red',
      'CANCELLED': 'default',
      'INSUFFICIENT_FUNDS': 'magenta',
      'INVALID_ADDRESS': 'red',
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  if (!record) return null;

  return (
    <Modal
      title={
        <Space>
          <span>Chi tiết giao dịch thanh toán #{record.id}</span>
          <Tag color={getStatusColor(record.status)}>
            {record.status.replace('_', ' ')}
          </Tag>
        </Space>
      }
      visible={visible}
      onCancel={handleClose}
      footer={null}
      width={900}
      closeIcon={<CloseOutlined />}
      className="payout-detail-modal"
    >
      <div className="payout-detail-content">
        {record.status === 'FAILED' && record.failReason && (
          <Alert
            message="Giao dịch thất bại"
            description={record.failReason}
            type="error"
            icon={<ExclamationCircleOutlined />}
            style={{ marginBottom: 16 }}
            showIcon
          />
        )}

        <Row gutter={[24, 16]}>
          <Col span={24}>
            <Title level={5}>Thông tin giao dịch</Title>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="ID giao dịch" span={1}>
                <Text strong>{record.id}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái" span={1}>
                <Tag color={getStatusColor(record.status)}>
                  {record.status.replace('_', ' ')}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="ID đơn rút" span={1}>
                <Text>{record.withdrawRequestId || '-'}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="ID đơn hàng" span={1}>
                <Text>{record.orderId || '-'}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Người tạo" span={1}>
                <Text>{record.initiatedBy || '-'}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Người xử lý" span={1}>
                <Text>{record.processedBy || '-'}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo" span={1}>
                <Text>
                  {record.createdAt 
                    ? dayjs(record.createdAt).format('DD/MM/YYYY HH:mm:ss')
                    : '-'
                  }
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày xử lý" span={1}>
                <Text>
                  {record.processedAt 
                    ? dayjs(record.processedAt).format('DD/MM/YYYY HH:mm:ss')
                    : '-'
                  }
                </Text>
              </Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>

        <Divider />

        <Row gutter={[24, 16]}>
          <Col span={24}>
            <Title level={5}>Thông tin khách hàng & ví</Title>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="ID khách hàng" span={1}>
                <Text strong>{record.customerId}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ nhận" span={1}>
                <BSCScanLink address={record.toAddress} type="address" />
              </Descriptions.Item>
              <Descriptions.Item label="ID ví nguồn" span={1}>
                <Text>{record.fromWalletId}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ ví nguồn" span={1}>
                {record.fromWallet?.address ? (
                  <BSCScanLink address={record.fromWallet.address} type="address" />
                ) : (
                  <Text>-</Text>
                )}
              </Descriptions.Item>
              {record.fromWallet && (
                <>
                  <Descriptions.Item label="Loại ví nguồn" span={1}>
                    <Tag color="blue">
                      {record.fromWallet.walletType?.replace('_', ' ')}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Mô tả ví nguồn" span={1}>
                    <Text>{record.fromWallet.description || '-'}</Text>
                  </Descriptions.Item>
                </>
              )}
            </Descriptions>
          </Col>
        </Row>

        <Divider />

        <Row gutter={[24, 16]}>
          <Col span={24}>
            <Title level={5}>Thông tin tài chính</Title>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Số tiền thanh toán" span={1}>
                <Text strong style={{ fontSize: '16px', color: '#1890ff' }}>
                  <AmountDisplay amount={record.amount} currency="USDT" />
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Phí giao dịch" span={1}>
                <Text style={{ color: '#fa8c16' }}>
                  <AmountDisplay 
                    amount={record.feeAmount || 0} 
                    currency="USDT" 
                  />
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Tổng cộng" span={2}>
                <Text strong style={{ fontSize: '16px', color: '#52c41a' }}>
                  <AmountDisplay 
                    amount={record.amount + (record.feeAmount || 0)} 
                    currency="USDT" 
                  />
                </Text>
              </Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>

        <Divider />

        <Row gutter={[24, 16]}>
          <Col span={24}>
            <Title level={5}>Thông tin blockchain</Title>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Transaction Hash">
                {record.txHash ? (
                  <BSCScanLink txHash={record.txHash} type="tx" truncate={false} />
                ) : (
                  <Text type="secondary">Chưa có hash giao dịch</Text>
                )}
              </Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>

        <Divider />

        <Row gutter={[24, 16]}>
          <Col span={24}>
            <Title level={5}>Thông tin thử lại</Title>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Số lần thử lại" span={1}>
                <Text>
                  <span style={{ color: record.retryCount && record.retryCount > 0 ? '#fa8c16' : '#52c41a' }}>
                    {record.retryCount || 0}
                  </span>
                  <span style={{ color: '#999' }}> / {record.maxRetries || 3}</span>
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Có thể thử lại" span={1}>
                {record.status === 'FAILED' && 
                 (record.retryCount || 0) < (record.maxRetries || 3) ? (
                  <Tag color="orange">Có</Tag>
                ) : (
                  <Tag color="default">Không</Tag>
                )}
              </Descriptions.Item>
              {record.failReason && (
                <Descriptions.Item label="Lý do thất bại" span={2}>
                  <Text type="danger">{record.failReason}</Text>
                </Descriptions.Item>
              )}
            </Descriptions>
          </Col>
        </Row>

        {record.notes && (
          <>
            <Divider />
            <Row gutter={[24, 16]}>
              <Col span={24}>
                <Title level={5}>Ghi chú</Title>
                <div style={{ 
                  padding: '12px', 
                  backgroundColor: '#fafafa', 
                  borderRadius: '6px',
                  border: '1px solid #d9d9d9'
                }}>
                  <Text>{record.notes}</Text>
                </div>
              </Col>
            </Row>
          </>
        )}
      </div>
    </Modal>
  );
};

const mapStateToProps = ({ houseWallet }: any) => ({
  houseWallet
});

export default connect(mapStateToProps)(PayoutDetailModal);