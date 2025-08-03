import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  message,
  Modal,
  Descriptions,
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
  CreditCardOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { debounce } from "lodash";
import moment from "moment";
import DepositHeader from "./DepositHeader";
import DepositFilters from "./DepositFilters";
import DepositTable from "./DepositTable";
import {
  getDepositList,
  getDepositStats,
  confirmDeposit,
  cancelDeposit,
} from "@src/services/depositService";
import {
  DepositRecord,
  DepositStats,
  DepositListParams,
  DepositTransactionStatus,
} from "./types";
import "@src/styles/deposit/styles.less";

const { Text } = Typography;

const Deposit: React.FC = () => {
  // State management
  const [activeTab, setActiveTab] = useState<string>(DepositTransactionStatus.SUCCESS);
  const [data, setData] = useState<DepositRecord[]>([]);
  const [stats, setStats] = useState<DepositStats>();
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [total, setTotal] = useState(0);

  // Pagination state
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  // Filters state
  const [filters, setFilters] = useState<DepositListParams>({
    status: DepositTransactionStatus.SUCCESS,
    skip: 0,
    limit: 10,
    sort: "createdAt",
    order: "desc",
  });

  // Calculate skip from current page
  const getSkipFromPage = (page: number, pageSize: number) => {
    return (page - 1) * pageSize;
  };

  // Load data function
  const loadData = useCallback(
    async (params?: Partial<DepositListParams>) => {
      try {
        setLoading(true);
        const finalParams = { ...filters, ...params };
        const result = await getDepositList(finalParams);

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
        console.error("Error loading deposit data:", error);
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
      const result = await getDepositStats();

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
      status: tab as DepositTransactionStatus,
      skip: 0,
    };
    setFilters(newFilters);
    setPagination({ ...pagination, current: 1 });
    loadData(newFilters);
  };

  // Handle filters change
  const handleFiltersChange = (newFilters: Partial<DepositListParams>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);

    // If it's a search, use debounced load
    if (
      newFilters.nickname !== undefined ||
      newFilters.orderId !== undefined ||
      newFilters.customerId !== undefined
    ) {
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
    const defaultFilters: DepositListParams = {
      status: activeTab as DepositTransactionStatus,
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
  const getStatusConfig = (status: DepositTransactionStatus) => {
    switch (status) {
      case DepositTransactionStatus.PENDING:
        return {
          color: "orange",
          text: "Chờ xử lý",
          icon: <ClockCircleOutlined />,
        };
      case DepositTransactionStatus.SUCCESS:
        return {
          color: "green",
          text: "Thành công",
          icon: <CheckCircleOutlined />,
        };
      case DepositTransactionStatus.FAILED:
        return {
          color: "red",
          text: "Thất bại",
          icon: <CloseCircleOutlined />,
        };
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
    record: DepositRecord,
    action: "view" | "confirm" | "cancel"
  ) => {
    switch (action) {
      case "view":
        const statusConfig = getStatusConfig(record.status);
        const totalAmount = (record.usdtAmount || 0) + (record.bonusAmount || 0);

        // Open detail modal
        Modal.info({
          title: (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <DollarOutlined style={{ color: "#1890ff" }} />
              <span>Chi tiết giao dịch nạp tiền</span>
            </div>
          ),
          width: 900,
          className: "deposit-detail-modal",
          content: (
            <div className="deposit-detail-content">
              {/* Header with ID and Status */}
              <Row gutter={16} style={{ marginBottom: "20px" }}>
                <Col span={12}>
                  <Card size="small" title="Thông tin giao dịch">
                    <Descriptions column={1} size="small">
                      <Descriptions.Item label="ID">
                        <Text code>{record.id}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="Order ID">
                        <Text code>{record.orderId}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="Transaction Hash">
                        <Text code>{record.txHash}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="From Address">
                        <Text code>{record.fromAddress}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="To Address">
                        <Text code>{record.toAddress}</Text>
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
                      <Descriptions.Item label="Tạo lúc">
                        <Text>
                          {moment(record.createdAt).format(
                            "DD/MM/YYYY HH:mm:ss"
                          )}
                        </Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="Cập nhật">
                        <Text>
                          {moment(record.updatedAt).format(
                            "DD/MM/YYYY HH:mm:ss"
                          )}
                        </Text>
                      </Descriptions.Item>
                      {record.updatedAt && record.updatedAt !== record.createdAt && (
                        <Descriptions.Item label="Asset">
                          <Tag color="blue">{record.asset}</Tag>
                        </Descriptions.Item>
                      )}
                      <Descriptions.Item label="Chain">
                        <Tag color="green">{record.chain}</Tag>
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                </Col>
              </Row>

              <Divider orientation="left">
                <UserOutlined style={{ marginRight: "8px" }} />
                Thông tin khách hàng
              </Divider>

              {/* Customer Information */}
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
                          style={{ backgroundColor: "#1890ff" }}
                          icon={<UserOutlined />}
                        />
                        <span>Khách hàng</span>
                      </div>
                    }
                  >
                    <Descriptions column={1} size="small">
                      <Descriptions.Item label="Tên">
                        <Text strong>{(record.customer || record.customerInfo)?.name}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item
                        label={
                          <>
                            <PhoneOutlined style={{ marginRight: "4px" }} />
                            Số điện thoại
                          </>
                        }
                      >
                        <Text strong>{(record.customer || record.customerInfo)?.phone}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="Mã mời">
                        <Text code>{(record.customer || record.customerInfo)?.inviteCode}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="ID">
                        <Text type="secondary">{(record.customer || record.customerInfo)?.id}</Text>
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                </Col>
                {record.inviteCustomer && (
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
                          <span>Người giới thiệu</span>
                        </div>
                      }
                    >
                      <Descriptions column={1} size="small">
                        <Descriptions.Item label="Tên">
                          <Text strong>{record.inviteCustomer.name}</Text>
                        </Descriptions.Item>
                        <Descriptions.Item
                          label={
                            <>
                              <PhoneOutlined style={{ marginRight: "4px" }} />
                              Số điện thoại
                            </>
                          }
                        >
                          <Text strong>{record.inviteCustomer.phone}</Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Mã mời">
                          <Text code>{record.inviteCustomer.inviteCode}</Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="ID">
                          <Text type="secondary">
                            {record.inviteCustomer.id}
                          </Text>
                        </Descriptions.Item>
                      </Descriptions>
                    </Card>
                  </Col>
                )}
              </Row>

              <Divider orientation="left">
                <DollarOutlined style={{ marginRight: "8px" }} />
                Thông tin tài chính
              </Divider>

              {/* Financial Information */}
              <Row gutter={16} style={{ marginBottom: "20px" }}>
                {/* USDT Amount - Primary Display */}
                <Col span={record.bonusAmount && record.bonusAmount > 0 ? 8 : 12}>
                  <Card size="small">
                    <div style={{ textAlign: "center" }}>
                      <DollarOutlined
                        style={{
                          fontSize: "26px",
                          color: "#722ed1",
                          marginBottom: "8px",
                        }}
                      />
                      <div>
                        <Text type="secondary" style={{ fontSize: "12px" }}>
                          {record.asset || 'USDT'} Amount
                        </Text>
                      </div>
                      <div>
                        <Text
                          strong
                          style={{ fontSize: "18px", color: "#722ed1" }}
                        >
                          {record.usdtAmount} {record.asset || 'USDT'}
                        </Text>
                      </div>
                    </div>
                  </Card>
                </Col>
                
                {record.bonusAmount && record.bonusAmount > 0 && (
                  <Col span={8}>
                    <Card size="small">
                      <div style={{ textAlign: "center" }}>
                        <DollarOutlined
                          style={{
                            fontSize: "24px",
                            color: "#73d13d",
                            marginBottom: "8px",
                          }}
                        />
                        <div>
                          <Text type="secondary" style={{ fontSize: "12px" }}>
                            Bonus Amount
                          </Text>
                        </div>
                        <div>
                          <Text
                            strong
                            style={{ fontSize: "16px", color: "#73d13d" }}
                          >
                            {record.bonusAmount} {record.asset || 'USDT'}
                          </Text>
                        </div>
                      </div>
                    </Card>
                  </Col>
                )}
                
                <Col span={record.bonusAmount && record.bonusAmount > 0 ? 8 : 12}>
                  <Card size="small">
                    <div style={{ textAlign: "center" }}>
                      <DollarOutlined
                        style={{
                          fontSize: "24px",
                          color: "#ffa940",
                          marginBottom: "8px",
                        }}
                      />
                      <div>
                        <Text type="secondary" style={{ fontSize: "12px" }}>
                          Total Amount
                        </Text>
                      </div>
                      <div>
                        <Text
                          strong
                          style={{ fontSize: "16px", color: "#ffa940" }}
                        >
                          {totalAmount} {record.asset || 'USDT'}
                        </Text>
                      </div>
                    </div>
                  </Card>
                </Col>
              </Row>

              <Divider orientation="left">
                <CreditCardOutlined style={{ marginRight: "8px" }} />
                Blockchain Information
              </Divider>

              {/* Blockchain Information */}
              <Card size="small">
                <Row gutter={16}>
                  <Col span={12}>
                    <Descriptions column={1} size="small">
                      <Descriptions.Item label="Chain">
                        <Tag color="blue">{record.chain}</Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="Asset">
                        <Tag color="green">{record.asset}</Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="Transaction Hash">
                        <Text code copyable>{record.txHash}</Text>
                      </Descriptions.Item>
                    </Descriptions>
                  </Col>
                  <Col span={12}>
                    <Descriptions column={1} size="small">
                      <Descriptions.Item label="From Address">
                        <Text code copyable>{record.fromAddress}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="To Address">
                        <Text code copyable>{record.toAddress}</Text>
                      </Descriptions.Item>
                    </Descriptions>
                  </Col>
                </Row>
              </Card>
            </div>
          ),
        });
        break;

      case "confirm":
        Modal.confirm({
          title: "Xác nhận thanh toán",
          content: `Bạn có chắc chắn muốn xác nhận giao dịch ${record.usdtAmount} ${record.asset || 'USDT'} cho đơn hàng ${record.orderId}?`,
          onOk: async () => {
            try {
              const result = await confirmDeposit(record.id);

              if (typeof result === "object" && "errorCode" in result) {
                message.error(
                  result.message ||
                    "Không thể xác nhận giao dịch. Vui lòng thử lại!"
                );
                return;
              }

              message.success("Đã xác nhận giao dịch thành công!");
              loadData();
              loadStats();
            } catch (error) {
              message.error("Không thể xác nhận giao dịch. Vui lòng thử lại!");
            }
          },
        });
        break;

      case "cancel":
        Modal.confirm({
          title: "Hủy thanh toán",
          content: `Bạn có chắc chắn muốn hủy giao dịch ${record.orderId}?`,
          onOk: async () => {
            try {
              const result = await cancelDeposit(record.id);

              if (typeof result === "object" && "errorCode" in result) {
                message.error(
                  result.message || "Không thể hủy giao dịch. Vui lòng thử lại!"
                );
                return;
              }

              message.success("Đã hủy giao dịch thành công!");
              loadData();
              loadStats();
            } catch (error) {
              message.error("Không thể hủy giao dịch. Vui lòng thử lại!");
            }
          },
        });
        break;
    }
  };

  // Initial data load
  useEffect(() => {
    loadData();
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="deposit-page">
      <Card className="deposit-card">
        <DepositHeader
          activeTab={activeTab}
          stats={stats}
          loading={statsLoading}
          onTabChange={handleTabChange}
        />

        <DepositFilters
          filters={filters}
          loading={loading}
          total={total}
          onFiltersChange={handleFiltersChange}
          onSearch={handleSearch}
          onReset={handleReset}
        />

        <DepositTable
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

export default Deposit;
