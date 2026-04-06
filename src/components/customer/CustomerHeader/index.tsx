import React from "react";
import { Avatar, Tag, Breadcrumb, Button } from "antd";
import {
  UserOutlined,
  ReloadOutlined,
  HomeOutlined,
  MailOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CrownOutlined,
} from "@ant-design/icons";
import { Customer, CustomerVip } from "../types/customer.types";
import { getCustomerDisplayName, isVipCustomer } from "../utils/helpers";
import { formatDate, formatTimeAgo } from "../utils/formatters";
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
      <div className="customer-header__breadcrumb">
        <Breadcrumb>
          <Breadcrumb.Item href="/">
            <HomeOutlined /> Admin
          </Breadcrumb.Item>
          <Breadcrumb.Item href="/admin/customers">
            Khách hàng
          </Breadcrumb.Item>
          <Breadcrumb.Item>Chi tiết</Breadcrumb.Item>
        </Breadcrumb>
      </div>

      <div className="customer-header__content">
        <div className="customer-header__left">
          <Avatar
            size={44}
            src={customer.avatar}
            icon={<UserOutlined />}
            className={`customer-header__avatar ${
              isVip ? "customer-header__avatar--vip" : ""
            }`}
          />

          <div className="customer-header__info">
            <div className="customer-header__name-row">
              <h2 className="customer-header__name">{displayName}</h2>
              {isVip && (
                <Tag
                  icon={<CrownOutlined />}
                  color="purple"
                  className="customer-header__vip-tag"
                >
                  VIP {customer.currentVipLevel}
                </Tag>
              )}
            </div>

            <div className="customer-header__meta">
              <span className="customer-header__meta-item">
                <MailOutlined /> {customer.email}
              </span>
              <span className="customer-header__meta-divider">·</span>
              <span className="customer-header__meta-item">
                <CalendarOutlined />{" "}
                {formatDate(customer.createdAt, "DISPLAY_DATE")}
              </span>
              <span className="customer-header__meta-divider">·</span>
              <span className="customer-header__meta-item">
                <ClockCircleOutlined /> {lastLoginText}
              </span>
            </div>
          </div>
        </div>

        <Button
          icon={<ReloadOutlined />}
          onClick={onRefresh}
          className="customer-header__refresh"
        >
          Làm mới
        </Button>
      </div>
    </div>
  );
};

export default CustomerHeader;
