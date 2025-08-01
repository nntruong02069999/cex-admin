import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  message,
  Modal,
  Descriptions,
  Progress,
  Tag,
  Avatar,
  Divider,
  Row,
  Col,
  Typography,
} from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  DollarOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { debounce } from "lodash";
import moment from "moment";
import InvitationHeader from "./InvitationHeader";
import InvitationFilters from "./InvitationFilters";
import InvitationTable from "./InvitationTable";
import {
  getInvitationList,
  getInvitationStats,
  approveInvitationReward,
  rejectInvitationReward,
} from "@src/services/invitationRewardService";
import {
  InvitationRecord,
  InvitationStats,
  InvitationListParams,
  InvitationStatusEnum,
} from "./types";
import "@src/styles/invitation-reward/styles.less";

const { Text } = Typography;

const InvitationReward: React.FC = () => {
  // State management
  const [activeTab, setActiveTab] = useState<string>(
    InvitationStatusEnum.PENDING
  );
  const [data, setData] = useState<InvitationRecord[]>([]);
  const [stats, setStats] = useState<InvitationStats>();
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [total, setTotal] = useState(0);

  // Pagination state
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  // Filters state
  const [filters, setFilters] = useState<InvitationListParams>({
    status: InvitationStatusEnum.PENDING,
    skip: 0,
    limit: 10,
    sort: "createdAt",
    order: "desc",
  });

  // Calculate skip from current page
  const getSkipFromPage = (page: number, pageSize: number) => {
    return (page - 1) * pageSize;
  };

  // Currency formatter for Indian Rupee with Western format
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  // Load data function
  const loadData = useCallback(
    async (params?: Partial<InvitationListParams>) => {
      try {
        setLoading(true);
        const finalParams = { ...filters, ...params };
        const result = await getInvitationList(finalParams);

        if ("errorCode" in result) {
          message.error(
            result.message || "Không thể tải dữ liệu. Vui lòng thử lại!"
          );
          return;
        }

        setData(result.data);
        setTotal(result.total);
      } catch (error) {
        message.error("Không thể tải dữ liệu. Vui lòng thử lại!");
        console.error("Error loading invitation data:", error);
      } finally {
        setLoading(false);
      }
    },
    [filters]
  );

  // Load stats function
  const loadStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const result = await getInvitationStats();

      if ("errorCode" in result) {
        message.error(
          result.message || "Không thể tải thống kê. Vui lòng thử lại!"
        );
        return;
      }

      setStats(result);
    } catch (error) {
      message.error("Không thể tải thống kê. Vui lòng thử lại!");
      console.error("Error loading stats:", error);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Debounced search function
  const debouncedLoadData = useCallback(
    debounce((params) => loadData(params), 500),
    [loadData]
  );

  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const newFilters = {
      ...filters,
      status: tab as InvitationStatusEnum,
      skip: 0,
    };
    setFilters(newFilters);
    setPagination({ ...pagination, current: 1 });
    loadData(newFilters);
  };

  // Handle filters change
  const handleFiltersChange = (newFilters: Partial<InvitationListParams>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);

    // If it's a search, use debounced load
    if (newFilters.search !== undefined) {
      debouncedLoadData(updatedFilters);
    }
  };

  // Handle search
  const handleSearch = () => {
    const searchParams = { ...filters, skip: 0 };
    setFilters(searchParams);
    setPagination({ ...pagination, current: 1 });
    loadData(searchParams);
  };

  // Handle reset filters
  const handleReset = () => {
    const defaultFilters: InvitationListParams = {
      status: activeTab as InvitationStatusEnum,
      skip: 0,
      limit: pagination.pageSize,
      sort: "createdAt",
      order: "desc",
    };
    setFilters(defaultFilters);
    setPagination({ ...pagination, current: 1 });
    loadData(defaultFilters);
  };

  // Handle pagination change
  const handlePaginationChange = (page: number, pageSize?: number) => {
    const newPageSize = pageSize || pagination.pageSize;
    const newPagination = {
      current: page,
      pageSize: newPageSize,
    };
    setPagination(newPagination);

    const newFilters = {
      ...filters,
      skip: getSkipFromPage(page, newPageSize),
      limit: newPageSize,
    };
    setFilters(newFilters);
    loadData(newFilters);
  };

  // Get status configuration
  const getStatusConfig = (status: string) => {
    switch (status) {
      case InvitationStatusEnum.PENDING:
        return {
          color: "orange",
          text: "Chờ xác nhận",
          icon: <ClockCircleOutlined />,
        };
      case InvitationStatusEnum.QUALIFIED:
        return {
          color: "green",
          text: "Đủ điều kiện",
          icon: <CheckCircleOutlined />,
        };
      case InvitationStatusEnum.PAID:
        return {
          color: "blue",
          text: "Đã trả thưởng",
          icon: <TrophyOutlined />,
        };
      case InvitationStatusEnum.EXPIRED:
        return { color: "red", text: "Hết hạn", icon: <ClockCircleOutlined /> };
      default:
        return {
          color: "default",
          text: "Không xác định",
          icon: <ClockCircleOutlined />,
        };
    }
  };

  // Handle table actions
  const handleAction = async (
    record: InvitationRecord,
    action: "approve" | "reject" | "view"
  ) => {
    switch (action) {
      case "view":
        const statusConfig = getStatusConfig(record.status);
        const turnoverPercent = Math.min(
          (record.turnoverAmount / record.tierInfo.minTurnover) * 100,
          100
        );

        // Open detail modal
        Modal.info({
          title: (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <TrophyOutlined style={{ color: "#1890ff" }} />
              <span>Chi tiết thưởng nạp đầu</span>
            </div>
          ),
          width: 900,
          className: "invitation-detail-modal",
          content: (
            <div className="invitation-detail-content">
              {/* Header with ID and Status */}
              <Row gutter={16} style={{ marginBottom: "20px" }}>
                <Col span={12}>
                  <Card size="small" title="Thông tin chung">
                    <Descriptions column={1} size="small">
                      <Descriptions.Item label="ID">
                        <Text code>{record.id}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="Trạng thái">
                        <Tag
                          color={statusConfig.color}
                          icon={statusConfig.icon}
                        >
                          {statusConfig.text}
                        </Tag>
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card size="small" title="Thời gian">
                    <Descriptions column={1} size="small">
                      <Descriptions.Item label="Ngày mời">
                        <Text>
                          {moment(record.invitedAt).format("DD/MM/YYYY HH:mm")}
                        </Text>
                      </Descriptions.Item>
                      {record.qualifiedAt && (
                        <Descriptions.Item label="Đủ điều kiện">
                          <Text>
                            {moment(record.qualifiedAt).format(
                              "DD/MM/YYYY HH:mm"
                            )}
                          </Text>
                        </Descriptions.Item>
                      )}
                      {record.paidAt && (
                        <Descriptions.Item label="Đã trả thưởng">
                          <Text>
                            {moment(record.paidAt).format("DD/MM/YYYY HH:mm")}
                          </Text>
                        </Descriptions.Item>
                      )}
                      <Descriptions.Item label="Hết hạn">
                        <Text type="secondary">
                          {moment(record.expiresAt).format("DD/MM/YYYY HH:mm")}
                        </Text>
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                </Col>
              </Row>

              <Divider orientation="left">
                <UserOutlined style={{ marginRight: "8px" }} />
                Thông tin người dùng
              </Divider>

              {/* User Information */}
              <Row gutter={16} style={{ marginBottom: "20px" }}>
                <Col span={12}>
                  <Card
                    size="small"
                    title={
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <Avatar
                          size="small"
                          style={{ backgroundColor: "#52c41a" }}
                          icon={<UserOutlined />}
                        />
                        <span>Đại lý</span>
                      </div>
                    }
                  >
                    <Descriptions column={1} size="small">
                      <Descriptions.Item
                        label={
                          <>
                            <PhoneOutlined style={{ marginRight: "4px" }} />
                            Số điện thoại
                          </>
                        }
                      >
                        <Text strong>{record.referrerInfo.phone}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="Mã mời">
                        <Text code>{record.referrerInfo.inviteCode}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="UUID">
                        <Text type="secondary" style={{ fontSize: "12px" }}>
                          {record.referrerInfo.uuid}
                        </Text>
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card
                    size="small"
                    title={
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <Avatar
                          size="small"
                          style={{ backgroundColor: "#1890ff" }}
                          icon={<UserOutlined />}
                        />
                        <span>Người dùng</span>
                      </div>
                    }
                  >
                    <Descriptions column={1} size="small">
                      <Descriptions.Item
                        label={
                          <>
                            <PhoneOutlined style={{ marginRight: "4px" }} />
                            Số điện thoại
                          </>
                        }
                      >
                        <Text strong>{record.inviterInfo.phone}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="Mã mời">
                        <Text code>{record.inviterInfo.inviteCode}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="UUID">
                        <Text type="secondary" style={{ fontSize: "12px" }}>
                          {record.inviterInfo.uuid}
                        </Text>
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                </Col>
              </Row>

              <Divider orientation="left">
                <DollarOutlined style={{ marginRight: "8px" }} />
                Thông tin tài chính
              </Divider>

              {/* Financial Information */}
              <Row gutter={16} style={{ marginBottom: "20px" }}>
                <Col span={8}>
                  <Card size="small">
                    <div style={{ textAlign: "center" }}>
                      <DollarOutlined
                        style={{
                          fontSize: "24px",
                          color: "#1890ff",
                          marginBottom: "8px",
                        }}
                      />
                      <div>
                        <Text type="secondary" style={{ fontSize: "12px" }}>
                          Số tiền nạp
                        </Text>
                      </div>
                      <div>
                        <Text
                          strong
                          style={{ fontSize: "16px", color: "#1890ff" }}
                        >
                          {formatCurrency(record.depositAmount)}
                        </Text>
                      </div>
                    </div>
                  </Card>
                </Col>
                <Col span={8}>
                  <Card size="small">
                    <div style={{ textAlign: "center" }}>
                      <TrophyOutlined
                        style={{
                          fontSize: "24px",
                          color: "#52c41a",
                          marginBottom: "8px",
                        }}
                      />
                      <div>
                        <Text type="secondary" style={{ fontSize: "12px" }}>
                          Thưởng
                        </Text>
                      </div>
                      <div>
                        <Text
                          strong
                          style={{ fontSize: "16px", color: "#52c41a" }}
                        >
                          {formatCurrency(record.rewardAmount)}
                        </Text>
                      </div>
                    </div>
                  </Card>
                </Col>
                <Col span={8}>
                  <Card size="small">
                    <div style={{ textAlign: "center" }}>
                      <CheckCircleOutlined
                        style={{
                          fontSize: "24px",
                          color: "#faad14",
                          marginBottom: "8px",
                        }}
                      />
                      <div>
                        <Text type="secondary" style={{ fontSize: "12px" }}>
                          Tỷ lệ
                        </Text>
                      </div>
                      <div>
                        <Text
                          strong
                          style={{ fontSize: "16px", color: "#faad14" }}
                        >
                          {(
                            (record.rewardAmount / record.depositAmount) *
                            100
                          ).toFixed(1)}
                          %
                        </Text>
                      </div>
                    </div>
                  </Card>
                </Col>
              </Row>

              {/* Turnover Progress */}
              <Card
                size="small"
                title={
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <CheckCircleOutlined style={{ color: "#1890ff" }} />
                    <span>Tiến độ Turnover</span>
                  </div>
                }
              >
                <div style={{ marginBottom: "12px" }}>
                  <Row justify="space-between">
                    <Col>
                      <Text>
                        Hiện tại:{" "}
                        <Text strong>
                          {formatCurrency(record.turnoverAmount)}
                        </Text>
                      </Text>
                    </Col>
                    <Col>
                      <Text>
                        Yêu cầu:{" "}
                        <Text strong>
                          {formatCurrency(record.tierInfo.minTurnover)}
                        </Text>
                      </Text>
                    </Col>
                  </Row>
                </div>
                <Progress
                  percent={Number(turnoverPercent.toFixed(1))}
                  status={turnoverPercent >= 100 ? "success" : "active"}
                  strokeColor={{
                    "0%": "#108ee9",
                    "100%": "#87d068",
                  }}
                  format={(percent) => `${percent}%`}
                />
                <div style={{ textAlign: "center", marginTop: "8px" }}>
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    {turnoverPercent >= 100
                      ? "Đã hoàn thành"
                      : `Còn ${formatCurrency(
                          record.tierInfo.minTurnover - record.turnoverAmount
                        )}`}
                  </Text>
                </div>
              </Card>
            </div>
          ),
        });
        break;

      case "approve":
        Modal.confirm({
          title: "Xác nhận trả thưởng",
          content: `Bạn có chắc chắn muốn trả thưởng ${formatCurrency(
            record.rewardAmount
          )} cho đại lý ${record.referrerInfo.phone}?`,
          onOk: async () => {
            try {
              const result = await approveInvitationReward(record.id);

              if (typeof result === "object" && "errorCode" in result) {
                message.error(
                  result.message ||
                    "Không thể xác nhận trả thưởng. Vui lòng thử lại!"
                );
                return;
              }

              message.success("Đã xác nhận trả thưởng thành công!");
              loadData();
              loadStats();
            } catch (error) {
              message.error("Không thể xác nhận trả thưởng. Vui lòng thử lại!");
            }
          },
        });
        break;

      case "reject":
        Modal.confirm({
          title: "Từ chối trả thưởng",
          content: `Bạn có chắc chắn muốn từ chối trả thưởng cho đại lý ${record.referrerInfo.phone}?`,
          onOk: async () => {
            try {
              const result = await rejectInvitationReward(record.id);

              if (typeof result === "object" && "errorCode" in result) {
                message.error(
                  result.message || "Không thể từ chối. Vui lòng thử lại!"
                );
                return;
              }

              message.success("Đã từ chối thành công!");
              loadData();
              loadStats();
            } catch (error) {
              message.error("Không thể từ chối. Vui lòng thử lại!");
            }
          },
        });
        break;
    }
  };

  // Handle export (placeholder)
  const handleExport = () => {
    message.info("Tính năng xuất Excel đang được phát triển");
  };

  // Initial data load
  useEffect(() => {
    loadData();
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="invitation-reward-page">
      <Card className="invitation-card">
        <InvitationHeader
          activeTab={activeTab}
          stats={stats}
          loading={statsLoading}
          onTabChange={handleTabChange}
        />

        <InvitationFilters
          filters={filters}
          loading={loading}
          onFiltersChange={handleFiltersChange}
          onSearch={handleSearch}
          onReset={handleReset}
          onExport={handleExport}
        />

        <InvitationTable
          data={data}
          total={total}
          loading={loading}
          pagination={pagination}
          onPaginationChange={handlePaginationChange}
          onAction={handleAction}
        />
      </Card>
    </div>
  );
};

export default InvitationReward;
