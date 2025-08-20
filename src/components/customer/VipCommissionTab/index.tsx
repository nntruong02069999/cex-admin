import React from 'react';
import { Row, Col, Card, Progress, Table, Tag } from 'antd';
import { CustomerDetailData } from '../types/customer.types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { getStatusColor } from '../utils/helpers';
import './styles.less';

interface VipCommissionTabProps {
  customerId: number;
  customerData: CustomerDetailData;
}

const VipCommissionTab: React.FC<VipCommissionTabProps> = ({
  customerId: _customerId,
  customerData
}) => {
  const currentLevel = customerData.customer.currentVipLevel;
  const nextLevel = currentLevel + 1;
  const progressToNext = Math.min((currentLevel / 7) * 100, 100);

  // Mock commission data
  const commissions = [
    {
      id: 1,
      date: Date.now() / 1000,
      type: 'Trading',
      fromUser: 'user_abc',
      amount: 25,
      level: 'F1',
      status: 'PAID'
    },
    {
      id: 2,
      date: (Date.now() - 86400000) / 1000,
      type: 'Upgrade',
      fromUser: 'user_xyz',
      amount: 50,
      level: 'F2',
      status: 'PENDING'
    },
    {
      id: 3,
      date: (Date.now() - 172800000) / 1000,
      type: 'Referral',
      fromUser: 'user_def',
      amount: 15,
      level: 'F1',
      status: 'PAID'
    }
  ];

  const columns = [
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
      render: (date: number) => formatDate(date, 'DISPLAY')
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type'
    },
    {
      title: 'Từ user',
      dataIndex: 'fromUser',
      key: 'fromUser'
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => (
        <span style={{ color: '#3f8600', fontWeight: 'bold' }}>
          {formatCurrency(amount)}
        </span>
      )
    },
    {
      title: 'Cấp',
      dataIndex: 'level',
      key: 'level',
      render: (level: string) => (
        <Tag color="blue">{level}</Tag>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status === 'PAID' ? '✅ Đã trả' : 
           status === 'PENDING' ? '⏳ Chờ' : status}
        </Tag>
      )
    }
  ];

  return (
    <div className="vip-commission-tab">
      {/* VIP Information */}
      <Card title="👑 Thông tin VIP" style={{ marginBottom: 24 }}>
        <Row gutter={24} align="middle">
          <Col xs={24} sm={12}>
            <div style={{ marginBottom: 16 }}>
              <p>
                <strong>👑 Cấp hiện tại:</strong> 
                <Tag color="purple" style={{ marginLeft: 8, fontSize: 14 }}>
                  Level {currentLevel}
                </Tag>
              </p>
              
              <p>
                <strong>📅 Kích hoạt:</strong> 01/01/2024
              </p>
              
              <p>
                <strong>💰 Phí nâng cấp:</strong> {formatCurrency(337)}
              </p>
              
              {nextLevel <= 7 && (
                <p>
                  <strong>🎯 Cấp tiếp:</strong> Level {nextLevel} ({formatCurrency(500)})
                </p>
              )}
            </div>
          </Col>
          
          <Col xs={24} sm={12}>
            <div>
              <p style={{ marginBottom: 8 }}>
                <strong>Tiến độ lên Level {nextLevel <= 7 ? nextLevel : 'MAX'}:</strong>
              </p>
              <Progress 
                percent={progressToNext} 
                status={nextLevel > 7 ? 'success' : 'active'}
                strokeColor={{
                  from: '#722ed1',
                  to: '#d3adf7',
                }}
              />
              <p style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                {progressToNext.toFixed(0)}% Progress to Level {nextLevel <= 7 ? nextLevel : 'MAX'}
              </p>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Commission Dashboard */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#52c41a' }}>
                {formatCurrency(customerData.customerMoney.totalCommission)}
              </div>
              <div style={{ color: '#666' }}>💰 Tổng</div>
            </div>
          </Card>
        </Col>
        
        <Col xs={12} sm={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>
                {formatCurrency(245)}
              </div>
              <div style={{ color: '#666' }}>📅 Tháng này</div>
            </div>
          </Card>
        </Col>
        
        <Col xs={12} sm={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#faad14' }}>
                {formatCurrency(50)}
              </div>
              <div style={{ color: '#666' }}>⏳ Chờ</div>
            </div>
          </Card>
        </Col>
        
        <Col xs={12} sm={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#722ed1' }}>
                2.5%
              </div>
              <div style={{ color: '#666' }}>📊 Tỷ lệ</div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Commission Chart */}
      <Card title="📈 Biểu đồ Hoa hồng" style={{ marginBottom: 24 }}>
        <div style={{ 
          height: 200, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: '#fafafa',
          borderRadius: 6
        }}>
          <p style={{ color: '#666', fontSize: 16 }}>
            Biểu đồ hoa hồng hàng ngày sẽ được hiển thị ở đây
          </p>
        </div>
      </Card>

      {/* Commission History */}
      <Card title="📋 Lịch sử Hoa hồng">
        <Table
          dataSource={commissions}
          columns={columns}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} bản ghi`
          }}
          scroll={{ x: 'max-content' }}
        />
      </Card>
    </div>
  );
};

export default VipCommissionTab;