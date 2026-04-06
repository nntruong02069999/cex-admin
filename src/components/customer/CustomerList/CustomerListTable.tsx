import React, { useState } from "react";
import { Table, Tag, Avatar, Typography, Tooltip, message } from "antd";
import {
  UserOutlined,
  CopyOutlined,
  SafetyCertificateOutlined,
  MailOutlined,
  NotificationOutlined,
  CrownOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useHistory } from "react-router-dom";
import { CustomerListItem, ColumnConfig } from "./types";
import { STATUS_COLORS, STATUS_TEXT, VIP_LEVELS } from "../utils/constants";
import {
  formatCurrency,
  formatDate,
  formatVipLevel,
} from "../utils/formatters";
import CustomerActions from "./CustomerActions";

const { Text } = Typography;

interface CustomerListTableProps {
  data: CustomerListItem[];
  loading: boolean;
  columns: ColumnConfig[];
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize?: number) => void;
  };
  onRefresh: () => void;
}

// --- Password Cell with show/hide toggle ---
const PasswordCell: React.FC<{
  password: string;
  onCopy: (text: string, label: string) => void;
}> = ({ password, onCopy }) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className="customer-list__password-cell">
      <Text type="secondary" className="customer-list__password-text">
        {visible ? password : "••••••••"}
      </Text>
      <Tooltip title={visible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}>
        {visible ? (
          <EyeOutlined
            className="customer-list__copy-icon"
            onClick={() => setVisible(false)}
          />
        ) : (
          <EyeInvisibleOutlined
            className="customer-list__copy-icon"
            onClick={() => setVisible(true)}
          />
        )}
      </Tooltip>
      <Tooltip title="Sao chép mật khẩu">
        <CopyOutlined
          className="customer-list__copy-icon"
          onClick={() => onCopy(password, "mật khẩu")}
        />
      </Tooltip>
    </div>
  );
};

