import React, { useState } from "react";
import { Card, Row, Col, Avatar, Tag, Divider, Typography, Button, Modal, message } from "antd";
import { UserOutlined, EditOutlined, QrcodeOutlined, MailOutlined } from "@ant-design/icons";
import { Customer, CustomerVip, Inviter } from "../types/customer.types";
import { getCustomerDisplayName, isVipCustomer } from "../utils/helpers";
import { formatDate } from "../utils/formatters";
import { STATUS_ICONS } from "../utils/constants";
import TwoFADisplay from "../../TwoFADisplay";
import Captcha from "@src/packages/pro-component/schema/Captcha";
import { activeEmailCustomerManual } from "@src/services/customer";

const { Text } = Typography;

interface CustomerInfoProps {
  customerId: number;
  customer: Customer;
  inviter?: Inviter;
  onChangeInviter?: () => void;
  customerVip?: CustomerVip;
  onDataUpdate?: () => void;
}

const CustomerInfo: React.FC<CustomerInfoProps> = ({
  customerId,
  customer,
  inviter,
  onChangeInviter,
  customerVip,
  onDataUpdate,
}) => {
  const [twoFAModalVisible, setTwoFAModalVisible] = useState(false);
  const [emailActivationModalVisible, setEmailActivationModalVisible] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string>("");
  const [activatingEmail, setActivatingEmail] = useState(false);
  
  const displayName = getCustomerDisplayName(customer);
  const isVip = isVipCustomer(
    customerVip || ({ currentVipLevel: 0 } as CustomerVip)
  );

  const handleActivateEmail = () => {
    setEmailActivationModalVisible(true);
  };

  const handleCaptchaConfirm = async () => {
    if (!captchaToken) {
      message.error("Vui lòng nhập mã captcha");
      return;
    }

    setActivatingEmail(true);

    try {
      const response = await activeEmailCustomerManual(customerId, captchaToken);

      if ('errorCode' in response) {
        throw new Error(response.message || 'Kích hoạt email thất bại');
      } else {
        message.success('Kích hoạt email thành công');
        setEmailActivationModalVisible(false);
        setCaptchaToken("");
        onDataUpdate?.();
      }
    } catch (error: any) {
      message.error(error.message || 'Có lỗi xảy ra khi kích hoạt email');
    } finally {
      setActivatingEmail(false);
    }
  };

  const handleCaptchaCancel = () => {
    setEmailActivationModalVisible(false);
    setCaptchaToken("");
  };

  return (
    <Card
      title="Thông tin Khách hàng"
      className="overview-section customer-info-card"
      extra={<EditOutlined className="edit-icon" title="Chỉnh sửa thông tin" />}
    >
      <Row gutter={16} align="top">
        <Col>
          <Avatar
            size={80}
            src={customer.avatar}
            icon={<UserOutlined />}
            className={`customer-avatar ${isVip ? "customer-avatar--vip" : ""}`}
          />
        </Col>

        <Col flex="auto">
          <div className="customer-basic-info">
            <h3 className="customer-name">
              {displayName}
              {isVip && (
                <Tag color="purple" className="customer-vip-tag">
                  {STATUS_ICONS.VIP} VIP Level {customerVip?.currentVipLevel}
                </Tag>
              )}
            </h3>

            <div className="customer-nickname">
              <Text type="secondary">🎯 {customer.nickname}</Text>
            </div>

            <div className="customer-email">
              <Text>
                {STATUS_ICONS.EMAIL} {customer.email}
              </Text>
              {customer.isVerifyEmail ? (
                <Tag color="green" className="verification-tag">
                  {STATUS_ICONS.SUCCESS} Đã xác thực{" "}
                  {formatDate(customer.createdAt, "DISPLAY_DATE")}
                </Tag>
              ) : (
                <div style={{ marginTop: "8px" }}>
                  <Tag color="orange" className="verification-tag">
                    ⚠️ Chưa xác thực email
                  </Tag>
                  <Button
                    type="primary"
                    size="small"
                    icon={<MailOutlined />}
                    onClick={handleActivateEmail}
                    loading={activatingEmail}
                    style={{ marginLeft: "8px" }}
                  >
                    Kích hoạt Email
                  </Button>
                </div>
              )}
            </div>

            {customer.twoFASecret && customer.twoFAEnabled && (
              <div style={{ marginTop: "8px" }}>
                <Button
                  type="link"
                  icon={<QrcodeOutlined />}
                  onClick={() => setTwoFAModalVisible(true)}
                  style={{ padding: "0" }}
                >
                  Xem mã 2FA
                </Button>
              </div>
            )}

            <div className="customer-dates">
              <Text type="secondary">
                📅 Tham gia:{" "}
                <strong>
                  {formatDate(customer.createdAt, "DISPLAY_DATE")}
                </strong>
              </Text>
              {customer.userLoginDate && (
                <>
                  <span className="date-separator">•</span>
                  <Text type="secondary">
                    🕐 Lần đăng nhập cuối:{" "}
                    <strong>
                      {formatDate(customer.userLoginDate, "DISPLAY")}
                    </strong>
                  </Text>
                </>
              )}
            </div>
          </div>
        </Col>
      </Row>

      <Divider />

      <Row gutter={16} className="customer-additional-info">
        <Col xs={24} sm={12}>
          <div className="info-item">
            <Text type="secondary">🎯 Mã mời:</Text>
            <Text strong className="invite-code">
              {customer.inviteCode}
            </Text>
          </div>
        </Col>

        <Col xs={24} sm={12}>
          <div className="info-item">
            <Text type="secondary">👤 Người mời:</Text>
            <div className="inviter-section">
              <Text strong>{inviter ? inviter.nickname : "Chưa có"}</Text>
            </div>
          </div>
        </Col>
      </Row>

      {/* Network Stats */}
      <Divider />

      <Row gutter={16} className="customer-network-stats">
        <Col xs={12} sm={6}>
          <div className="stat-item">
            <div className="stat-value">{customer.totalMember}</div>
            <div className="stat-label">Tổng thành viên</div>
          </div>
        </Col>

        <Col xs={12} sm={6}>
          <div className="stat-item">
            <div className="stat-value vip-value">
              {customer.totalMemberVip}
            </div>
            <div className="stat-label">VIP Members</div>
          </div>
        </Col>

        <Col xs={12} sm={6}>
          <div className="stat-item">
            <div className="stat-value f1-value">
              {customer.totalMemberVip1}
            </div>
            <div className="stat-label">F1 Members</div>
          </div>
        </Col>

        <Col xs={12} sm={6}>
          <div className="stat-item">
            <div className="stat-value level-value">
              Level {customerVip?.currentVipLevel}
            </div>
            <div className="stat-label">Cấp hiện tại</div>
          </div>
        </Col>
      </Row>

      {customer.twoFASecret && customer.twoFAEnabled && (
        <TwoFADisplay
          twoFASecret={customer.twoFASecret}
          customerEmail={customer.email}
          visible={twoFAModalVisible}
          onClose={() => setTwoFAModalVisible(false)}
        />
      )}

      {/* Email Activation Modal */}
      <Modal
        title="Kích hoạt Email"
        visible={emailActivationModalVisible}
        onOk={handleCaptchaConfirm}
        onCancel={handleCaptchaCancel}
        okText="Xác nhận"
        cancelText="Hủy"
        confirmLoading={activatingEmail}
      >
        <div style={{ marginBottom: 16 }}>
          <p>
            Bạn có chắc chắn muốn kích hoạt email cho khách hàng{" "}
            <strong>{customer.email}</strong>?
          </p>
          <p>Vui lòng nhập mã captcha để xác thực:</p>
          <Captcha onChange={setCaptchaToken} />
        </div>
      </Modal>
    </Card>
  );
};

export default CustomerInfo;
