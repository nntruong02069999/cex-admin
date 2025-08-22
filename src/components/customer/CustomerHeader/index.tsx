import React from "react";
import { Row, Col, Avatar, Tag, Button, Breadcrumb } from "antd";
import { UserOutlined, ReloadOutlined, HomeOutlined } from "@ant-design/icons";
import { Customer, CustomerVip } from "../types/customer.types";
import {
  getStatusColor,
  getCustomerDisplayName,
  isVipCustomer,
} from "../utils/helpers";
import { formatDate, formatTimeAgo } from "../utils/formatters";
import { STATUS_ICONS } from "../utils/constants";
import "./CustomerHeader.less";

interface CustomerHeaderProps {
  customer?: Customer;
  customerVip?: CustomerVip;
  onRefresh: () => void;
}

const CustomerHeader: React.FC<CustomerHeaderProps> = ({
  customer,
  customerVip,
  onRefresh,
}) => {
  if (!customer) return null;

  const displayName = getCustomerDisplayName(customer);
  const isVip = isVipCustomer(
    customerVip || ({ currentVipLevel: 0 } as CustomerVip)
  );
  const lastLoginText = customer.userLoginDate
    ? formatTimeAgo(customer.userLoginDate)
    : "Chưa đăng nhập";

  return (
    <div className="customer-header">
      {/* Breadcrumb */}
      <div className="customer-header__breadcrumb">
        <Breadcrumb>
          <Breadcrumb.Item href="/">
            <HomeOutlined /> Admin
          </Breadcrumb.Item>
          <Breadcrumb.Item href="/admin/customers">Khách hàng</Breadcrumb.Item>
          <Breadcrumb.Item>Chi tiết khách hàng</Breadcrumb.Item>
        </Breadcrumb>
      </div>

      {/* Main header content */}
      <Row
        justify="space-between"
        align="middle"
        className="customer-header__main"
      >
        <Col flex="auto">
          <div className="customer-header__info">
            <div className="customer-header__avatar-section">
              <Avatar
                size={64}
                src={customer.avatar}
                icon={<UserOutlined />}
                className={`customer-header__avatar ${
                  isVip ? "customer-header__avatar--vip" : ""
                }`}
              />

              <div className="customer-header__details">
                <div className="customer-header__name">
                  <span className="name-text">{displayName}</span>
                  {isVip && (
                    <Tag color="purple" className="customer-vip__badge">
                      {STATUS_ICONS.VIP} VIP Level {customer.currentVipLevel}
                    </Tag>
                  )}
                </div>

                <div className="customer-header__nickname">
                  🎯 {customer.nickname}
                </div>

                <div className="customer-header__email">
                  <span>
                    {STATUS_ICONS.EMAIL} {customer.email}
                  </span>
                  {customer.isVerifyEmail && (
                    <Tag color="green">{STATUS_ICONS.APPROVED} Đã xác thực</Tag>
                  )}
                </div>

                <div className="customer-header__meta">
                  <span>
                    📅 Tham gia:{" "}
                    {formatDate(customer.createdAt, "DISPLAY_DATE")}
                  </span>
                  <span className="separator">•</span>
                  <span>🕐 Hoạt động cuối: {lastLoginText}</span>
                </div>
              </div>
            </div>
          </div>
        </Col>

        <Col>
          <div className="customer-header__actions">
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={onRefresh}
              className="customer-header__refresh-btn"
            >
              Làm mới
            </Button>
          </div>
        </Col>
      </Row>

      {/* Status row */}
      <Row gutter={[16, 8]} className="customer-header__status">
        <Col>
          <Tag
            color={customer.isBlocked ? "red" : "green"}
            className="status-tag"
          >
            {customer.isBlocked ? STATUS_ICONS.BLOCKED : STATUS_ICONS.ACTIVE}
            {customer.isBlocked ? "Bị khóa" : "Hoạt động"}
          </Tag>
        </Col>

        <Col>
          <Tag
            color={getStatusColor(customer.statusDocument || "not_submit")}
            className="status-tag"
          >
            {STATUS_ICONS.DOCUMENT} KYC:{" "}
            {customer.statusDocument?.toUpperCase()}
          </Tag>
        </Col>

        <Col>
          <Tag
            color={customer.twoFAEnabled ? "blue" : "default"}
            className="status-tag"
          >
            {STATUS_ICONS.SECURITY} 2FA: {customer.twoFAEnabled ? "Bật" : "Tắt"}
          </Tag>
        </Col>

        <Col>
          <Tag
            color={customer.isAccountMarketing ? "orange" : "default"}
            className="status-tag"
          >
            {STATUS_ICONS.MARKETING} Marketing:{" "}
            {customer.isAccountMarketing ? "Bật" : "Tắt"}
          </Tag>
        </Col>

        {/* Additional info for larger screens */}
        <Col className="customer-header__extra-info">
          <Tag color="cyan" className="status-tag">
            👥 {customer.totalMember} thành viên
          </Tag>
        </Col>

        <Col className="customer-header__extra-info">
          <Tag color="purple" className="status-tag">
            👑 {customer.totalMemberVip} VIP
          </Tag>
        </Col>
      </Row>
    </div>
  );
};

export default CustomerHeader;
