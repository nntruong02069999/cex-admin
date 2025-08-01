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
  PaymentStatus,
} from "./types";
import "@src/styles/deposit/styles.less";

const { Text } = Typography;

const Deposit: React.FC = () => {
  // State management
  const [activeTab, setActiveTab] = useState<string>(PaymentStatus.PENDING);
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
    status: PaymentStatus.PENDING,
    skip: 0,
    limit: 10,
    sort: "createdAt",
    order: "desc",
  });

  // Calculate skip from current page
  const getSkipFromPage = (page: number, pageSize: number) => {
    return (page - 1) * pageSize;
  };

  // Currency formatter for Indian Rupee
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "INR",
    }).format(amount);
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
      status: tab as PaymentStatus,
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
      newFilters.phone !== undefined ||
      newFilters.orderId !== undefined ||
      newFilters.gatewayOrderId !== undefined
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
      status: activeTab as PaymentStatus,
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
  const getStatusConfig = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.PENDING:
        return {
          color: "orange",
          text: "Chờ thanh toán",
          icon: <ClockCircleOutlined />,
        };
      case PaymentStatus.SUCCESS:
        return {
          color: "green",
          text: "Thành công",
          icon: <CheckCircleOutlined />,
        };
      case PaymentStatus.FAILED:
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
        const totalAmount = record.amount + record.bonusAmount;

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
                      <Descriptions.Item label="Gateway Order ID">
                        <Text code>{record.gatewayOrderId}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="Merchant Transaction ID">
                        <Text code>{record.merchantTransactionId}</Text>
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
                      {record.paymentAt && (
                        <Descriptions.Item label="Thanh toán lúc">
                          <Text style={{ color: "#52c41a" }}>
                            {moment(record.paymentAt).format(
                              "DD/MM/YYYY HH:mm:ss"
                            )}
                          </Text>
                        </Descriptions.Item>
                      )}
                      {record.failMessage && (
                        <Descriptions.Item label="Lý do thất bại">
                          <Text type="danger">{record.failMessage}</Text>
                        </Descriptions.Item>
                      )}
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
                        <Text strong>{record.customerInfo.name}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item
                        label={
                          <>
                            <PhoneOutlined style={{ marginRight: "4px" }} />
                            Số điện thoại
                          </>
                        }
                      >
                        <Text strong>{record.customerInfo.phone}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="Mã mời">
                        <Text code>{record.customerInfo.inviteCode}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="ID">
                        <Text type="secondary">{record.customerInfo.id}</Text>
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
                {/* USDT Amount - Priority Display */}
                {record.usdtAmount && record.usdtAmount > 0 && (
                  <Col span={record.bonusAmount > 0 ? 6 : 8}>
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
                            USDT (Chính)
                          </Text>
                        </div>
                        <div>
                          <Text
                            strong
                            style={{ fontSize: "18px", color: "#722ed1" }}
                          >
                            {record.usdtAmount} USDT
                          </Text>
                        </div>
                      </div>
                    </Card>
                  </Col>
                )}
                
                <Col span={record.usdtAmount && record.usdtAmount > 0 ? (record.bonusAmount > 0 ? 6 : 8) : 8}>
                  <Card size="small">
                    <div style={{ textAlign: "center" }}>
                      <DollarOutlined
                        style={{
                          fontSize: record.usdtAmount && record.usdtAmount > 0 ? "22px" : "24px",
                          color: record.usdtAmount && record.usdtAmount > 0 ? "#8c8c8c" : "#1976d2",
                          marginBottom: "8px",
                        }}
                      />
                      <div>
                        <Text type="secondary" style={{ fontSize: "12px" }}>
                          {record.usdtAmount && record.usdtAmount > 0 ? "Số tiền INR" : "Số tiền gốc"}
                        </Text>
                      </div>
                      <div>
                        <Text
                          strong={!(record.usdtAmount && record.usdtAmount > 0)}
                          style={{ 
                            fontSize: record.usdtAmount && record.usdtAmount > 0 ? "14px" : "16px", 
                            color: record.usdtAmount && record.usdtAmount > 0 ? "#8c8c8c" : "#1976d2" 
                          }}
                        >
                          {formatCurrency(record.amount)}
                        </Text>
                      </div>
                    </div>
                  </Card>
                </Col>
                
                {record.bonusAmount > 0 && (
                  <Col span={record.usdtAmount && record.usdtAmount > 0 ? 6 : 8}>
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
                            Tiền thưởng
                          </Text>
                        </div>
                        <div>
                          <Text
                            strong
                            style={{ fontSize: "16px", color: "#73d13d" }}
                          >
                            {formatCurrency(record.bonusAmount)}
                          </Text>
                        </div>
                      </div>
                    </Card>
                  </Col>
                )}
                
                <Col span={record.usdtAmount && record.usdtAmount > 0 ? (record.bonusAmount > 0 ? 6 : 8) : 8}>
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
                          Tổng cộng
                        </Text>
                      </div>
                      <div>
                        <Text
                          strong
                          style={{ fontSize: "16px", color: "#ffa940" }}
                        >
                          {formatCurrency(totalAmount)}
                        </Text>
                      </div>
                      {record.usdtAmount && record.usdtAmount > 0 && (
                        <div style={{ marginTop: "4px" }}>
                          <Text style={{ fontSize: "12px", color: "#722ed1" }}>
                            ({record.usdtAmount} USDT)
                          </Text>
                        </div>
                      )}
                    </div>
                  </Card>
                </Col>
              </Row>

              <Divider orientation="left">
                <CreditCardOutlined style={{ marginRight: "8px" }} />
                Thông tin thanh toán
              </Divider>

              {/* Payment Information */}
              <Card size="small">
                <Row gutter={16}>
                  <Col span={12}>
                    <Descriptions column={1} size="small">
                      <Descriptions.Item label="Payment Gateway">
                        <Text>{record.paymentGatewayCode}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="Payment Channel">
                        <Text>{record.paymentChannelCode}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="Provider">
                        <Tag color="blue">{record.providerPaymentCode}</Tag>
                      </Descriptions.Item>
                    </Descriptions>
                  </Col>
                  <Col span={12}>
                    <Descriptions column={1} size="small">
                      <Descriptions.Item label="Gateway ID">
                        <Text>{record.paymentGatewayId}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="Channel ID">
                        <Text>{record.paymentChannelId}</Text>
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
          content: `Bạn có chắc chắn muốn xác nhận thanh toán ${formatCurrency(
            record.amount
          )} cho đơn hàng ${record.orderId}?`,
          onOk: async () => {
            try {
              const result = await confirmDeposit(record.id);

              if (typeof result === "object" && "errorCode" in result) {
                message.error(
                  result.message ||
                    "Không thể xác nhận thanh toán. Vui lòng thử lại!"
                );
                return;
              }

              message.success("Đã xác nhận thanh toán thành công!");
              loadData();
              loadStats();
            } catch (error) {
              message.error("Không thể xác nhận thanh toán. Vui lòng thử lại!");
            }
          },
        });
        break;

      case "cancel":
        Modal.confirm({
          title: "Hủy thanh toán",
          content: `Bạn có chắc chắn muốn hủy đơn hàng ${record.orderId}?`,
          onOk: async () => {
            try {
              const result = await cancelDeposit(record.id);

              if (typeof result === "object" && "errorCode" in result) {
                message.error(
                  result.message || "Không thể hủy thanh toán. Vui lòng thử lại!"
                );
                return;
              }

              message.success("Đã hủy thanh toán thành công!");
              loadData();
              loadStats();
            } catch (error) {
              message.error("Không thể hủy thanh toán. Vui lòng thử lại!");
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
