import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Input,
  Modal,
  Space,
  Table,
  Tag,
  message,
  Row,
  Col,
  Select,
} from "antd";
import SectionCard from "./common/SectionCard";
import {
  getDepositTransactions,
  getWithdrawTransactions,
  GetTransactionsParams,
} from "@src/services/customer-transaction";
import {
  confirmDeposit,
  cancelDeposit,
  confirmWithdraw,
  cancelWithdraw,
} from "@src/services/customer";
import {
  PaymentStatus,
  PaymentTransaction,
  Withdraw,
  WithdrawStatus,
} from "@src/interfaces/CustomerTransaction";
import { ColumnsType } from "antd/es/table";
import moment from "moment";
import {
  FilterValue,
  SorterResult,
  TablePaginationConfig,
  TableCurrentDataSource,
} from "antd/es/table/interface";
import { useParams } from "react-router-dom";

const { Option } = Select;

interface TableParams {
  pagination?: TablePaginationConfig;
  sortField?: string;
  sortOrder?: "ascend" | "descend" | null;
  filters?: Record<string, FilterValue | null>;
}

interface RouteParams {
  customerId?: string;
}

const CustomerTransactions: React.FC = () => {
  const { customerId } = useParams<RouteParams>();
  const [loadingDeposits, setLoadingDeposits] = useState(false);
  const [loadingWithdraws, setLoadingWithdraws] = useState(false);
  const [deposits, setDeposits] = useState<PaymentTransaction[]>([]);
  const [withdraws, setWithdraws] = useState<Withdraw[]>([]);
  const [depositParams, setDepositParams] = useState<TableParams>({
    pagination: {
      current: 1,
      pageSize: 10,
    },
  });
  const [withdrawParams, setWithdrawParams] = useState<TableParams>({
    pagination: {
      current: 1,
      pageSize: 10,
    },
  });
  const [rejectModal, setRejectModal] = useState({
    visible: false,
    id: 0,
    type: "",
  });
  const [confirmModal, setConfirmModal] = useState({
    visible: false,
    id: 0,
    type: "",
  });
  const [, setRejectReason] = useState("");

  // Filter states
  const [depositStatus, setDepositStatus] = useState<string | undefined>(
    undefined
  );
  const [depositOrderId, setDepositOrderId] = useState<string | undefined>(
    undefined
  );
  const [withdrawStatus, setWithdrawStatus] = useState<string | undefined>(
    undefined
  );
  const [withdrawOrderId, setWithdrawOrderId] = useState<string | undefined>(
    undefined
  );

  // Fetch initial data
  useEffect(() => {
    fetchDeposits();
    fetchWithdraws();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId]);

  // Fetch deposits
  const fetchDeposits = async (params = depositParams) => {
    setLoadingDeposits(true);
    const requestParams: GetTransactionsParams = {
      page: params.pagination?.current,
      limit: params.pagination?.pageSize,
      sort: params.sortField,
      order:
        params.sortOrder === "ascend"
          ? "asc"
          : params.sortOrder === "descend"
          ? "desc"
          : undefined,
      customerId: customerId ? parseInt(customerId) : undefined,
      status: depositStatus,
      orderId: depositOrderId,
    };

    try {
      const result = await getDepositTransactions(requestParams);
      if (result) {
        const { data, total } = result;
        setDeposits(data);
        setDepositParams({
          ...params,
          pagination: {
            ...params.pagination,
            total: total,
          },
        });
      } else {
        message.error(result.message || "Failed to fetch deposit transactions");
      }
    } catch (error) {
      message.error("Error fetching deposit transactions");
    } finally {
      setLoadingDeposits(false);
    }
  };

  // Fetch withdrawals
  const fetchWithdraws = async (params = withdrawParams) => {
    setLoadingWithdraws(true);
    const requestParams: GetTransactionsParams = {
      page: params.pagination?.current,
      limit: params.pagination?.pageSize,
      sort: params.sortField,
      order:
        params.sortOrder === "ascend"
          ? "asc"
          : params.sortOrder === "descend"
          ? "desc"
          : undefined,
      customerId: customerId ? parseInt(customerId) : undefined,
      status: withdrawStatus,
      orderId: withdrawOrderId,
    };

    try {
      const result = await getWithdrawTransactions(requestParams);
      if (result) {
        const { data, total } = result;
        setWithdraws(data);
        setWithdrawParams({
          ...params,
          pagination: {
            ...params.pagination,
            total: total,
          },
        });
      } else {
        message.error(
          result.message || "Failed to fetch withdrawal transactions"
        );
      }
    } catch (error) {
      message.error("Error fetching withdrawal transactions");
    } finally {
      setLoadingWithdraws(false);
    }
  };

  // Handle deposit filter change
  const handleDepositFilterChange = () => {
    setDepositParams({
      ...depositParams,
      pagination: {
        ...depositParams.pagination,
        current: 1, // Reset to first page when filtering
      },
    });
    fetchDeposits({
      ...depositParams,
      pagination: {
        ...depositParams.pagination,
        current: 1,
      },
    });
  };

  // Handle withdraw filter change
  const handleWithdrawFilterChange = () => {
    setWithdrawParams({
      ...withdrawParams,
      pagination: {
        ...withdrawParams.pagination,
        current: 1, // Reset to first page when filtering
      },
    });
    fetchWithdraws({
      ...withdrawParams,
      pagination: {
        ...withdrawParams.pagination,
        current: 1,
      },
    });
  };

  // Handle deposit table change
  const handleDepositTableChange = (
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorter:
      | SorterResult<PaymentTransaction>
      | SorterResult<PaymentTransaction>[],
    extra: TableCurrentDataSource<PaymentTransaction>
  ) => {
    const sorterResult = Array.isArray(sorter) ? sorter[0] : sorter;
    const params: TableParams = {
      pagination,
      filters,
      sortField: sorterResult.field as string,
      sortOrder: sorterResult.order as "ascend" | "descend" | null,
    };
    fetchDeposits(params);
  };

  // Handle withdrawal table change
  const handleWithdrawTableChange = (
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorter: SorterResult<Withdraw> | SorterResult<Withdraw>[],
    extra: TableCurrentDataSource<Withdraw>
  ) => {
    const sorterResult = Array.isArray(sorter) ? sorter[0] : sorter;
    const params: TableParams = {
      pagination,
      filters,
      sortField: sorterResult.field as string,
      sortOrder: sorterResult.order as "ascend" | "descend" | null,
    };
    fetchWithdraws(params);
  };

  // Show confirm deposit modal
  const showConfirmDepositModal = (id: number) => {
    setConfirmModal({
      visible: true,
      id: id,
      type: "deposit",
    });
  };

  // Show confirm withdrawal modal
  const showConfirmWithdrawModal = (id: number) => {
    setConfirmModal({
      visible: true,
      id: id,
      type: "withdraw",
    });
  };

  // Handle confirm transaction
  const handleConfirm = async () => {
    try {
      let result;
      if (confirmModal.type === "deposit") {
        result = await confirmDeposit(confirmModal.id);
        if (result && result.code === 0) {
          message.success("Xác nhận nạp tiền thành công");
          fetchDeposits();
        } else {
          message.error(result.message || "Xác nhận nạp tiền thất bại");
        }
      } else {
        result = await confirmWithdraw(confirmModal.id);
        if (result && result.code === 0) {
          message.success("Xác nhận rút tiền thành công");
          fetchWithdraws();
        } else {
          message.error(result.message || "Xác nhận rút tiền thất bại");
        }
      }
      setConfirmModal({ visible: false, id: 0, type: "" });
    } catch (error) {
      message.error(
        `Đã xảy ra lỗi khi xác nhận ${
          confirmModal.type === "deposit" ? "nạp tiền" : "rút tiền"
        }`
      );
    }
  };

  // Handle cancel transaction
  const handleCancel = async () => {
    try {
      let result;
      if (rejectModal.type === "deposit") {
        result = await cancelDeposit(rejectModal.id);
        if (result && result.code === 0) {
          message.success("Hủy nạp tiền thành công");
          fetchDeposits();
        } else {
          message.error(result.message || "Hủy nạp tiền thất bại");
        }
      } else {
        result = await cancelWithdraw(rejectModal.id);
        if (result && result.code === 0) {
          message.success("Hủy rút tiền thành công");
          fetchWithdraws();
        } else {
          message.error(result.message || "Hủy rút tiền thất bại");
        }
      }
      setRejectModal({ visible: false, id: 0, type: "" });
      setRejectReason("");
    } catch (error) {
      message.error(
        `Đã xảy ra lỗi khi hủy ${
          rejectModal.type === "deposit" ? "nạp tiền" : "rút tiền"
        }`
      );
    }
  };

  // Columns for deposit table
  const depositColumns: ColumnsType<PaymentTransaction> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      sorter: true,
      width: 80,
    },
    {
      title: "Mã thanh toán",
      dataIndex: "orderId",
      key: "orderId",
    },
    {
      title: "Cổng thanh toán",
      dataIndex: "providerPaymentCode",
      key: "providerPaymentCode",
    },
    {
      title: "Gateway",
      dataIndex: "paymentGatewayCode",
      key: "paymentGatewayCode",
    },
    {
      title: "Số tiền",
      dataIndex: "amount",
      key: "amount",
      sorter: true,
      render: (amount) =>
        `${amount.toLocaleString("en-IN", {
          style: "currency",
          currency: "INR",
        })}`,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      filters: [
        { text: "Chờ xác nhận", value: PaymentStatus.PENDING },
        { text: "Thành công", value: PaymentStatus.SUCCESS },
        { text: "Thất bại", value: PaymentStatus.FAILED },
      ],
      render: (status) => {
        let color = "blue";
        if (status === PaymentStatus.SUCCESS) color = "green";
        if (status === PaymentStatus.FAILED) color = "red";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Thời gian",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: true,
      render: (timestamp) =>
        timestamp ? moment(timestamp).format("DD/MM/YYYY HH:mm") : "-",
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) =>
        record.status === PaymentStatus.PENDING ? (
          <Space>
            <Button
              type="primary"
              size="small"
              onClick={() => showConfirmDepositModal(record.id)}
            >
              Xác nhận
            </Button>
            <Button
              danger
              size="small"
              onClick={() =>
                setRejectModal({
                  visible: true,
                  id: record.id,
                  type: "deposit",
                })
              }
            >
              Hủy
            </Button>
          </Space>
        ) : null,
    },
  ];

  // Columns for withdrawal table
  const withdrawColumns: ColumnsType<Withdraw> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      sorter: true,
      width: 80,
    },
    {
      title: "Mã rút tiền",
      dataIndex: "withdrawCode",
      key: "withdrawCode",
    },
    {
      title: "Thông tin ngân hàng",
      key: "bankInfo",
      render: (_, record) =>
        record.bankAccount ? (
          <div>
            <div>
              <strong>{record.bankAccount.bankName}</strong>
            </div>
            <div>{record.bankAccount.accountNumber}</div>
            <div>{record.bankAccount.accountName}</div>
          </div>
        ) : (
          "-"
        ),
    },
    {
      title: "Số tiền",
      dataIndex: "amount",
      key: "amount",
      sorter: true,
      render: (amount) =>
        `${amount.toLocaleString("en-IN", {
          style: "currency",
          currency: "INR",
        })}`,
    },
    {
      title: "Phí",
      dataIndex: "feeWithdraw",
      key: "feeWithdraw",
      render: (fee) =>
        `${fee.toLocaleString("en-IN", {
          style: "currency",
          currency: "INR",
        })}`,
    },
    {
      title: "Tổng cộng",
      key: "total",
      render: (_, record) => {
        const total = record.amount - record.feeWithdraw;
        return `${total.toLocaleString("en-IN", {
          style: "currency",
          currency: "INR",
        })}`;
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      filters: [
        { text: "Chờ xác nhận", value: WithdrawStatus.PENDING },
        { text: "Thành công", value: WithdrawStatus.COMPLETED },
        { text: "Đã hủy", value: WithdrawStatus.REJECTED },
      ],
      render: (status) => {
        let color = "blue";
        let text = status;
        if (status === WithdrawStatus.PENDING) {
          color = "blue";
          text = "Chờ xác nhận";
        } else if (status === WithdrawStatus.COMPLETED) {
          color = "green";
          text = "Thành công";
        } else if (status === WithdrawStatus.REJECTED) {
          color = "red";
          text = "Đã hủy";
        }
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "Thời gian",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: true,
      render: (timestamp) =>
        timestamp ? moment(timestamp).format("DD/MM/YYYY HH:mm") : "-",
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) =>
        record.status === WithdrawStatus.PENDING ? (
          <Space>
            <Button
              type="primary"
              size="small"
              onClick={() => showConfirmWithdrawModal(record.id)}
            >
              Xác nhận
            </Button>
            <Button
              danger
              size="small"
              onClick={() =>
                setRejectModal({
                  visible: true,
                  id: record.id,
                  type: "withdraw",
                })
              }
            >
              Hủy
            </Button>
          </Space>
        ) : null,
    },
  ];

  return (
    <div className="customer-transactions">
      {/* Deposit Section */}
      <SectionCard title="Lệnh nạp tiền">
        <Alert
          message="* Lệnh nạp tiền chỉ có thể xác nhận 1 lần duy nhất"
          type="info"
          showIcon
          style={{ marginBottom: 10 }}
        />

        {depositParams.pagination?.total ? (
          <>
            {/* Total display */}
            <div style={{ marginBottom: 16, textAlign: "right" }}>
              <span style={{ fontSize: 16, fontWeight: "bold" }}>
                Tổng số: {depositParams.pagination.total} giao dịch
              </span>
            </div>

            {/* Deposit Filters */}
            <div className="filter-section" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={8}>
                  <Input
                    placeholder="Mã thanh toán"
                    value={depositOrderId}
                    onChange={(e) => setDepositOrderId(e.target.value)}
                  />
                </Col>
                <Col span={8}>
                  <Select
                    placeholder="Trạng thái"
                    style={{ width: "100%" }}
                    allowClear
                    value={depositStatus}
                    onChange={(value) => setDepositStatus(value)}
                  >
                    <Option value={PaymentStatus.PENDING}>
                      Chờ thanh toán
                    </Option>
                    <Option value={PaymentStatus.SUCCESS}>Thành công</Option>
                    <Option value={PaymentStatus.FAILED}>Thất bại</Option>
                  </Select>
                </Col>
                <Col span={8}>
                  <Button type="primary" onClick={handleDepositFilterChange}>
                    Lọc
                  </Button>
                  <Button
                    style={{ marginLeft: 8 }}
                    onClick={() => {
                      setDepositOrderId(undefined);
                      setDepositStatus(undefined);
                      fetchDeposits({
                        ...depositParams,
                        pagination: {
                          ...depositParams.pagination,
                          current: 1,
                        },
                      });
                    }}
                  >
                    Đặt lại
                  </Button>
                </Col>
              </Row>
            </div>

            <Table
              rowKey="id"
              columns={depositColumns}
              dataSource={deposits}
              pagination={depositParams.pagination}
              loading={loadingDeposits}
              onChange={handleDepositTableChange}
              scroll={{ x: 1300 }}
            />
          </>
        ) : (
          <Alert
            message="Tạm thời chưa có yêu cầu nào"
            type="warning"
            showIcon
          />
        )}
      </SectionCard>

      {/* Withdrawal Section */}
      <SectionCard title="Lệnh rút tiền">
        <Alert
          message="* Lệnh rút tiền chỉ có thể xác nhận 1 lần duy nhất"
          type="info"
          showIcon
          style={{ marginBottom: 10 }}
        />

        {withdrawParams.pagination?.total ? (
          <>
            {/* Total display */}
            <div style={{ marginBottom: 16, textAlign: "right" }}>
              <span style={{ fontSize: 16, fontWeight: "bold" }}>
                Tổng số: {withdrawParams.pagination.total} giao dịch
              </span>
            </div>

            {/* Withdraw Filters */}
            <div className="filter-section" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={8}>
                  <Input
                    placeholder="Mã rút tiền"
                    value={withdrawOrderId}
                    onChange={(e) => setWithdrawOrderId(e.target.value)}
                  />
                </Col>
                <Col span={8}>
                  <Select
                    placeholder="Trạng thái"
                    style={{ width: "100%" }}
                    allowClear
                    value={withdrawStatus}
                    onChange={(value) => setWithdrawStatus(value)}
                  >
                    <Option value={WithdrawStatus.PENDING}>Chờ xác nhận</Option>
                    <Option value={WithdrawStatus.COMPLETED}>Thành công</Option>
                    <Option value={WithdrawStatus.REJECTED}>Đã hủy</Option>
                  </Select>
                </Col>
                <Col span={8}>
                  <Button type="primary" onClick={handleWithdrawFilterChange}>
                    Lọc
                  </Button>
                  <Button
                    style={{ marginLeft: 8 }}
                    onClick={() => {
                      setWithdrawOrderId(undefined);
                      setWithdrawStatus(undefined);
                      fetchWithdraws({
                        ...withdrawParams,
                        pagination: {
                          ...withdrawParams.pagination,
                          current: 1,
                        },
                      });
                    }}
                  >
                    Đặt lại
                  </Button>
                </Col>
              </Row>
            </div>

            <Table
              rowKey="id"
              columns={withdrawColumns}
              dataSource={withdraws}
              pagination={withdrawParams.pagination}
              loading={loadingWithdraws}
              onChange={handleWithdrawTableChange}
              scroll={{ x: 1300 }}
            />
          </>
        ) : (
          <Alert
            message="Tạm thời chưa có yêu cầu nào"
            type="warning"
            showIcon
          />
        )}
      </SectionCard>

      {/* Confirm Modal */}
      <Modal
        title={`Xác nhận ${
          confirmModal.type === "deposit" ? "nạp tiền" : "rút tiền"
        }`}
        visible={confirmModal.visible}
        onOk={handleConfirm}
        onCancel={() => setConfirmModal({ visible: false, id: 0, type: "" })}
        okText="Xác nhận"
        cancelText="Đóng"
      >
        <p>
          Bạn có chắc chắn muốn xác nhận{" "}
          {confirmModal.type === "deposit" ? "lệnh nạp tiền" : "lệnh rút tiền"}{" "}
          này không?
        </p>
      </Modal>

      {/* Cancel Modal */}
      <Modal
        title={`Hủy ${
          rejectModal.type === "deposit" ? "nạp tiền" : "rút tiền"
        }`}
        visible={rejectModal.visible}
        onOk={handleCancel}
        onCancel={() => setRejectModal({ visible: false, id: 0, type: "" })}
        okText="Xác nhận"
        cancelText="Đóng"
      >
        <p>
          Bạn có chắc chắn muốn hủy{" "}
          {rejectModal.type === "deposit" ? "lệnh nạp tiền" : "lệnh rút tiền"}{" "}
          này không?
        </p>
      </Modal>
    </div>
  );
};

export default CustomerTransactions;
