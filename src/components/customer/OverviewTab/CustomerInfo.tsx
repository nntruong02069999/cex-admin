import React, { useState } from "react";
import {
  Card,
  Row,
  Col,
  Tag,
  Divider,
  Typography,
  Button,
  Modal,
  message,
} from "antd";
import {
  AimOutlined,
  UserSwitchOutlined,
  TeamOutlined,
  CrownOutlined,
  QrcodeOutlined,
  MailOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { Customer, CustomerVip, Inviter } from "../types/customer.types";
import { isVipCustomer } from "../utils/helpers";
import { formatDate } from "../utils/formatters";
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
  customerVip,
  onDataUpdate,
}) => {
  const [twoFAModalVisible, setTwoFAModalVisible] = useState(false);
  const [emailActivationModalVisible, setEmailActivationModalVisible] =
    useState(false);
  const [captchaToken, setCaptchaToken] = useState<string>("");
  const [activatingEmail, setActivatingEmail] = useState(false);

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
      const response = await activeEmailCustomerManual(
        customerId,
        captchaToken
      );
      if ("errorCode" in response) {
        throw new Error(response.message || "Kích hoạt email thất bại");
      } else {
        message.success("Kích hoạt email thành công");
        setEmailActivationModalVisible(false);
        setCaptchaToken("");
        onDataUpdate?.();
      }
    } catch (error: any) {
      message.error(error.message || "Có lỗi xảy ra khi kích hoạt email");
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
      title="Thông tin khách hàng"
      className="overview-section customer-info-card"
      size="small"
    >
      {/* Key Info Grid */}
      <Row gutter={[16, 12]} className="customer-info-grid">
        <Col xs={24} sm={12}>
          <div className="info-item">
            <AimOutlined className="info-item__icon" />
            <div className="info-item__content">
              <Text type="secondary" className="info-item__label">
                Nickname
              </Text>
              <Text strong>{customer.nickname}</Text>
            </div>
          </div>
        </Col>

        <Col xs={24} sm={12}>
          <div className="info-item">
            <AimOutlined className="info-item__icon" />
            <div className="info-item__content">
              <Text type="secondary" className="info-item__label">
                Mã mời
              </Text>
              <Text strong className="invite-code">
                {customer.inviteCode}
              </Text>
            </div>
          </div>
        </Col>

        <Col xs={24} sm={12}>
          <div className="info-item">
            <UserSwitchOutlined className="info-item__icon" />
            <div className="info-item__content">
              <Text type="secondary" className="info-item__label">
                Người mời
              </Text>
              <Text strong>{inviter ? inviter.nickname : "Chưa có"}</Text>
            </div>
          </div>
        </Col>

        <Col xs={24} sm={12}>
          <div className="info-item">
            <CalendarOutlined className="info-item__icon" />
            <div className="info-item__content">
              <Text type="secondary" className="info-item__label">
                Ngày tham gia
              </Text>
              <Text strong>
                {formatDate(customer.createdAt, "DISPLAY_DATE")}
              </Text>
            </div>
          </div>
        </Col>
      </Row>

      {/* Email verification action */}
      {!customer.isVerifyEmail && (
        <>
          <Divider className="info-divider" />
          <div className="email-activation">
            <Tag icon={<MailOutlined />} color="warning">
              Chưa xác thực email
            </Tag>
            <Button
              type="primary"
              size="small"
              icon={<MailOutlined />}
              onClick={handleActivateEmail}
              loading={activatingEmail}
            >
              Kích hoạt Email
            </Button>
          </div>
        </>
      )}

      {/* 2FA View */}
      {customer.twoFASecret && customer.twoFAEnabled && (
        <>
          <Divider className="info-divider" />
          <Button
            type="link"
            icon={<QrcodeOutlined />}
            onClick={() => setTwoFAModalVisible(true)}
            className="twofa-button"
          >
            Xem mã 2FA
          </Button>
        </>
      )}

      {/* Network Stats */}
      <Divider className="info-divider" />
      <Row gutter={16} className="customer-network-stats">
        <Col xs={12} sm={6}>
          <div className="stat-item">
            <div className="stat-item__value">{customer.totalMember}</div>
            <div className="stat-item__label">
              <TeamOutlined /> Thành viên
            </div>
          </div>
        </Col>
        <Col xs={12} sm={6}>
          <div className="stat-item">
            <div className="stat-item__value stat-item__value--vip">
              {customer.totalMemberVip}
            </div>
            <div className="stat-item__label">
              <CrownOutlined /> VIP
            </div>
          </div>
        </Col>
        <Col xs={12} sm={6}>
          <div className="stat-item">
            <div className="stat-item__value stat-item__value--f1">
              {customer.totalMemberVip1}
            </div>
            <div className="stat-item__label">F1 Members</div>
          </div>
        </Col>
        <Col xs={12} sm={6}>
          <div className="stat-item">
            <div className="stat-item__value stat-item__value--level">
              Lv {customerVip?.currentVipLevel || 0}
            </div>
            <div className="stat-item__label">Cấp hiện tại</div>
          </div>
        </Col>
      </Row>

      {/* Modals */}
      {customer.twoFASecret && customer.twoFAEnabled && (
        <TwoFADisplay
          twoFASecret={customer.twoFASecret}
          customerEmail={customer.email}
          visible={twoFAModalVisible}
          onClose={() => setTwoFAModalVisible(false)}
        />
      )}

      <Modal
        title="Kích hoạt Email"
        visible={emailActivationModalVisible}
        onOk={handleCaptchaConfirm}
        onCancel={handleCaptchaCancel}
        okText="Xác nhận"
        cancelText="Hủy"
        confirmLoading={activatingEmail}
      >
        <p>
          Bạn có chắc chắn muốn kích hoạt email cho khách hàng{" "}
          <strong>{customer.email}</strong>?
        </p>
        <p>Vui lòng nhập mã captcha để xác thực:</p>
        <Captcha onChange={setCaptchaToken} />
      </Modal>
    </Card>
  );
};

export default CustomerInfo;
