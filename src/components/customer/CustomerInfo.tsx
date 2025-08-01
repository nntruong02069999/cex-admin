import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Button,
  Descriptions,
  Spin,
  message,
  Modal,
  Form,
  Radio,
  InputNumber,
  Input,
  Select,
} from "antd";
import { EditOutlined } from "@ant-design/icons";
import SectionCard from "./common/SectionCard";
import PasswordContent from "@src/packages/pro-component/schema/PasswordContent";
import { useParams } from "react-router-dom";
import {
  getCustomerInfo,
  adminDeposit,
  adminWithdraw,
  updateCustomerInfo,
  lockUnlockCustomer,
  getListAgencyLevel,
  updateAgencyLevel,
  updateTotalVolumnBet,
  addWheelSpin,
} from "@src/services/customer";
import { CustomerInfoResponse, AgencyLevel } from "@src/interfaces/Customer";
import moment from "moment";

const SITE_KEY = process.env.REACT_APP_RECAPTCHA_SITE_KEY;

interface RouteParams {
  customerId?: string;
}

interface TransactionFormValues {
  amount: number;
  inRevenue: boolean;
}

const CustomerInfo: React.FC = () => {
  const { customerId } = useParams<RouteParams>();
  const [loading, setLoading] = useState(false);
  const [customerData, setCustomerData] = useState<CustomerInfoResponse | null>(
    null
  );
  const [depositModalVisible, setDepositModalVisible] = useState(false);
  const [withdrawModalVisible, setWithdrawModalVisible] = useState(false);
  const [transactionLoading, setTransactionLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [lockLoading, setLockLoading] = useState(false);
  const [agencyLevelModalVisible, setAgencyLevelModalVisible] = useState(false);
  const [agencyLevels, setAgencyLevels] = useState<AgencyLevel[]>([]);
  const [agencyLevelLoading, setAgencyLevelLoading] = useState(false);
  const [, setSelectedAgencyLevel] = useState<number | null>(null);
  const [volumnBetModalVisible, setVolumnBetModalVisible] = useState(false);
  const [volumnBetLoading, setVolumnBetLoading] = useState(false);
  const [wheelSpinModalVisible, setWheelSpinModalVisible] = useState(false);
  const [wheelSpinLoading, setWheelSpinLoading] = useState(false);

  const [depositForm] = Form.useForm();
  const [withdrawForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [agencyLevelForm] = Form.useForm();
  const [volumnBetForm] = Form.useForm();
  const [wheelSpinForm] = Form.useForm();

  // Load reCAPTCHA script
  const loadScriptByURL = (id: string, url: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const isScriptExist = document.getElementById(id);

      if (!isScriptExist) {
        const script = document.createElement("script");
        script.type = "text/javascript";
        script.src = url;
        script.id = id;
        script.onload = () => resolve();
        script.onerror = (error) => reject(error);
        document.body.appendChild(script);
      } else {
        resolve();
      }
    });
  };

  useEffect(() => {
    if (customerId) {
      // Load the reCAPTCHA script then fetch data
      setLoading(true);
      loadScriptByURL(
        "recaptcha-key",
        `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`
      )
        .then(() => {
          // Wait a bit to make sure grecaptcha is initialized
          setTimeout(() => {
            fetchCustomerData();
          }, 500);
        })
        .catch((error) => {
          console.error("Error loading reCAPTCHA script:", error);
          setLoading(false);
          message.error("Failed to load reCAPTCHA for verification");
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId]);

  const fetchCustomerData = async () => {
    if (!customerId || !SITE_KEY) return;

    try {
      // Check if grecaptcha is available
      if (!window.grecaptcha || !window.grecaptcha.ready) {
        throw new Error("reCAPTCHA not loaded properly");
      }

      // Execute reCAPTCHA to get token
      window.grecaptcha.ready(() => {
        window.grecaptcha
          .execute(SITE_KEY, { action: "submit" })
          .then(async (token: string) => {
            try {
              const result = await getCustomerInfo(parseInt(customerId), token);
              if (result && result.data) {
                setCustomerData(result.data);
              } else {
                message.error(
                  result.message || "Failed to fetch customer information"
                );
              }
            } catch (error) {
              message.error("Error fetching customer information");
              console.error(error);
            } finally {
              setLoading(false);
            }
          })
          .catch((error: any) => {
            console.error("reCAPTCHA error:", error);
            message.error("Error with reCAPTCHA verification");
            setLoading(false);
          });
      });
    } catch (error) {
      console.error("Error:", error);
      setLoading(false);
      message.error("Error initializing verification system");
    }
  };

  // Format currency
  const formatCurrency = (value: number | null) => {
    if (value === null || value === undefined) return "₹0";
    return `₹${value.toLocaleString("en-US")}`;
  };

  // Format date
  const formatDate = (timestamp: number | null | undefined) => {
    if (!timestamp) return "-";
    return moment(timestamp).format("DD/MM/YYYY HH:mm:ss");
  };

  // Handle deposit modal
  const showDepositModal = () => {
    depositForm.resetFields();
    setDepositModalVisible(true);
  };

  // Handle withdraw modal
  const showWithdrawModal = () => {
    withdrawForm.resetFields();
    setWithdrawModalVisible(true);
  };

  // Handle deposit submission
  const handleDeposit = async (values: TransactionFormValues) => {
    if (!customerId || !SITE_KEY) return;

    setTransactionLoading(true);
    try {
      // Execute reCAPTCHA to get token
      window.grecaptcha.ready(() => {
        window.grecaptcha
          .execute(SITE_KEY, { action: "submit" })
          .then(async (token: string) => {
            try {
              const result = await adminDeposit(
                parseInt(customerId),
                values.amount,
                token,
                values.inRevenue
              );

              if (result && result.code === 0) {
                message.success("Nạp tiền thành công");
                setDepositModalVisible(false);
                // Refresh customer data
                fetchCustomerData();
              } else {
                message.error(result.message || "Nạp tiền thất bại");
              }
            } catch (error) {
              console.error("Error:", error);
              message.error("Đã xảy ra lỗi khi nạp tiền");
            } finally {
              setTransactionLoading(false);
            }
          })
          .catch((error: any) => {
            console.error("reCAPTCHA error:", error);
            message.error("Lỗi xác thực reCAPTCHA");
            setTransactionLoading(false);
          });
      });
    } catch (error) {
      console.error("Error:", error);
      setTransactionLoading(false);
      message.error("Đã xảy ra lỗi khi nạp tiền");
    }
  };

  // Handle withdraw submission
  const handleWithdraw = async (values: TransactionFormValues) => {
    if (!customerId || !SITE_KEY) return;

    setTransactionLoading(true);
    try {
      // Execute reCAPTCHA to get token
      window.grecaptcha.ready(() => {
        window.grecaptcha
          .execute(SITE_KEY, { action: "submit" })
          .then(async (token: string) => {
            try {
              const result = await adminWithdraw(
                parseInt(customerId),
                values.amount,
                token,
                values.inRevenue
              );

              if (result && result.code === 0) {
                message.success("Rút tiền thành công");
                setWithdrawModalVisible(false);
                // Refresh customer data
                fetchCustomerData();
              } else {
                message.error(result.message || "Rút tiền thất bại");
              }
            } catch (error) {
              console.error("Error:", error);
              message.error("Đã xảy ra lỗi khi rút tiền");
            } finally {
              setTransactionLoading(false);
            }
          })
          .catch((error: any) => {
            console.error("reCAPTCHA error:", error);
            message.error("Lỗi xác thực reCAPTCHA");
            setTransactionLoading(false);
          });
      });
    } catch (error) {
      console.error("Error:", error);
      setTransactionLoading(false);
      message.error("Đã xảy ra lỗi khi rút tiền");
    }
  };

  // Show edit modal
  const showEditModal = () => {
    editForm.resetFields();
    if (customerData) {
      editForm.setFieldsValue({
        name: customerData.customerInfo.name,
      });
    }
    setEditModalVisible(true);
  };

  // Handle edit submission
  const handleEditSubmit = async (values: { name: string }) => {
    if (!customerId) return;

    setEditLoading(true);
    try {
      const result = await updateCustomerInfo(
        parseInt(customerId),
        values.name
      );

      if (result && result.code === 0) {
        message.success("Cập nhật thông tin khách hàng thành công");
        setEditModalVisible(false);
        // Refresh customer data
        fetchCustomerData();
      } else {
        message.error(result.message || "Cập nhật thông tin thất bại");
      }
    } catch (error) {
      console.error("Error:", error);
      message.error("Đã xảy ra lỗi khi cập nhật thông tin");
    } finally {
      setEditLoading(false);
    }
  };

  // Handle lock/unlock
  const handleLockUnlock = async () => {
    if (!customerId || !customerData) return;

    setLockLoading(true);
    try {
      const action = customerData.customerInfo.isBlocked ? "unlock" : "lock";
      const result = await lockUnlockCustomer(parseInt(customerId), action);

      if (result && result.code === 0) {
        message.success(
          action === "lock"
            ? "Khóa tài khoản thành công"
            : "Mở khóa tài khoản thành công"
        );
        // Refresh customer data
        fetchCustomerData();
      } else {
        message.error(
          result.message ||
            `${action === "lock" ? "Khóa" : "Mở khóa"} tài khoản thất bại`
        );
      }
    } catch (error) {
      console.error("Error:", error);
      message.error("Đã xảy ra lỗi khi thực hiện thao tác");
    } finally {
      setLockLoading(false);
    }
  };

  // Show agency level modal
  const showAgencyLevelModal = async () => {
    setAgencyLevelLoading(true);
    setAgencyLevelModalVisible(true);

    try {
      const result = await getListAgencyLevel();
      if (result && result.code === 0 && result.data) {
        setAgencyLevels(result.data);
        // Set current agency level as default
        if (customerData?.agencyCustomer?.currentLevelId) {
          setSelectedAgencyLevel(customerData.agencyCustomer.currentLevelId);
          agencyLevelForm.setFieldsValue({
            agencyLevelId: customerData.agencyCustomer.currentLevelId,
          });
        }
      } else {
        message.error(
          result.message || "Không thể tải danh sách cấp bậc đại lý"
        );
      }
    } catch (error) {
      console.error("Error loading agency levels:", error);
      message.error("Đã xảy ra lỗi khi tải danh sách cấp bậc đại lý");
    } finally {
      setAgencyLevelLoading(false);
    }
  };

  // Handle agency level update
  const handleUpdateAgencyLevel = async (values: { agencyLevelId: number }) => {
    if (!customerId) return;

    setAgencyLevelLoading(true);
    try {
      const result = await updateAgencyLevel(
        parseInt(customerId),
        values.agencyLevelId
      );

      if (result && result.code === 0) {
        message.success("Cập nhật cấp bậc đại lý thành công");
        setAgencyLevelModalVisible(false);
        // Refresh customer data
        fetchCustomerData();
      } else {
        message.error(result.message || "Cập nhật cấp bậc đại lý thất bại");
      }
    } catch (error) {
      console.error("Error:", error);
      message.error("Đã xảy ra lỗi khi cập nhật cấp bậc đại lý");
    } finally {
      setAgencyLevelLoading(false);
    }
  };

  // Show volumn bet modal
  const showVolumnBetModal = () => {
    volumnBetForm.resetFields();
    if (customerData?.customerMoney?.totalVolumnBet) {
      volumnBetForm.setFieldsValue({
        totalVolumnBet: customerData.customerMoney.totalVolumnBet,
      });
    }
    setVolumnBetModalVisible(true);
  };

  // Handle volumn bet update
  const handleUpdateVolumnBet = async (values: { totalVolumnBet: number }) => {
    if (!customerId) return;

    setVolumnBetLoading(true);
    try {
      const result = await updateTotalVolumnBet(
        parseInt(customerId),
        values.totalVolumnBet
      );

      if (result && result.code === 0) {
        message.success("Cập nhật điều kiện vol cược thành công");
        setVolumnBetModalVisible(false);
        // Refresh customer data
        fetchCustomerData();
      } else {
        message.error(result.message || "Cập nhật điều kiện vol cược thất bại");
      }
    } catch (error) {
      console.error("Error:", error);
      message.error("Đã xảy ra lỗi khi cập nhật điều kiện vol cược");
    } finally {
      setVolumnBetLoading(false);
    }
  };

  // Show wheel spin modal
  const showWheelSpinModal = () => {
    wheelSpinForm.resetFields();
    setWheelSpinModalVisible(true);
  };

  // Handle wheel spin addition
  const handleAddWheelSpin = async (values: { amount: number }) => {
    if (!customerId) return;

    setWheelSpinLoading(true);
    try {
      const result = await addWheelSpin(parseInt(customerId), values.amount);

      if (result && result.code === 0) {
        message.success("Cộng lượt quay thưởng thành công");
        setWheelSpinModalVisible(false);
        // Refresh customer data
        fetchCustomerData();
      } else {
        message.error(result.message || "Cộng lượt quay thưởng thất bại");
      }
    } catch (error) {
      console.error("Error:", error);
      message.error("Đã xảy ra lỗi khi cộng lượt quay thưởng");
    } finally {
      setWheelSpinLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="customer-info">
      {/* Personal Information */}
      <SectionCard title="Thông tin cá nhân">
        <Row>
          <Col span={24}>
            <div style={{ marginBottom: 10 }}>
              <div>Đại lý</div>
              <div>
                <Button size="small" type="primary">
                  Admin hệ thống
                </Button>
              </div>
            </div>

            <div style={{ marginBottom: 10 }}>
              <div>Người giới thiệu</div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>
                  {customerData?.inviteCustomer
                    ? `ID ${customerData.inviteCustomer.id} - ${customerData.inviteCustomer.name}`
                    : customerData?.customerInfo.inviterCustomerId
                    ? `ID ${customerData?.customerInfo.inviterCustomerId}`
                    : "Không có"}
                </span>
                {/* <Button
                  style={{ background: "#d9534f", color: "white" }}
                  icon={<EditOutlined />}
                  size="small"
                >
                  Đổi người giới thiệu
                </Button> */}
              </div>
            </div>

            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Tài khoản Marketing">
                {customerData?.customerInfo.isFrom91Club
                  ? "Phải"
                  : "Không phải"}
              </Descriptions.Item>
              <Descriptions.Item label="ID tài khoản">
                {customerData?.customerInfo.id || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Cấp bậc đại lý">
                <span>
                  {customerData?.agencyCustomer?.currentLevel ||
                    "Chưa có cấp bậc"}
                </span>
                <Button
                  size="small"
                  icon={<EditOutlined />}
                  style={{ marginLeft: 10 }}
                  onClick={showAgencyLevelModal}
                >
                  Sửa
                </Button>
              </Descriptions.Item>
              <Descriptions.Item label="Họ tên">
                {customerData?.customerInfo.name || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {customerData?.customerInfo.email || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">
                {customerData?.customerInfo.phone || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Tài khoản từ 91Club">
                {customerData?.customerInfo.isFrom91Club ? "Đúng" : "Sai"}
                {customerData?.customerInfo.isFrom91Club && (
                  <div style={{ marginTop: 5 }}>
                    <strong>Mật khẩu gốc:</strong>{" "}
                    <PasswordContent
                      content={customerData?.customerInfo.passwordOld || ""}
                    />
                  </div>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Mật khẩu">
                <PasswordContent
                  content={customerData?.customerInfo.password || ""}
                />
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tham gia">
                {formatDate(customerData?.customerInfo.createdAt)}
              </Descriptions.Item>
              <Descriptions.Item label="Lần hoạt động cuối">
                {formatDate(customerData?.customerInfo.userLoginDate)}
              </Descriptions.Item>
              <Descriptions.Item label="Ip đăng nhập cuối">
                <span>{customerData?.lastLogin?.ipLogin || "-"}</span>
                <button
                  type="button"
                  onClick={() => {}}
                  style={{
                    marginLeft: 10,
                    background: "none",
                    border: "none",
                    color: "#1890ff",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  Info Updat
                </button>
              </Descriptions.Item>
              <Descriptions.Item label="Ip tạo tài khoản">
                <span>{customerData?.firstLogin?.ipLogin || "-"}</span>
                <button
                  type="button"
                  onClick={() => {}}
                  style={{
                    marginLeft: 10,
                    background: "none",
                    border: "none",
                    color: "#1890ff",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  Info Updat
                </button>
              </Descriptions.Item>
            </Descriptions>

            <div style={{ margin: "10px 0" }}>
              Cần hoàn thành vol cược nạp tiền và các yêu cầu của sự kiện mới có
              thể rút tiền
            </div>

            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Điều kiện vol cược (nạp tiền)">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    {(customerData?.customerMoney?.totalVolumnBet || 0) ===
                    0 ? (
                      <div>
                        <Button
                          size="small"
                          style={{
                            backgroundColor: "#52c41a",
                            color: "white",
                            border: "none",
                          }}
                        >
                          Đã hoàn thành
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <Button
                          size="small"
                          style={{
                            backgroundColor: "#ff4d4f",
                            color: "white",
                            border: "none",
                          }}
                        >
                          Chưa hoàn thành
                        </Button>
                        <div
                          style={{
                            marginTop: 5,
                            fontSize: "12px",
                            color: "#666",
                          }}
                        >
                          Cần đặt cược{" "}
                          {formatCurrency(
                            customerData?.customerMoney?.totalVolumnBet || 0
                          )}{" "}
                          để hoàn thành
                        </div>
                      </div>
                    )}
                  </div>
                  <Button
                    size="small"
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={showVolumnBetModal}
                  >
                    Thay đổi điều kiện
                  </Button>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Nạp đầu">
                {formatCurrency(customerData?.customerMoney?.totalDeposit || 0)}
              </Descriptions.Item>
            </Descriptions>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 10,
              }}
            >
              <Button
                icon={<EditOutlined />}
                style={{ flex: 1, marginRight: 5 }}
                onClick={showEditModal}
              >
                Sửa thông tin
              </Button>
              <Button
                danger
                style={{ flex: 1 }}
                loading={lockLoading}
                onClick={handleLockUnlock}
              >
                {customerData?.customerInfo.isBlocked
                  ? "Mở khóa tài khoản"
                  : "Khóa tài khoản"}
              </Button>
            </div>
          </Col>
        </Row>
      </SectionCard>

      {/* Bank Information */}
      <SectionCard title="Thông tin ngân hàng">
        {customerData?.bankInfo && customerData.bankInfo.length > 0 ? (
          customerData.bankInfo.map((bank, index) => (
            <div
              key={bank.id}
              style={{
                marginBottom: index < customerData.bankInfo.length - 1 ? 20 : 0,
              }}
            >
              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="Ngân hàng">
                  {bank.bankName}
                </Descriptions.Item>
                <Descriptions.Item label="Chủ tài khoản">
                  {bank.name}
                </Descriptions.Item>
                <Descriptions.Item label="Số tài khoản">
                  {bank.bankAccountNumber || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Số điện thoại">
                  {bank.phoneNumber || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Chi nhánh">
                  {bank.IFSCCode || "-"}
                </Descriptions.Item>
              </Descriptions>

              <Button
                type="primary"
                style={{ marginTop: 10 }}
                disabled={!bank.isPinned}
              >
                {bank.isPinned
                  ? "Đang chọn tài khoản này"
                  : "Chọn tài khoản này"}
              </Button>

              <Button
                icon={<EditOutlined />}
                style={{ marginTop: 10, float: "right" }}
              >
                Sửa thông tin
              </Button>
            </div>
          ))
        ) : (
          <div>Không có thông tin</div>
        )}
      </SectionCard>

      {/* USDT Information */}
      <SectionCard title="Thông tin ví USDT">
        {customerData?.usdtBankInfo && customerData.usdtBankInfo.length > 0 ? (
          customerData.usdtBankInfo.map((bank, index) => (
            <div
              key={bank.id}
              style={{
                marginBottom:
                  index < customerData.usdtBankInfo.length - 1 ? 20 : 0,
              }}
            >
              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="Tên ví">
                  {bank.name}
                </Descriptions.Item>
                <Descriptions.Item label="Địa chỉ ví">
                  {bank.usdtAddress || "-"}
                </Descriptions.Item>
              </Descriptions>

              <Button
                type="primary"
                style={{ marginTop: 10 }}
                disabled={!bank.isPinned}
              >
                {bank.isPinned ? "Đang chọn ví này" : "Chọn ví này"}
              </Button>

              <Button
                icon={<EditOutlined />}
                style={{ marginTop: 10, float: "right" }}
              >
                Sửa thông tin
              </Button>
            </div>
          ))
        ) : (
          <div>Không có thông tin</div>
        )}
      </SectionCard>

      {/* Balance Information */}
      <SectionCard title="Thông tin số dư">
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="Nạp tiền">
            <div>
              Thường: +
              {formatCurrency(customerData?.customerMoney?.totalDeposit || 0)}
            </div>
            <div>
              Marketing: +
              {formatCurrency(
                customerData?.customerMoney?.totalDepositMarketing || 0
              )}
            </div>
          </Descriptions.Item>
          <Descriptions.Item label="Admin cộng tiền (tính vào doanh thu)">
            +
            {formatCurrency(
              customerData?.customerMoney?.totalAdminDepositInRevenue || 0
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Admin cộng tiền (không tính vào doanh thu)">
            +
            {formatCurrency(
              customerData?.customerMoney?.totalAdminDepositNotInRevenue || 0
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Rút tiền">
            <div>
              Thường: -
              {formatCurrency(customerData?.customerMoney?.totalWithdraw || 0)}
            </div>
            <div>
              Marketing: -
              {formatCurrency(
                customerData?.customerMoney?.totalWithdrawMarketing || 0
              )}
            </div>
          </Descriptions.Item>
          <Descriptions.Item label="Admin trừ tiền (tính vào chi phí)">
            -
            {formatCurrency(
              customerData?.customerMoney?.totalAdminWithdrawInRevenue || 0
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Admin trừ tiền (không tính vào chi phí)">
            -
            {formatCurrency(
              customerData?.customerMoney?.totalAdminWithdrawNotInRevenue || 0
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Hoa hồng">
            +{formatCurrency(customerData?.customerMoney?.totalCommission || 0)}
          </Descriptions.Item>
          <Descriptions.Item label="Thưởng sự kiện nhiệm vụ">
            +
            {formatCurrency(
              customerData?.customerMoney?.totalEventMission || 0
            )}
            <Button size="small" type="primary" style={{ float: "right" }}>
              Chi tiết
            </Button>
          </Descriptions.Item>
          <Descriptions.Item label="Thưởng nạp đầu">
            +
            {formatCurrency(
              customerData?.customerMoney?.totalRewardFirstDeposit || 0
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Thưởng thành viên cấp dưới nạp đầu">
            +
            {formatCurrency(
              customerData?.customerMoney?.totalRewardMembersFirstDeposit || 0
            )}
            <Button size="small" type="primary" style={{ float: "right" }}>
              Chi tiết
            </Button>
          </Descriptions.Item>
          <Descriptions.Item label="Hoàn cược">
            +
            {formatCurrency(
              customerData?.customerMoney?.totalRefundBetAmount || 0
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Thưởng nhiệm vụ hàng ngày">
            +
            {formatCurrency(
              customerData?.customerMoney?.totalDailyQuestRewards || 0
            )}
            <Button size="small" type="primary" style={{ float: "right" }}>
              Chi tiết
            </Button>
          </Descriptions.Item>
          <Descriptions.Item label="Số dư hiện tại">
            {formatCurrency(customerData?.customerMoney?.balance || 0)}
          </Descriptions.Item>
        </Descriptions>

        <div
          style={{
            marginTop: 10,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Button
            type="primary"
            style={{ background: "#5cb85c" }}
            onClick={showDepositModal}
          >
            Cộng tiền
          </Button>
          <Button
            type="primary"
            style={{ background: "#d9534f" }}
            onClick={showWithdrawModal}
          >
            Trừ tiền
          </Button>
        </div>
      </SectionCard>

      {/* Income/Expense Details */}
      <SectionCard title="Chi tiết thu chi">
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="Tổng thu">
            {formatCurrency(
              (customerData?.customerMoney?.totalDeposit || 0) +
                (customerData?.customerMoney?.totalDepositMarketing || 0) +
                (customerData?.customerMoney?.totalAdminDepositInRevenue || 0) +
                (customerData?.customerMoney?.totalAdminDepositNotInRevenue ||
                  0) +
                (customerData?.customerMoney?.totalCommission || 0) +
                (customerData?.customerMoney?.totalEventMission || 0) +
                (customerData?.customerMoney?.totalRewardFirstDeposit || 0) +
                (customerData?.customerMoney?.totalRewardMembersFirstDeposit ||
                  0) +
                (customerData?.customerMoney?.totalRefundBetAmount || 0) +
                (customerData?.customerMoney?.totalDailyQuestRewards || 0)
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Tổng chi">
            -
            {formatCurrency(
              (customerData?.customerMoney?.totalWithdraw || 0) +
                (customerData?.customerMoney?.totalWithdrawMarketing || 0) +
                (customerData?.customerMoney?.totalAdminWithdrawInRevenue ||
                  0) +
                (customerData?.customerMoney?.totalAdminWithdrawNotInRevenue ||
                  0)
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Lợi nhuận">
            {formatCurrency(
              (customerData?.customerMoney?.totalDeposit || 0) +
                (customerData?.customerMoney?.totalDepositMarketing || 0) +
                (customerData?.customerMoney?.totalAdminDepositInRevenue || 0) +
                (customerData?.customerMoney?.totalAdminDepositNotInRevenue ||
                  0) +
                (customerData?.customerMoney?.totalCommission || 0) +
                (customerData?.customerMoney?.totalEventMission || 0) +
                (customerData?.customerMoney?.totalRewardFirstDeposit || 0) +
                (customerData?.customerMoney?.totalRewardMembersFirstDeposit ||
                  0) +
                (customerData?.customerMoney?.totalRefundBetAmount || 0) +
                (customerData?.customerMoney?.totalDailyQuestRewards || 0) -
                ((customerData?.customerMoney?.totalWithdraw || 0) +
                  (customerData?.customerMoney?.totalWithdrawMarketing || 0) +
                  (customerData?.customerMoney?.totalAdminWithdrawInRevenue ||
                    0) +
                  (customerData?.customerMoney
                    ?.totalAdminWithdrawNotInRevenue || 0))
            )}
          </Descriptions.Item>
        </Descriptions>
      </SectionCard>

      {/* Check Deposit and Betting Volume */}
      <SectionCard title="Check tiền nạp, Vol cược">
        <div
          style={{
            marginBottom: 10,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <div className="date-range">
            {moment().format("DD/MM/YYYY")}-{moment().format("DD/MM/YYYY")}
          </div>
          <Button>Hôm nay</Button>
        </div>

        <Row gutter={[8, 8]}>
          <Col span={8}>
            <div className="stat-card">
              <div>
                {formatCurrency(
                  customerData?.customerMoney?.totalBetAmount || 0
                )}
              </div>
              <div>Tổng vol (F1{"->"}Fn)</div>
            </div>
          </Col>
          <Col span={8}>
            <div className="stat-card">
              <div>
                {formatCurrency(
                  customerData?.customerMoney?.totalCommission || 0
                )}
              </div>
              <div>Tổng hoa hồng</div>
            </div>
          </Col>
          <Col span={8}>
            <div className="stat-card">
              <div>
                {formatCurrency(
                  customerData?.customerMoney?.totalBetAmount || 0
                )}
              </div>
              <div>Vol Bet (F0)</div>
            </div>
          </Col>
        </Row>

        <Row gutter={[8, 8]} style={{ marginTop: 8 }}>
          <Col span={8}>
            <div className="stat-card">
              <div>
                {formatCurrency(customerData?.customerMoney?.totalDeposit || 0)}
              </div>
              <div>Số tiền nạp F1</div>
            </div>
          </Col>
          <Col span={8}>
            <div className="stat-card">
              <div>0</div>
              <div>số lần nạp F1</div>
            </div>
          </Col>
          <Col span={8}>
            <div className="stat-card">
              <div>
                {formatCurrency(
                  customerData?.customerMoney?.totalBetAmount || 0
                )}
              </div>
              <div>Vol F1</div>
            </div>
          </Col>
        </Row>

        <Row style={{ marginTop: 8 }}>
          <Col span={24}>
            <div className="stat-card">
              <div>Đại lý</div>
              <div>
                {customerData?.customerInfo.isFrom91Club
                  ? "Đại lý"
                  : "Không phải đại lý"}
              </div>
            </div>
          </Col>
        </Row>
      </SectionCard>

      {/* Lucky Wheel */}
      <SectionCard title="Lucky Wheel">
        <table style={{ width: "100%" }}>
          <thead>
            <tr>
              <th
                style={{
                  background: "#6c7293",
                  color: "white",
                  padding: "8px",
                }}
              >
                Loại
              </th>
              <th
                style={{
                  background: "#6c7293",
                  color: "white",
                  padding: "8px",
                }}
              >
                Số lượt
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: "8px" }}>Lượt quay hiện tại:</td>
              <td style={{ padding: "8px" }}>
                {customerData?.wheelSpinUserBalance?.currentSpins || 0}
              </td>
            </tr>
            <tr style={{ background: "#f9f9f9" }}>
              <td style={{ padding: "8px" }}>Tổng lượt đã sử dụng:</td>
              <td style={{ padding: "8px" }}>
                {customerData?.wheelSpinUserBalance?.totalUsed || 0}
              </td>
            </tr>
            <tr>
              <td style={{ padding: "8px" }}>Tổng lượt đã nhận:</td>
              <td style={{ padding: "8px" }}>
                {customerData?.wheelSpinUserBalance?.totalEarned || 0}
              </td>
            </tr>
            <tr style={{ background: "#f9f9f9" }}>
              <td style={{ padding: "8px" }}>Ngày hết hạn:</td>
              <td style={{ padding: "8px" }}>
                {customerData?.wheelSpinUserBalance?.expiryDate
                  ? formatDate(customerData.wheelSpinUserBalance.expiryDate)
                  : "-"}
              </td>
            </tr>
          </tbody>
        </table>

        <Button
          type="primary"
          style={{ background: "#5cb85c", marginTop: 10, width: "100%" }}
          onClick={showWheelSpinModal}
        >
          Cộng lượt quay thưởng
        </Button>
      </SectionCard>

      {/* Deposit Modal */}
      <Modal
        title="Cộng tiền cho khách hàng"
        visible={depositModalVisible}
        onCancel={() => setDepositModalVisible(false)}
        footer={null}
      >
        <Form form={depositForm} layout="vertical" onFinish={handleDeposit}>
          <Form.Item
            name="amount"
            label="Số tiền"
            rules={[
              { required: true, message: "Vui lòng nhập số tiền" },
              { type: "number", min: 1, message: "Số tiền phải lớn hơn 0" },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              formatter={(value) =>
                value ? `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "₹"
              }
              parser={(value) => {
                if (typeof value !== "string") return "";
                const parsedValue = value.replace(/₹\s?|(,*)/g, "");
                return parsedValue === "" ? "" : parsedValue;
              }}
              placeholder="Nhập số tiền"
            />
          </Form.Item>
          <Form.Item
            name="inRevenue"
            label="Tính vào doanh thu"
            initialValue={false}
          >
            <Radio.Group>
              <Radio value={true}>Có</Radio>
              <Radio value={false}>Không</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                style={{ marginRight: 8 }}
                onClick={() => setDepositModalVisible(false)}
              >
                Hủy
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={transactionLoading}
              >
                Xác nhận
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      {/* Withdraw Modal */}
      <Modal
        title="Trừ tiền khách hàng"
        visible={withdrawModalVisible}
        onCancel={() => setWithdrawModalVisible(false)}
        footer={null}
      >
        <Form form={withdrawForm} layout="vertical" onFinish={handleWithdraw}>
          <Form.Item
            name="amount"
            label="Số tiền"
            rules={[
              { required: true, message: "Vui lòng nhập số tiền" },
              { type: "number", min: 1, message: "Số tiền phải lớn hơn 0" },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              formatter={(value) =>
                value ? `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "₹"
              }
              parser={(value) => {
                if (typeof value !== "string") return "";
                const parsedValue = value.replace(/₹\s?|(,*)/g, "");
                return parsedValue === "" ? "" : parsedValue;
              }}
              placeholder="Nhập số tiền"
            />
          </Form.Item>
          <Form.Item
            name="inRevenue"
            label="Tính vào chi phí"
            initialValue={false}
          >
            <Radio.Group>
              <Radio value={true}>Có</Radio>
              <Radio value={false}>Không</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                style={{ marginRight: 8 }}
                onClick={() => setWithdrawModalVisible(false)}
              >
                Hủy
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={transactionLoading}
              >
                Xác nhận
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Customer Modal */}
      <Modal
        title="Sửa thông tin khách hàng"
        visible={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
      >
        <Form form={editForm} layout="vertical" onFinish={handleEditSubmit}>
          <Form.Item
            name="name"
            label="Họ tên"
            rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
          >
            <Input placeholder="Nhập họ tên khách hàng" />
          </Form.Item>
          <Form.Item>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                style={{ marginRight: 8 }}
                onClick={() => setEditModalVisible(false)}
              >
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={editLoading}>
                Xác nhận
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      {/* Agency Level Modal */}
      <Modal
        title="Cập nhật cấp bậc đại lý"
        visible={agencyLevelModalVisible}
        onCancel={() => setAgencyLevelModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={agencyLevelForm}
          layout="vertical"
          onFinish={handleUpdateAgencyLevel}
        >
          <Form.Item
            name="agencyLevelId"
            label="Chọn cấp bậc đại lý"
            rules={[
              { required: true, message: "Vui lòng chọn cấp bậc đại lý" },
            ]}
          >
            <Select
              placeholder="Chọn cấp bậc đại lý"
              loading={agencyLevelLoading}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.children as string)
                  ?.toLowerCase()
                  .includes(input.toLowerCase())
              }
            >
              {agencyLevels.map((level) => (
                <Select.Option key={level.id} value={level.id}>
                  {level.level} - Yêu cầu:{" "}
                  {level.minTeamDeposit.toLocaleString()}₹ nạp tiền team,{" "}
                  {level.minTeamMemberLevel1} thành viên F1,{" "}
                  {level.minOwnBetting.toLocaleString()}₹ cược bản thân
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {/* Display current agency level info */}
          {customerData?.agencyCustomer && (
            <div
              style={{
                marginBottom: 16,
                padding: 12,
                backgroundColor: "#f5f5f5",
                borderRadius: 4,
              }}
            >
              <h4>Thông tin cấp bậc hiện tại:</h4>
              <p>
                <strong>Cấp bậc:</strong>{" "}
                {customerData.agencyCustomer.currentLevel}
              </p>
              <p>
                <strong>Số thành viên team:</strong>{" "}
                {customerData.agencyCustomer.currentTeamMembers}
              </p>
              <p>
                <strong>Số thành viên F1:</strong>{" "}
                {customerData.agencyCustomer.currentTeamMembersLevel1}
              </p>
              <p>
                <strong>Tổng cược team:</strong>{" "}
                {customerData.agencyCustomer.currentTeamBetting.toLocaleString()}
                ₹
              </p>
              <p>
                <strong>Tổng nạp team:</strong>{" "}
                {customerData.agencyCustomer.currentTeamDeposit.toLocaleString()}
                ₹
              </p>
              <p>
                <strong>Cược bản thân:</strong>{" "}
                {customerData.agencyCustomer.currentOwnBetting.toLocaleString()}
                ₹
              </p>
            </div>
          )}

          <Form.Item>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                style={{ marginRight: 8 }}
                onClick={() => setAgencyLevelModalVisible(false)}
              >
                Hủy
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={agencyLevelLoading}
              >
                Cập nhật
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      {/* Volume Bet Modal */}
      <Modal
        title="Thay đổi điều kiện vol cược"
        visible={volumnBetModalVisible}
        onCancel={() => setVolumnBetModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form
          form={volumnBetForm}
          layout="vertical"
          onFinish={handleUpdateVolumnBet}
        >
          <Form.Item
            name="totalVolumnBet"
            label="Điều kiện vol cược (₹)"
            rules={[
              { required: true, message: "Vui lòng nhập điều kiện vol cược" },
              {
                type: "number",
                min: 0,
                message: "Số tiền phải lớn hơn hoặc bằng 0",
              },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              formatter={(value) =>
                value ? `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "₹"
              }
              parser={(value) => {
                if (typeof value !== "string") return "";
                const parsedValue = value.replace(/₹\s?|(,*)/g, "");
                return parsedValue === "" ? "" : parsedValue;
              }}
              placeholder="Nhập điều kiện vol cược"
            />
          </Form.Item>

          <div
            style={{
              marginBottom: 16,
              padding: 12,
              backgroundColor: "#f5f5f5",
              borderRadius: 4,
            }}
          >
            <h4>Thông tin hiện tại:</h4>
            <p>
              <strong>Điều kiện vol cược hiện tại:</strong>{" "}
              {formatCurrency(customerData?.customerMoney?.totalVolumnBet || 0)}
            </p>
            <p>
              <strong>Trạng thái:</strong>{" "}
              {(customerData?.customerMoney?.totalVolumnBet || 0) === 0 ? (
                <span style={{ color: "#52c41a" }}>Đã hoàn thành</span>
              ) : (
                <span style={{ color: "#ff4d4f" }}>Chưa hoàn thành</span>
              )}
            </p>
          </div>

          <Form.Item>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                style={{ marginRight: 8 }}
                onClick={() => setVolumnBetModalVisible(false)}
              >
                Hủy
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={volumnBetLoading}
              >
                Cập nhật
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      {/* Wheel Spin Modal */}
      <Modal
        title="Cộng lượt quay thưởng"
        visible={wheelSpinModalVisible}
        onCancel={() => setWheelSpinModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form
          form={wheelSpinForm}
          layout="vertical"
          onFinish={handleAddWheelSpin}
        >
          <Form.Item
            name="amount"
            label="Số lượt quay cộng thêm"
            rules={[
              { required: true, message: "Vui lòng nhập số lượt quay" },
              {
                type: "number",
                min: 1,
                message: "Số lượt quay phải lớn hơn 0",
              },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              min={1}
              placeholder="Nhập số lượt quay"
            />
          </Form.Item>

          <div
            style={{
              marginBottom: 16,
              padding: 12,
              backgroundColor: "#f5f5f5",
              borderRadius: 4,
            }}
          >
            <h4>Thông tin hiện tại:</h4>
            <p>
              <strong>Lượt quay hiện tại:</strong>{" "}
              {customerData?.wheelSpinUserBalance?.currentSpins || 0}
            </p>
            <p>
              <strong>Tổng lượt đã nhận:</strong>{" "}
              {customerData?.wheelSpinUserBalance?.totalEarned || 0}
            </p>
            <p>
              <strong>Tổng lượt đã sử dụng:</strong>{" "}
              {customerData?.wheelSpinUserBalance?.totalUsed || 0}
            </p>
          </div>

          <Form.Item>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                style={{ marginRight: 8 }}
                onClick={() => setWheelSpinModalVisible(false)}
              >
                Hủy
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={wheelSpinLoading}
              >
                Cộng lượt quay
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CustomerInfo;
