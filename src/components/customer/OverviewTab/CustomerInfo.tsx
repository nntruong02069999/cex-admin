import React from "react";
import { Card, Row, Col, Avatar, Tag, Divider, Typography, Button } from "antd";
import { UserOutlined, EditOutlined, SwapOutlined } from "@ant-design/icons";
import { Customer, Inviter } from "../types/customer.types";
import { getCustomerDisplayName, isVipCustomer } from "../utils/helpers";
import { formatDate } from "../utils/formatters";
import { STATUS_ICONS } from "../utils/constants";

const { Text } = Typography;

interface CustomerInfoProps {
  customer: Customer;
  inviter?: Inviter;
  onChangeInviter?: () => void;
}

const CustomerInfo: React.FC<CustomerInfoProps> = ({
  customer,
  inviter,
  onChangeInviter,
}) => {
  const displayName = getCustomerDisplayName(customer);
  const isVip = isVipCustomer(customer);

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
                  {STATUS_ICONS.VIP} VIP Level {customer.currentVipLevel}
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
              {customer.isVerifyEmail && (
                <Tag color="green" className="verification-tag">
                  {STATUS_ICONS.SUCCESS} Đã xác thực{" "}
                  {formatDate(customer.createdAt, "DISPLAY_DATE")}
                </Tag>
              )}
            </div>

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
              <Text strong>{inviter ? inviter.email : "Chưa có"}</Text>
              <Button
                type="link"
                size="small"
                icon={<SwapOutlined />}
                onClick={onChangeInviter}
                className="change-inviter-btn"
                title="Thay đổi người mời"
              >
                Thay đổi
              </Button>
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
              Level {customer.currentVipLevel}
            </div>
            <div className="stat-label">Cấp hiện tại</div>
          </div>
        </Col>
      </Row>
    </Card>
  );
};

export default CustomerInfo;
