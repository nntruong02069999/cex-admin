import React from 'react';
import { connect } from 'dva';
import { Modal, Descriptions, Tag, Divider, Row, Col, Typography, Space } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { HouseWalletState } from '@src/models/houseWallet';
import BSCScanLink from '../Common/BSCScanLink';
import AmountDisplay from '../Common/AmountDisplay';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface WithdrawDetailModalProps {
  houseWallet: HouseWalletState;
  dispatch: any;
}

const WithdrawDetailModal: React.FC<WithdrawDetailModalProps> = ({
  houseWallet,
  dispatch
}) => {
  const { withdrawDetailModal } = houseWallet;
  const { visible, record } = withdrawDetailModal;

  const handleClose = () => {
    dispatch({ type: 'houseWallet/closeWithdrawDetailModal' });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'PENDING': 'orange',
      'SUCCESS': 'green',
      'FAILED': 'red',
      'CANCELLED': 'default',
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  const getWithdrawTypeColor = (type: string) => {
    const colors = {
      'MANUAL': 'blue',
      'AUTOMATED': 'green',
      'SCHEDULED': 'purple',
    };
    return colors[type as keyof typeof colors] || 'default';
  };

  if (!record) return null;

  return (
    <Modal
      title={
        <Space>
          <span>Chi tiết giao dịch rút #{record.id}</span>
          <Tag color={getStatusColor(record.status)}>{record.status}</Tag>
        </Space>
      }
      visible={visible}
      onCancel={handleClose}
      footer={null}
      width={800}
      closeIcon={<CloseOutlined />}
      className="withdraw-detail-modal"
    >
      <div className="withdraw-detail-content">
        <Row gutter={[24, 16]}>
          <Col span={24}>
            <Title level={5}>Thông tin giao dịch</Title>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="ID giao dịch" span={1}>
                <Text strong>{record.id}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái" span={1}>
                <Tag color={getStatusColor(record.status)}>{record.status}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Loại rút tiền" span={1}>
                <Tag color={getWithdrawTypeColor(record.withdrawType)}>
                  {record.withdrawType}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Người tạo" span={1}>
                <Text>{record.initiatedBy || '-'}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo" span={1}>
                <Text>
                  {record.createdAt 
                    ? dayjs(record.createdAt).format('DD/MM/YYYY HH:mm:ss')
                    : '-'
                  }
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày cập nhật" span={1}>
                <Text>
                  {record.updatedAt 
                    ? dayjs(record.updatedAt).format('DD/MM/YYYY HH:mm:ss')
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
                <Text strong>{record.fromCustomerId}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ ví nguồn" span={1}>
                {record.fromWalletAddress ? (
                  <BSCScanLink address={record.fromWalletAddress} type="address" />
                ) : (
                  <Text>-</Text>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="ID ví đích" span={1}>
                <Text>{record.toWalletId || '-'}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ ví đích" span={1}>
                {record.toWalletAddress ? (
                  <BSCScanLink address={record.toWalletAddress} type="address" />
                ) : (
                  <Text>-</Text>
                )}
              </Descriptions.Item>
              {record.toWallet && (
                <>
                  <Descriptions.Item label="Loại ví đích" span={1}>
                    <Tag color="blue">
                      {record.toWallet.walletType?.replace('_', ' ')}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Mô tả ví đích" span={1}>
                    <Text>{record.toWallet.description || '-'}</Text>
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
              <Descriptions.Item label="Số tiền rút" span={1}>
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

export default connect(mapStateToProps)(WithdrawDetailModal);