const CustomerListTable: React.FC<CustomerListTableProps> = ({
  data,
  loading,
  columns,
  pagination,
  onRefresh,
}) => {
  const history = useHistory();

  // Copy to clipboard helper
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      message.success(`Đã sao chép ${label}`);
    });
  };

  // Build visible column keys set
  const visibleKeys = new Set(
    columns.filter((c) => c.visible).map((c) => c.key),
  );

  // All column definitions
  const allColumns: any[] = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 70,
      sorter: true,
    },
    {
      title: "User",
      key: "user",
      width: 220,
      render: (_: any, record: CustomerListItem) => (
        <div className="customer-list__user-cell">
          <Avatar
            size={32}
            src={record.avatar}
            icon={<UserOutlined />}
            className="customer-list__user-avatar"
          />
          <div className="customer-list__user-info">
            <a
              onClick={() => history.push(`/customer/${record.id}`)}
              className="customer-list__user-name-link"
            >
              {record.nickname || "—"}
            </a>
            <Text type="secondary" className="customer-list__user-email">
              {record.email}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "Password",
      key: "password",
      width: 160,
      render: (_: any, record: CustomerListItem) => (
        <PasswordCell password={record.password} onCopy={handleCopy} />
      ),
    },
    {
      title: "Email ✓",
      key: "isVerifyEmail",
      width: 110,
      render: (_: any, record: CustomerListItem) => (
        <Tag
          icon={<MailOutlined />}
          color={record.isVerifyEmail ? "success" : "warning"}
        >
          {record.isVerifyEmail ? "Đã xác thực" : "Chưa"}
        </Tag>
      ),
    },
    {
      title: "KYC",
      key: "statusDocument",
      width: 110,
      render: (_: any, record: CustomerListItem) => {
        const status = record.statusDocument || "not_submit";
        return (
          <Tag
            icon={<SafetyCertificateOutlined />}
            color={(STATUS_COLORS as any)[status] || "default"}
          >
            {(STATUS_TEXT as any)[status] || status.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: "MKT",
      key: "isAccountMarketing",
      width: 90,
      render: (_: any, record: CustomerListItem) => (
        <Tag
          icon={<NotificationOutlined />}
          color={record.isAccountMarketing ? "orange" : "default"}
        >
          {record.isAccountMarketing ? "Bật" : "Tắt"}
        </Tag>
      ),
    },
    {
      title: "VIP",
      key: "vipLevel",
      width: 80,
      render: (_: any, record: CustomerListItem) => {
        const level = record.vipLevel || 0;
        const vipConfig = VIP_LEVELS[level] || VIP_LEVELS[0];
        return (
          <Tag
            icon={level > 0 ? <CrownOutlined /> : undefined}
            color={vipConfig.color}
          >
            {formatVipLevel(level)}
          </Tag>
        );
      },
    },
    {
      title: "Balance",
      key: "balance",
      width: 120,
      align: "right" as const,
      render: (_: any, record: CustomerListItem) => (
        <Text>{formatCurrency(record.money?.balance || 0, "USDT")}</Text>
      ),
    },
    {
      title: "Total Deposit",
      key: "totalDeposit",
      width: 130,
      align: "right" as const,
      render: (_: any, record: CustomerListItem) => (
        <Text>{formatCurrency(record.money?.totalDeposit || 0, "USDT")}</Text>
      ),
    },
    {
      title: "Inviter",
      key: "inviterInfo",
      width: 150,
      render: (_: any, record: CustomerListItem) => {
        if (!record.inviterInfo) {
          return <Text type="secondary">—</Text>;
        }
        return (
          <Tooltip title={record.inviterInfo.email}>
            <a
              onClick={(e) => {
                e.stopPropagation();
                history.push(`/customer/${record.inviterInfo!.id}`);
              }}
              className="customer-list__inviter-link"
            >
              {record.inviterInfo.nickname || record.inviterInfo.email}
            </a>
          </Tooltip>
        );
      },
    },
    {
      title: "Ngày tạo",
      key: "createdAt",
      width: 120,
      render: (_: any, record: CustomerListItem) => (
        <Text type="secondary">
          {record.createdAt
            ? formatDate(record.createdAt, "DISPLAY_DATE")
            : "—"}
        </Text>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 100,
      fixed: "right" as const,
      render: (_: any, record: CustomerListItem) => (
        <CustomerActions customer={record} onSuccess={onRefresh} />
      ),
    },
    // Optional columns
    {
      title: "UUID",
      key: "uuid",
      width: 180,
      render: (_: any, record: CustomerListItem) => (
        <Tooltip title={record.uuid}>
          <Text copyable className="customer-list__uuid">
            {record.uuid ? `${record.uuid.substring(0, 8)}...` : "—"}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: "Last Login",
      key: "userLoginDate",
      width: 120,
      render: (_: any, record: CustomerListItem) => (
        <Text type="secondary">
          {record.userLoginDate
            ? formatDate(record.userLoginDate, "DISPLAY_DATE")
            : "—"}
        </Text>
      ),
    },
    {
      title: "Total Withdraw",
      key: "totalWithdraw",
      width: 130,
      align: "right" as const,
      render: (_: any, record: CustomerListItem) => (
        <Text>{formatCurrency(record.money?.totalWithdraw || 0, "USDT")}</Text>
      ),
    },
    {
      title: "Total Trade",
      key: "totalTradeAmount",
      width: 130,
      align: "right" as const,
      render: (_: any, record: CustomerListItem) => (
        <Text>
          {formatCurrency(record.money?.totalTradeAmount || 0, "USDT")}
        </Text>
      ),
    },
    {
      title: "Họ tên",
      key: "fullName",
      width: 150,
      render: (_: any, record: CustomerListItem) => {
        const name = [record.firstName, record.lastName]
          .filter(Boolean)
          .join(" ");
        return <Text>{name || "—"}</Text>;
      },
    },
  ];

  // Filter to only visible columns
  const visibleColumns = allColumns.filter((col) => visibleKeys.has(col.key));

  return (
    <Table
      dataSource={data}
      columns={visibleColumns}
      rowKey="id"
      loading={loading}
      scroll={{ x: "max-content" }}
      size="middle"
      pagination={{
        ...pagination,
        showSizeChanger: true,
        showQuickJumper: true,
        pageSizeOptions: ["10", "20", "50", "100"],
        showTotal: (total: number, range: [number, number]) =>
          `${range[0]}-${range[1]} của ${total} khách hàng`,
      }}
      onRow={() => ({
        className: "customer-list__table-row",
      })}
      className="customer-list__table"
    />
  );
};

export default CustomerListTable;
