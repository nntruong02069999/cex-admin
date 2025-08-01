import React from "react";
import { Table, Tag, Button, Space, Progress, Typography, Avatar } from "antd";
import {
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
  UserOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { InvitationRecord, InvitationStatusEnum } from "./types";
import { ColumnsType } from "antd/es/table";

interface InvitationTableProps {
  data: InvitationRecord[];
  total: number;
  loading?: boolean;
  pagination: {
    current: number;
    pageSize: number;
  };
  onPaginationChange: (page: number, pageSize?: number) => void;
  onAction: (
    record: InvitationRecord,
    action: "approve" | "reject" | "view"
  ) => void;
}

const { Text } = Typography;

const InvitationTable: React.FC<InvitationTableProps> = ({
  data,
  total,
  loading = false,
  pagination,
  onPaginationChange,
  onAction,
}) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case InvitationStatusEnum.PENDING:
        return { color: "orange", text: "Chờ xác nhận" };
      case InvitationStatusEnum.QUALIFIED:
        return { color: "green", text: "Đủ điều kiện" };
      case InvitationStatusEnum.PAID:
        return { color: "blue", text: "Đã trả thưởng" };
      case InvitationStatusEnum.EXPIRED:
        return { color: "red", text: "Hết hạn" };
      default:
        return { color: "default", text: "Không xác định" };
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const formatDateTime = (timestamp: number) => {
    return moment(timestamp).format("DD/MM/YYYY HH:mm");
  };

  const getProgressPercent = (record: InvitationRecord) => {
    const { turnoverAmount, tierInfo } = record;
    const required = tierInfo.minTurnover;
    return Math.min((turnoverAmount / required) * 100, 100);
  };

  // Handle user click to open customer detail in new tab
  const handleUserClick = (userId: number) => {
    window.open(`/#/customer/${userId}`, "_blank");
  };

  const renderUserInfo = (userInfo: any, type: "referrer" | "invitee") => (
    <div
      className="user-info-card"
      onClick={() => handleUserClick(userInfo.id)}
    >
      <div className="user-info-content">
        <div className={`user-avatar ${type}`}>
          <Avatar size="small" icon={<UserOutlined />} />
        </div>
        <div className="user-details">
          <div className="phone-row">
            <PhoneOutlined className="phone-icon" />
            <Text strong className="phone-text">
              {userInfo.phone}
            </Text>
          </div>
          <div className="invite-code-row">
            <Text className="invite-code-text">{userInfo.inviteCode}</Text>
          </div>
          <div className="uuid-row">
            <Text className="uuid-text">ID: {userInfo.uuid}</Text>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProgress = (record: InvitationRecord) => {
    const percent = getProgressPercent(record);
    const isCompleted = percent >= 100;

    return (
      <div className="turnover-progress">
        <Progress
          percent={percent}
          size="small"
          status={isCompleted ? "success" : "active"}
          showInfo={false}
        />
        <div className="progress-text">
          <Text style={{ fontSize: "12px" }}>
            {formatCurrency(record.turnoverAmount)} /{" "}
            {formatCurrency(record.tierInfo.minTurnover)}
          </Text>
        </div>
      </div>
    );
  };

  const renderActions = (record: InvitationRecord) => {
    const actions = [];

    // View action - always available
    actions.push(
      <Button
        key="view"
        type="link"
        icon={<EyeOutlined />}
        onClick={() => onAction(record, "view")}
        size="small"
      >
        Chi tiết
      </Button>
    );

    // Action buttons based on status
    if (record.status === InvitationStatusEnum.QUALIFIED) {
      actions.push(
        <Button
          key="approve"
          type="primary"
          size="small"
          icon={<CheckOutlined />}
          onClick={() => onAction(record, "approve")}
        >
          Xác nhận
        </Button>
      );

      actions.push(
        <Button
          key="reject"
          danger
          size="small"
          icon={<CloseOutlined />}
          onClick={() => onAction(record, "reject")}
        >
          Từ chối
        </Button>
      );
    }

    return <Space size="small">{actions}</Space>;
  };

  const columns: ColumnsType<InvitationRecord> = [
    {
      title: "STT",
      key: "index",
      width: 60,
      render: (_, __, index) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: "Đại lý",
      key: "referrer",
      width: 180,
      render: (_, record) => renderUserInfo(record.referrerInfo, "referrer"),
    },
    {
      title: "Người dùng",
      key: "invitee",
      width: 180,
      render: (_, record) => renderUserInfo(record.inviterInfo, "invitee"),
    },
    {
      title: "Số tiền nạp",
      dataIndex: "depositAmount",
      key: "depositAmount",
      width: 120,
      align: "right",
      render: (amount) => formatCurrency(amount),
      sorter: true,
    },
    {
      title: "Turnover",
      key: "turnover",
      width: 150,
      render: (_, record) => renderProgress(record),
    },
    {
      title: "Thưởng",
      dataIndex: "rewardAmount",
      key: "rewardAmount",
      width: 100,
      align: "right",
      render: (amount) => (
        <Text strong style={{ color: "#52c41a" }}>
          {formatCurrency(amount)}
        </Text>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => {
        const config = getStatusConfig(status);
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: "Thời gian",
      key: "time",
      width: 150,
      render: (_, record) => (
        <div className="time-info">
          <div>
            <Text style={{ fontSize: "12px" }}>
              Mời: {formatDateTime(record.invitedAt)}
            </Text>
          </div>
          {record.qualifiedAt && (
            <div>
              <Text style={{ fontSize: "12px" }}>
                Đủ điều kiện: {formatDateTime(record.qualifiedAt)}
              </Text>
            </div>
          )}
          {record.paidAt && (
            <div>
              <Text style={{ fontSize: "12px" }}>
                Trả thưởng: {formatDateTime(record.paidAt)}
              </Text>
            </div>
          )}
          <div>
            <Text style={{ fontSize: "12px" }} type="secondary">
              Hết hạn: {formatDateTime(record.expiresAt)}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 150,
      fixed: "right",
      render: (_, record) => renderActions(record),
    },
  ];

  return (
    <div className="invitation-table">
      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} của ${total} bản ghi`,
          onChange: onPaginationChange,
          onShowSizeChange: onPaginationChange,
          pageSizeOptions: ["10", "20", "50", "100"],
        }}
        rowKey="id"
        scroll={{ x: 1300 }}
        size="middle"
      />
    </div>
  );
};

export default InvitationTable;
