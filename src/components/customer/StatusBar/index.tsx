import React from "react";
import { Tag } from "antd";
import {
  CheckCircleOutlined,
  StopOutlined,
  SafetyCertificateOutlined,
  LockOutlined,
  MailOutlined,
  NotificationOutlined,
} from "@ant-design/icons";
import { Customer } from "../types/customer.types";
import "./StatusBar.less";

interface StatusBarProps {
  customer: Customer;
}

const StatusBar: React.FC<StatusBarProps> = ({ customer }) => {
  return (
    <div className="status-bar">
      <Tag
        icon={customer.isBlocked ? <StopOutlined /> : <CheckCircleOutlined />}
        color={customer.isBlocked ? "error" : "success"}
      >
        {customer.isBlocked ? "Bị khóa" : "Hoạt động"}
      </Tag>

      <Tag
        icon={<SafetyCertificateOutlined />}
        color={
          customer.statusDocument === "approved"
            ? "success"
            : customer.statusDocument === "pending"
            ? "warning"
            : customer.statusDocument === "rejected"
            ? "error"
            : "default"
        }
      >
        KYC: {customer.statusDocument?.toUpperCase() || "NOT_SUBMIT"}
      </Tag>

      <Tag
        icon={<LockOutlined />}
        color={customer.twoFAEnabled ? "processing" : "default"}
      >
        2FA: {customer.twoFAEnabled ? "Bật" : "Tắt"}
      </Tag>

      <Tag
        icon={<MailOutlined />}
        color={customer.isVerifyEmail ? "success" : "warning"}
      >
        Email: {customer.isVerifyEmail ? "Đã xác thực" : "Chưa xác thực"}
      </Tag>

      <Tag
        icon={<NotificationOutlined />}
        color={customer.isAccountMarketing ? "orange" : "default"}
      >
        Marketing: {customer.isAccountMarketing ? "Bật" : "Tắt"}
      </Tag>
    </div>
  );
};

export default StatusBar;
