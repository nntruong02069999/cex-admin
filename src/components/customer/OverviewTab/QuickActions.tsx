import React, { useState } from "react";
import {
  Card,
  Input,
  Button,
  Select,
  Switch,
  Divider,
  message,
  Row,
  Col,
  Modal,
} from "antd";
import {
  PlusOutlined,
  MinusOutlined,
  CrownOutlined,
  UserSwitchOutlined,
} from "@ant-design/icons";
import { CustomerDetailData } from "../types/customer.types";
import { useCustomerActions } from "../hooks/useCustomerActions";
import { formatCurrency } from "../utils/formatters";
import { VIP_LEVELS } from "../utils/constants";
import Captcha from "@src/packages/pro-component/schema/Captcha";

const { Option } = Select;
const { TextArea } = Input;

interface QuickActionsProps {
  customerId: number;
  customerData: CustomerDetailData;
  onDataUpdate: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({
  customerId,
  customerData,
  onDataUpdate,
}) => {
  const [balanceAmount, setBalanceAmount] = useState<string>("");
  const [balanceNote, setBalanceNote] = useState<string>("");
  const [newVipLevel, setNewVipLevel] = useState<number>(
    customerData.customer.currentVipLevel
  );
  const [isMarketing, setIsMarketing] = useState<boolean>(
    customerData.customer.isAccountMarketing
  );
  const [newInviterNickname, setNewInviterNickname] = useState<string>("");
  
  // Captcha states
  const [captchaModalVisible, setCaptchaModalVisible] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string>("");
  const [pendingAction, setPendingAction] = useState<{
    type: 'ADD_BALANCE' | 'SUBTRACT_BALANCE' | 'UPDATE_VIP';
    data: any;
  } | null>(null);

  const {
    addBalance,
    subtractBalance,
    updateVipLevel,
    updateMarketingStatus,
    changeInviter,
    loading,
  } = useCustomerActions();

  const handleAddBalance = async () => {
    if (!balanceAmount || parseFloat(balanceAmount) <= 0) {
      message.error("Vui lòng nhập số tiền hợp lệ");
      return;
    }

    setPendingAction({
      type: 'ADD_BALANCE',
      data: { amount: parseFloat(balanceAmount), note: balanceNote }
    });
    setCaptchaModalVisible(true);
  };

  const handleSubtractBalance = async () => {
    if (!balanceAmount || parseFloat(balanceAmount) <= 0) {
      message.error("Vui lòng nhập số tiền hợp lệ");
      return;
    }

    setPendingAction({
      type: 'SUBTRACT_BALANCE',
      data: { amount: parseFloat(balanceAmount), note: balanceNote }
    });
    setCaptchaModalVisible(true);
  };

  const handleUpdateVipLevel = async () => {
    if (newVipLevel === customerData.customer.currentVipLevel) {
      message.warning("Cấp VIP mới giống cấp hiện tại");
      return;
    }

    setPendingAction({
      type: 'UPDATE_VIP',
      data: { newLevel: newVipLevel }
    });
    setCaptchaModalVisible(true);
  };

  const handleUpdateMarketing = async (checked: boolean) => {
    try {
      await updateMarketingStatus(customerId, checked);
      setIsMarketing(checked);
      onDataUpdate();
    } catch (error) {
      setIsMarketing(!checked); // Revert on error
    }
  };

  const handleChangeInviter = async () => {
    if (!newInviterNickname.trim()) {
      message.error("Vui lòng nhập nickname người giới thiệu");
      return;
    }

    try {
      await changeInviter(customerId, newInviterNickname.trim());
      setNewInviterNickname("");
      onDataUpdate();
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleCaptchaConfirm = async () => {
    if (!captchaToken) {
      message.error("Vui lòng nhập mã captcha");
      return;
    }

    if (!pendingAction) {
      return;
    }

    try {
      switch (pendingAction.type) {
        case 'ADD_BALANCE':
          await addBalance(customerId, pendingAction.data.amount, captchaToken, pendingAction.data.note);
          setBalanceAmount("");
          setBalanceNote("");
          break;
        case 'SUBTRACT_BALANCE':
          await subtractBalance(customerId, pendingAction.data.amount, captchaToken, pendingAction.data.note);
          setBalanceAmount("");
          setBalanceNote("");
          break;
        case 'UPDATE_VIP':
          await updateVipLevel(customerId, pendingAction.data.newLevel, captchaToken);
          break;
      }
      
      setCaptchaModalVisible(false);
      setCaptchaToken("");
      setPendingAction(null);
      onDataUpdate();
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleCaptchaCancel = () => {
    setCaptchaModalVisible(false);
    setCaptchaToken("");
    setPendingAction(null);
  };

  return (
    <div className="quick-actions">
      {/* Actions Panel */}
      <Card title="Thao tác Nhanh" className="actions-card">
        {/* Balance Management */}
        <div className="action-section">
          <h4 className="action-title">💰 Quản lý Số dư</h4>

          <Input
            placeholder="Nhập số tiền"
            value={balanceAmount}
            onChange={(e) => setBalanceAmount(e.target.value)}
            style={{ marginBottom: 8 }}
            addonAfter="USD"
            type="number"
            min="0"
            step="0.01"
          />

          <TextArea
            placeholder="Ghi chú (tùy chọn)"
            value={balanceNote}
            onChange={(e) => setBalanceNote(e.target.value)}
            rows={2}
            style={{ marginBottom: 8 }}
            maxLength={200}
          />

          <Row gutter={8}>
            <Col span={12}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                block
                onClick={handleAddBalance}
                loading={loading.addBalance}
                disabled={!balanceAmount || parseFloat(balanceAmount) <= 0}
              >
                Cộng tiền
              </Button>
            </Col>
            <Col span={12}>
              <Button
                danger
                icon={<MinusOutlined />}
                block
                onClick={handleSubtractBalance}
                loading={loading.subtractBalance}
                disabled={!balanceAmount || parseFloat(balanceAmount) <= 0}
              >
                Trừ tiền
              </Button>
            </Col>
          </Row>
        </div>

        <Divider />

        {/* VIP Management */}
        <div className="action-section">
          <h4 className="action-title">👑 Quản lý VIP</h4>

          <div className="current-vip">
            <span>Cấp hiện tại: </span>
            <strong className="vip-level">
              Level {customerData.customerVip?.currentVipLevel}
            </strong>
          </div>

          <Select
            placeholder="Chọn cấp VIP mới"
            value={newVipLevel}
            onChange={setNewVipLevel}
            style={{ width: "100%", margin: "8px 0" }}
          >
            {VIP_LEVELS.map((level) => (
              <Option key={level.value} value={level.value}>
                {level.label}
              </Option>
            ))}
          </Select>

          <Button
            type="primary"
            icon={<CrownOutlined />}
            block
            onClick={handleUpdateVipLevel}
            loading={loading.updateVip}
            disabled={newVipLevel === customerData.customerVip?.currentVipLevel}
          >
            Cập nhật Cấp VIP
          </Button>
        </div>

        <Divider />

        {/* Inviter Management */}
        <div className="action-section">
          <h4 className="action-title">🔗 Quản lý Người giới thiệu</h4>

          <Input
            placeholder="Nhập nickname người giới thiệu mới"
            value={newInviterNickname}
            onChange={(e) => setNewInviterNickname(e.target.value)}
            style={{ marginBottom: 8 }}
            maxLength={50}
          />

          <Button
            type="primary"
            icon={<UserSwitchOutlined />}
            block
            onClick={handleChangeInviter}
            loading={loading.changeInviter}
            disabled={!newInviterNickname.trim()}
          >
            Thay đổi Người giới thiệu
          </Button>
        </div>

        <Divider />

        {/* Marketing Account */}
        <div className="action-section">
          <h4 className="action-title">📢 Tài khoản Marketing</h4>

          <div className="marketing-switch">
            <div className="switch-container">
              <span>Kích hoạt tài khoản marketing:</span>
              <Switch
                checked={isMarketing}
                onChange={handleUpdateMarketing}
                loading={loading.updateMarketing}
                checkedChildren="BẬT"
                unCheckedChildren="TẮT"
              />
            </div>
          </div>

          <div className="marketing-note">
            <small>Bật để gán tài khoản marketing cho khách hàng</small>
          </div>
        </div>
      </Card>

      {/* Quick Stats */}
      <Card title="Thống kê Nhanh" className="stats-card">
        <div className="quick-stats">
          <div className="stat-section">
            <h5 className="stat-section-title">💰 Tài chính</h5>
            <div className="stat-item">
              <span>Balance:</span>
              <strong>
                {formatCurrency(customerData.customerMoney.balance)}
              </strong>
            </div>
            <div className="stat-item">
              <span>USDT:</span>
              <strong>
                {formatCurrency(customerData.customerMoney.balanceUSDT, "USDT")}
              </strong>
            </div>
            <div className="stat-item">
              <span>Frozen:</span>
              <strong className="text-warning">
                {formatCurrency(customerData.customerMoney.frozen)}
              </strong>
            </div>
            <div className="stat-item">
              <span>Demo:</span>
              <strong className="text-info">
                {formatCurrency(customerData.customerMoney.balanceDemo)}
              </strong>
            </div>
          </div>

          <Divider />

          <div className="stat-section">
            <h5 className="stat-section-title">📈 Trading</h5>
            <div className="stat-item">
              <span>Tỷ lệ thắng:</span>
              <strong className="text-success">
                {(
                  (customerData.customerMoney.totalTradeWinCount /
                    Math.max(customerData.customerMoney.totalTradeCount, 1)) *
                  100
                ).toFixed(1)}
                %
              </strong>
            </div>
            <div className="stat-item">
              <span>Tổng lệnh:</span>
              <strong>{customerData.customerMoney.totalTradeCount}</strong>
            </div>
            <div className="stat-item">
              <span>Volume:</span>
              <strong>
                {formatCurrency(customerData.customerMoney.totalTradeAmount)}
              </strong>
            </div>
          </div>

          <Divider />

          <div className="stat-section">
            <h5 className="stat-section-title">🌐 Network</h5>
            <div className="stat-item">
              <span>Tổng thành viên:</span>
              <strong>{customerData.networkSummary.totalMembers}</strong>
            </div>
            <div className="stat-item">
              <span>VIP:</span>
              <strong className="text-vip">
                {customerData.networkSummary.totalVip}
              </strong>
            </div>
            <div className="stat-item">
              <span>Tháng này:</span>
              <strong className="text-success">
                +{customerData.networkSummary.monthlyGrowth}
              </strong>
            </div>
            <div className="stat-item">
              <span>Hoa hồng:</span>
              <strong className="text-success">
                {formatCurrency(customerData.customerMoney.totalCommission)}
              </strong>
            </div>
          </div>
        </div>
      </Card>

      {/* Captcha Modal */}
      <Modal
        title="Xác thực Captcha"
        visible={captchaModalVisible}
        onOk={handleCaptchaConfirm}
        onCancel={handleCaptchaCancel}
        okText="Xác nhận"
        cancelText="Hủy"
        confirmLoading={loading.addBalance || loading.subtractBalance || loading.updateVip}
      >
        <div style={{ marginBottom: 16 }}>
          <p>Vui lòng nhập mã captcha để xác thực thao tác:</p>
          <Captcha onChange={setCaptchaToken} />
        </div>
      </Modal>
    </div>
  );
};

export default QuickActions;
