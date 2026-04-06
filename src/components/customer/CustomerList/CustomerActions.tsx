import React, { useState } from 'react';
import { Space, Tooltip, Modal, InputNumber, message, Button } from 'antd';
import {
  EyeOutlined,
  PlusCircleOutlined,
  MinusCircleOutlined,
  NotificationOutlined,
} from '@ant-design/icons';
import { useHistory } from 'react-router-dom';
import Captcha from '@src/packages/pro-component/schema/Captcha';
import { adminDeposit, adminWithdraw, toggleMarketingStatus } from '@src/services/customer';
import { CustomerListItem } from './types';

interface CustomerActionsProps {
  customer: CustomerListItem;
  onSuccess: () => void;
}

type ActionType = 'add' | 'subtract' | null;

const CustomerActions: React.FC<CustomerActionsProps> = ({ customer, onSuccess }) => {
  const history = useHistory();
  const [actionType, setActionType] = useState<ActionType>(null);
  const [amount, setAmount] = useState<number | undefined>();
  const [captchaToken, setCaptchaToken] = useState('');
  const [loading, setLoading] = useState(false);

  // Navigate to detail
  const handleViewDetail = () => {
    history.push(`/customer/${customer.id}`);
  };

  // Balance action modal
  const handleBalanceAction = (type: ActionType) => {
    setActionType(type);
    setAmount(undefined);
    setCaptchaToken('');
  };

  const handleBalanceConfirm = async () => {
    if (!amount || amount <= 0) {
      message.error('Vui lòng nhập số tiền hợp lệ');
      return;
    }
    if (!captchaToken) {
      message.error('Vui lòng nhập mã captcha');
      return;
    }

    setLoading(true);
    try {
      const serviceFn = actionType === 'add' ? adminDeposit : adminWithdraw;
      const result = await serviceFn(customer.id, amount, captchaToken);

      if ('errorCode' in result) {
        message.error(result.message || 'Thao tác thất bại');
      } else {
        message.success(
          actionType === 'add'
            ? `Đã cộng ${amount} USDT cho ${customer.nickname || customer.email}`
            : `Đã trừ ${amount} USDT từ ${customer.nickname || customer.email}`
        );
        setActionType(null);
        onSuccess();
      }
    } catch (err: any) {
      message.error(err.message || 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  };

  const handleBalanceCancel = () => {
    setActionType(null);
    setAmount(undefined);
    setCaptchaToken('');
  };

  // Toggle marketing
  const handleToggleMarketing = async () => {
    const newStatus = !customer.isAccountMarketing;
    const action = newStatus ? 'active' : 'deactive';

    try {
      const result = await toggleMarketingStatus(customer.id, action);

      if ('errorCode' in result) {
        message.error(result.message || 'Thao tác thất bại');
      } else {
        message.success(
          `Đã ${newStatus ? 'bật' : 'tắt'} marketing cho ${customer.nickname || customer.email}`
        );
        onSuccess();
      }
    } catch (err: any) {
      message.error(err.message || 'Đã xảy ra lỗi');
    }
  };

  return (
    <>
      <Space size={0} className="customer-list__actions-group">
        <Tooltip title="Xem chi tiết">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={handleViewDetail}
            className="customer-list__action-btn customer-list__action-btn--detail"
          />
        </Tooltip>
        <Tooltip title="Cộng tiền">
          <Button
            type="link"
            size="small"
            icon={<PlusCircleOutlined />}
            onClick={() => handleBalanceAction('add')}
            className="customer-list__action-btn customer-list__action-btn--add"
          />
        </Tooltip>
        <Tooltip title="Trừ tiền">
          <Button
            type="link"
            size="small"
            icon={<MinusCircleOutlined />}
            onClick={() => handleBalanceAction('subtract')}
            className="customer-list__action-btn customer-list__action-btn--subtract"
          />
        </Tooltip>
        <Tooltip title={customer.isAccountMarketing ? 'Tắt Marketing' : 'Bật Marketing'}>
          <Button
            type="link"
            size="small"
            icon={<NotificationOutlined />}
            onClick={handleToggleMarketing}
            className={`customer-list__action-btn customer-list__action-btn--mkt ${
              customer.isAccountMarketing ? 'customer-list__action-btn--active' : ''
            }`}
          />
        </Tooltip>
      </Space>

      {/* Balance Action Modal */}
      <Modal
        title={actionType === 'add' ? 'Cộng tiền' : 'Trừ tiền'}
        visible={actionType !== null}
        onOk={handleBalanceConfirm}
        onCancel={handleBalanceCancel}
        confirmLoading={loading}
        okText="Xác nhận"
        cancelText="Hủy"
        destroyOnClose
      >
        <div className="customer-list__action-modal">
          <p className="customer-list__action-target">
            Khách hàng: <strong>{customer.nickname || customer.email}</strong> (ID: {customer.id})
          </p>

          <div className="customer-list__action-field">
            <label>Số tiền (USDT)</label>
            <InputNumber
              value={amount}
              onChange={(val) => setAmount(val ?? undefined)}
              min={0.01}
              step={1}
              precision={2}
              placeholder="Nhập số tiền"
              style={{ width: '100%' }}
            />
          </div>

          <div className="customer-list__action-field">
            <label>Xác thực Captcha</label>
            <Captcha onChange={setCaptchaToken} />
          </div>
        </div>
      </Modal>
    </>
  );
};

export default CustomerActions;
