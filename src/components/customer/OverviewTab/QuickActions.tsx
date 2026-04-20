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
  Alert,
} from "antd";
import {
  PlusOutlined,
  MinusOutlined,
  CrownOutlined,
  UserSwitchOutlined,
  DollarOutlined,
  LinkOutlined,
  NotificationOutlined,
  MailOutlined,
  QrcodeOutlined,
  SafetyOutlined,
} from "@ant-design/icons";
import { CustomerDetailData } from "../types/customer.types";
import { useCustomerActions } from "../hooks/useCustomerActions";
import { VIP_LEVELS } from "../utils/constants";
import Captcha from "@src/packages/pro-component/schema/Captcha";
import { activeEmailCustomerManual } from "@src/services/customer";
import TwoFADisplay from "../../TwoFADisplay";

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
    customerData.customer.currentVipLevel,
  );
  const [isMarketing, setIsMarketing] = useState<boolean>(
    customerData.customer.isAccountMarketing,
  );
  const [newInviterNickname, setNewInviterNickname] = useState<string>("");

  // Captcha states
  const [captchaModalVisible, setCaptchaModalVisible] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string>("");
  const [pendingAction, setPendingAction] = useState<{
    type: "ADD_BALANCE" | "SUBTRACT_BALANCE" | "UPDATE_VIP";
    data: any;
  } | null>(null);

  // Email activation states
  const [emailActivationModalVisible, setEmailActivationModalVisible] =
    useState(false);
  const [emailCaptchaToken, setEmailCaptchaToken] = useState<string>("");
  const [activatingEmail, setActivatingEmail] = useState(false);

  // 2FA modal state
  const [twoFAModalVisible, setTwoFAModalVisible] = useState(false);

  const canViewTwoFA =
    !!customerData.customer.twoFAEnabled &&
    !!customerData.customer.twoFASecret;

  const {
    addBalance,
    subtractBalance,
    updateVipLevel,
    updateMarketingStatus,
    changeInviter,
    loading,
  } = useCustomerActions();

  // Email activation handlers
  const handleActivateEmail = () => {
    setEmailActivationModalVisible(true);
  };

  const handleEmailCaptchaConfirm = async () => {
    if (!emailCaptchaToken) {
      message.error("Vui lòng nhập mã captcha");
      return;
    }

    setActivatingEmail(true);
    try {
      const response = await activeEmailCustomerManual(
        customerId,
        emailCaptchaToken,
      );
      if ("errorCode" in response) {
        throw new Error(response.message || "Kích hoạt email thất bại");
      } else {
        message.success("Kích hoạt email thành công");
        setEmailActivationModalVisible(false);
        setEmailCaptchaToken("");
        onDataUpdate();
      }
    } catch (error: any) {
      message.error(error.message || "Có lỗi xảy ra khi kích hoạt email");
    } finally {
      setActivatingEmail(false);
    }
  };

  const handleEmailCaptchaCancel = () => {
    setEmailActivationModalVisible(false);
    setEmailCaptchaToken("");
  };

  const handleAddBalance = () => {
    if (!balanceAmount || parseFloat(balanceAmount) <= 0) {
      message.error("Vui lòng nhập số tiền hợp lệ");
      return;
    }
    setPendingAction({
      type: "ADD_BALANCE",
      data: { amount: parseFloat(balanceAmount), note: balanceNote },
    });
    setCaptchaModalVisible(true);
  };

  const handleSubtractBalance = () => {
    if (!balanceAmount || parseFloat(balanceAmount) <= 0) {
      message.error("Vui lòng nhập số tiền hợp lệ");
      return;
    }
    setPendingAction({
      type: "SUBTRACT_BALANCE",
      data: { amount: parseFloat(balanceAmount), note: balanceNote },
    });
    setCaptchaModalVisible(true);
  };

  const handleUpdateVipLevel = () => {
    if (newVipLevel === customerData.customer.currentVipLevel) {
      message.warning("Cấp VIP mới giống cấp hiện tại");
      return;
    }
    setPendingAction({
      type: "UPDATE_VIP",
      data: { newLevel: newVipLevel },
    });
    setCaptchaModalVisible(true);
  };

  const handleUpdateMarketing = async (checked: boolean) => {
    try {
      await updateMarketingStatus(customerId, checked);
      setIsMarketing(checked);
      onDataUpdate();
    } catch (error) {
      setIsMarketing(!checked);
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
    if (!pendingAction) return;

    try {
      switch (pendingAction.type) {
        case "ADD_BALANCE":
          await addBalance(
            customerId,
            pendingAction.data.amount,
            captchaToken,
            pendingAction.data.note,
          );
          setBalanceAmount("");
          setBalanceNote("");
          break;
        case "SUBTRACT_BALANCE":
          await subtractBalance(
            customerId,
            pendingAction.data.amount,
            captchaToken,
            pendingAction.data.note,
          );
          setBalanceAmount("");
          setBalanceNote("");
          break;
        case "UPDATE_VIP":
          await updateVipLevel(
            customerId,
            pendingAction.data.newLevel,
            captchaToken,
          );
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

  const emailNotVerified = !customerData.customer.isVerifyEmail;

  return (
    <div className="quick-actions">
      <Card title="Thao tác nhanh" size="small" className="quick-actions__card">
        {/* Email Activation — top, prominent */}
        {emailNotVerified && (
          <>
            <div className="quick-actions__section">
              <Alert
                message="Email chưa xác thực"
                description={
                  <div style={{ marginTop: 8 }}>
                    <div style={{ marginBottom: 8, fontSize: 12 }}>
                      {customerData.customer.email}
                    </div>
                    <Button
                      type="primary"
                      icon={<MailOutlined />}
                      block
                      size="small"
                      onClick={handleActivateEmail}
                      loading={activatingEmail}
                    >
                      Kích hoạt Email
                    </Button>
                  </div>
                }
                type="warning"
                showIcon
              />
            </div>
            <Divider className="quick-actions__divider" />
          </>
        )}

        {/* Security - 2FA */}
        {canViewTwoFA && (
          <>
            <div className="quick-actions__section">
              <h4 className="quick-actions__section-title">
                <SafetyOutlined /> Bảo mật
              </h4>
              <Button
                icon={<QrcodeOutlined />}
                block
                size="small"
                onClick={() => setTwoFAModalVisible(true)}
              >
                Xem mã 2FA
              </Button>
            </div>
            <Divider className="quick-actions__divider" />
          </>
        )}

        {/* Balance Management */}
        <div className="quick-actions__section">
          <h4 className="quick-actions__section-title">
            <DollarOutlined /> Quản lý số dư
          </h4>

          <Input
            placeholder="Nhập số tiền"
            value={balanceAmount}
            onChange={(e) => setBalanceAmount(e.target.value)}
            addonAfter="USD"
            type="number"
            min="0"
            step="0.01"
            className="quick-actions__input"
          />

          <TextArea
            placeholder="Ghi chú (tùy chọn)"
            value={balanceNote}
            onChange={(e) => setBalanceNote(e.target.value)}
            rows={2}
            maxLength={200}
            className="quick-actions__input"
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
                size="small"
              >
                Cộng
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
                size="small"
              >
                Trừ
              </Button>
            </Col>
          </Row>
        </div>

        <Divider className="quick-actions__divider" />

        {/* VIP Management */}
        <div className="quick-actions__section">
          <h4 className="quick-actions__section-title">
            <CrownOutlined /> Quản lý VIP
          </h4>

          <div className="quick-actions__current">
            <span>Cấp hiện tại:</span>
            <strong>Level {customerData.customerVip?.currentVipLevel}</strong>
          </div>

          <Select
            placeholder="Chọn cấp VIP mới"
            value={newVipLevel}
            onChange={setNewVipLevel}
            className="quick-actions__select"
            size="small"
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
            size="small"
            onClick={handleUpdateVipLevel}
            loading={loading.updateVip}
            disabled={newVipLevel === customerData.customerVip?.currentVipLevel}
          >
            Cập nhật VIP
          </Button>
        </div>

        <Divider className="quick-actions__divider" />

        {/* Inviter Management */}
        <div className="quick-actions__section">
          <h4 className="quick-actions__section-title">
            <LinkOutlined /> Người giới thiệu
          </h4>

          <Input
            placeholder="Nhập nickname mới"
            value={newInviterNickname}
            onChange={(e) => setNewInviterNickname(e.target.value)}
            maxLength={50}
            size="small"
            className="quick-actions__input"
          />

          <Button
            type="primary"
            icon={<UserSwitchOutlined />}
            block
            size="small"
            onClick={handleChangeInviter}
            loading={loading.changeInviter}
            disabled={!newInviterNickname.trim()}
          >
            Thay đổi
          </Button>
        </div>

        <Divider className="quick-actions__divider" />

        {/* Marketing Account */}
        <div className="quick-actions__section">
          <h4 className="quick-actions__section-title">
            <NotificationOutlined /> Marketing
          </h4>

          <div className="quick-actions__switch-row">
            <span>Tài khoản marketing</span>
            <Switch
              checked={isMarketing}
              onChange={handleUpdateMarketing}
              loading={loading.updateMarketing}
              checkedChildren="ON"
              unCheckedChildren="OFF"
              size="small"
            />
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
        confirmLoading={
          loading.addBalance || loading.subtractBalance || loading.updateVip
        }
      >
        <p>Vui lòng nhập mã captcha để xác thực thao tác:</p>
        <Captcha onChange={setCaptchaToken} />
      </Modal>

      {/* Email Activation Modal */}
      <Modal
        title="Kích hoạt Email"
        visible={emailActivationModalVisible}
        onOk={handleEmailCaptchaConfirm}
        onCancel={handleEmailCaptchaCancel}
        okText="Xác nhận"
        cancelText="Hủy"
        confirmLoading={activatingEmail}
      >
        <p>
          Bạn có chắc chắn muốn kích hoạt email cho khách hàng{" "}
          <strong>{customerData.customer.email}</strong>?
        </p>
        <p>Vui lòng nhập mã captcha để xác thực:</p>
        <Captcha onChange={setEmailCaptchaToken} />
      </Modal>

      {/* 2FA Display Modal */}
      {canViewTwoFA && (
        <TwoFADisplay
          twoFASecret={customerData.customer.twoFASecret}
          customerEmail={customerData.customer.email}
          visible={twoFAModalVisible}
          onClose={() => setTwoFAModalVisible(false)}
        />
      )}
    </div>
  );
};

export default QuickActions;
