import React, { useState } from 'react';
import { Row, Col, message, Modal, Input, Form } from 'antd';
import CustomerInfo from './CustomerInfo';
import FinancialOverview from './FinancialOverview';
import NetworkHierarchy from './NetworkHierarchy';
import QuickActions from './QuickActions';
import { CustomerDetailData } from '../types/customer.types';
import './OverviewTab.less';

interface OverviewTabProps {
  customerId: number;
  customerData: CustomerDetailData;
  onDataUpdate: () => void;
}

const OverviewTab: React.FC<OverviewTabProps> = ({
  customerId,
  customerData,
  onDataUpdate
}) => {
  const [isChangeInviterModalVisible, setIsChangeInviterModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleChangeInviter = () => {
    setIsChangeInviterModalVisible(true);
  };

  const handleChangeInviterCancel = () => {
    setIsChangeInviterModalVisible(false);
    form.resetFields();
  };

  const handleChangeInviterSubmit = async () => {
    try {
      const values = await form.validateFields();
      const { nickname } = values;
      
      if (!nickname || nickname.trim() === '') {
        message.error('Vui lòng nhập nickname người mời mới');
        return;
      }

      setLoading(true);
      
      // TODO: Implement API call to change inviter
      // const response = await changeCustomerInviter(customerId, nickname.trim());
      
      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      message.success(`Đã thay đổi người mời thành công cho nickname: ${nickname.trim()}`);
      setIsChangeInviterModalVisible(false);
      form.resetFields();
      
      // Refresh data after successful change
      onDataUpdate();
      
    } catch (error) {
      console.error('Error changing inviter:', error);
      message.error('Có lỗi xảy ra khi thay đổi người mời');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overview-tab">
      <Row gutter={24} className="customer-responsive-grid--2-cols">
        {/* Left Panel - 65% */}
        <Col xs={24} lg={16} className="overview-tab__left-panel">
          <div className="overview-tab__sections">
            {/* Customer Information */}
            <CustomerInfo 
              customer={customerData.customer}
              inviter={customerData.inviter}
              onChangeInviter={handleChangeInviter}
            />

            {/* Financial Overview */}
            <FinancialOverview 
              customerMoney={customerData.customerMoney}
            />

            {/* Network Hierarchy */}
            <NetworkHierarchy 
              hierarchy={customerData.hierarchy}
              networkSummary={customerData.networkSummary}
            />
          </div>
        </Col>

        {/* Right Panel - 35% */}
        <Col xs={24} lg={8} className="overview-tab__right-panel">
          <div className="overview-tab__actions-panel">
            <QuickActions 
              customerId={customerId}
              customerData={customerData}
              onDataUpdate={onDataUpdate}
            />
          </div>
        </Col>
      </Row>

      {/* Change Inviter Modal */}
      <Modal
        title="Thay đổi người mời"
        visible={isChangeInviterModalVisible}
        onOk={handleChangeInviterSubmit}
        onCancel={handleChangeInviterCancel}
        confirmLoading={loading}
        okText="Thay đổi"
        cancelText="Hủy"
        width={400}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: 16 }}
        >
          <Form.Item
            label="Nickname người mời mới"
            name="nickname"
            rules={[
              { required: true, message: 'Vui lòng nhập nickname người mời' },
              { min: 3, message: 'Nickname phải có ít nhất 3 ký tự' },
              { max: 50, message: 'Nickname không được quá 50 ký tự' },
              {
                pattern: /^[a-zA-Z0-9_-]+$/,
                message: 'Nickname chỉ được chứa chữ cái, số, gạch dưới và gạch ngang'
              }
            ]}
          >
            <Input
              placeholder="Nhập nickname người mời mới"
              autoComplete="off"
              maxLength={50}
            />
          </Form.Item>
          
          <div style={{ color: '#666', fontSize: '12px', marginTop: '-8px' }}>
            <strong>Lưu ý:</strong> Việc thay đổi người mời sẽ ảnh hưởng đến cấu trúc mạng lưới và hoa hồng. 
            Vui lòng kiểm tra kỹ trước khi thực hiện.
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default OverviewTab;