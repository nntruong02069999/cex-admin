import React, { useState } from "react";
import {
  Space,
  Tooltip,
  Modal,
  InputNumber,
  message,
  Button,
  Dropdown,
  Menu,
} from "antd";
import {
  EyeOutlined,
  MoreOutlined,
  PlusCircleOutlined,
  MinusCircleOutlined,
  NotificationOutlined,
  MailOutlined,
} from "@ant-design/icons";
import { useHistory } from "react-router-dom";
import Captcha from "@src/packages/pro-component/schema/Captcha";
import {
  adminDeposit,
  adminWithdraw,
  toggleMarketingStatus,
  activeEmailCustomerManual,
} from "@src/services/customer";
import { CustomerListItem } from "./types";

interface CustomerActionsProps {
  customer: CustomerListItem;
  onSuccess: () => void;
}

type ActionType = "add" | "subtract" | null;

const CustomerActions: React.FC<CustomerActionsProps> = ({
  customer,
  onSuccess,
}) => {
  const history = useHistory();
  const [actionType, setActionType] = useState<ActionType>(null);
  const [amount, setAmount] = useState<number | undefined>();
  const [captchaToken, setCaptchaToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailModalVisible, setEmailModalVisible] = useState(false);
  const [emailCaptchaToken, setEmailCaptchaToken] = useState("");

  // Navigate to detail
  const handleViewDetail = () => {
    history.push(`/customer/${customer.id}`);
  };

  // Balance action modal
  const handleBalanceAction = (type: ActionType) => {
    setActionType(type);
    setAmount(undefined);
    setCaptchaToken("");
  };

  const handleBalanceConfirm = async () => {
    if (!amount || amount <= 0) {
      message.error("Vui lòng nhập số tiền hợp lệ");
      return;
    }
    if (!captchaToken) {
      message.error("Vui lòng nhập mã captcha");
      return;
    }

    setLoading(true);
    try {
      const serviceFn = actionType === "add" ? adminDeposit : adminWithdraw;
      const result = await serviceFn(customer.id, amount, captchaToken);

      if ("errorCode" in result) {
        message.error(result.message || "Thao tác thất bại");
      } else {
        message.success(
          actionType === "add"
            ? `Đã cộng ${amount} USDT cho ${
                customer.nickname || customer.email
              }`
            : `Đã trừ ${amount} USDT từ ${customer.nickname || customer.email}`,
        );
        setActionType(null);
        onSuccess();
      }
    } catch (err: any) {
      message.error(err.message || "Đã xảy ra lỗi");
    } finally {
      setLoading(false);
    }
  };

  const handleBalanceCancel = () => {
    setActionType(null);
    setAmount(undefined);
    setCaptchaToken("");
  };

  // Toggle marketing
  const handleToggleMarketing = async () => {
    const newStatus = !customer.isAccountMarketing;
    const action = newStatus ? "active" : "deactive";

    try {
      const result = await toggleMarketingStatus(customer.id, action);

      if ("errorCode" in result) {
        message.error(result.message || "Thao tác thất bại");
      } else {
        message.success(
          `Đã ${newStatus ? "bật" : "tắt"} marketing cho ${
            customer.nickname || customer.email
          }`,
        );
        onSuccess();
      }
    } catch (err: any) {
      message.error(err.message || "Đã xảy ra lỗi");
    }
  };

  // Activate email
  const handleActivateEmail = () => {
    setEmailModalVisible(true);
    setEmailCaptchaToken("");
  };

  const handleEmailConfirm = async () => {
    if (!emailCaptchaToken) {
      message.error("Vui lòng nhập mã captcha");
      return;
    }

    setLoading(true);
    try {
      const result = await activeEmailCustomerManual(
        customer.id,
        emailCaptchaToken,
      );

      if ("errorCode" in result) {
        message.error(result.message || "Thao tác thất bại");
      } else {
        message.success(
          `Đã kích hoạt email cho ${customer.nickname || customer.email}`,
        );
        setEmailModalVisible(false);
        onSuccess();
      }
    } catch (err: any) {
      message.error(err.message || "Đã xảy ra lỗi");
    } finally {
      setLoading(false);
    }
  };

  // Dropdown menu for secondary actions
  const menu = (
    <Menu>
      <Menu.Item
        key="add"
        icon={<PlusCircleOutlined style={{ color: "#52c41a" }} />}
        onClick={() => handleBalanceAction("add")}
      >
        Cộng tiền
      </Menu.Item>
      <Menu.Item
        key="subtract"
        icon={<MinusCircleOutlined style={{ color: "#ff4d4f" }} />}
        onClick={() => handleBalanceAction("subtract")}
      >
        Trừ tiền
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item
        key="marketing"
        icon={
          <NotificationOutlined
            style={{
              color: customer.isAccountMarketing ? "#fa8c16" : undefined,
            }}
          />
        }
        onClick={handleToggleMarketing}
      >
        {customer.isAccountMarketing ? "Tắt Marketing" : "Bật Marketing"}
      </Menu.Item>
      {!customer.isVerifyEmail && (
        <Menu.Item
          key="email"
          icon={<MailOutlined style={{ color: "#13c2c2" }} />}
          onClick={handleActivateEmail}
        >
          Kích hoạt email
        </Menu.Item>
      )}
    </Menu>
  );

  return (
    <>
      <Space size={4} className="customer-list__actions-group">
        <Tooltip title="Xem chi tiết">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={handleViewDetail}
            className="customer-list__action-btn customer-list__action-btn--detail"
          />
        </Tooltip>
        <Dropdown overlay={menu} trigger={["hover"]} placement="bottomRight">
          <Button
            type="text"
            size="small"
            icon={<MoreOutlined />}
            className="customer-list__action-btn customer-list__action-btn--more"
          />
        </Dropdown>
      </Space>

      {/* Balance Action Modal */}
      <Modal
        title={actionType === "add" ? "Cộng tiền" : "Trừ tiền"}
        visible={actionType !== null}
        onOk={handleBalanceConfirm}
        onCancel={handleBalanceCancel}
        confirmLoading={loading}
        okText="Xác nhận"
        cancelText="Hủy"
        destroyOnClose
      >
        <div className="customer-list__action-modal">
          <p className="customer-list__action-target">
            Khách hàng: <strong>{customer.nickname || customer.email}</strong>{" "}
            (ID: {customer.id})
          </p>

          <div className="customer-list__action-field">
            <label>Số tiền (USDT)</label>
            <InputNumber
              value={amount}
              onChange={(val) => setAmount(val ?? undefined)}
              min={0.01}
              step={1}
              precision={2}
              placeholder="Nhập số tiền"
              style={{ width: "100%" }}
            />
          </div>

          <div className="customer-list__action-field">
            <label>Xác thực Captcha</label>
            <Captcha onChange={setCaptchaToken} />
          </div>
        </div>
      </Modal>

      {/* Email Activation Modal */}
      <Modal
        title="Kích hoạt xác thực email"
        visible={emailModalVisible}
        onOk={handleEmailConfirm}
        onCancel={() => {
          setEmailModalVisible(false);
          setEmailCaptchaToken("");
        }}
        confirmLoading={loading}
        okText="Xác nhận"
        cancelText="Hủy"
        destroyOnClose
      >
        <div className="customer-list__action-modal">
          <p className="customer-list__action-target">
            Kích hoạt email cho:{" "}
            <strong>{customer.nickname || customer.email}</strong> (ID:{" "}
            {customer.id})
          </p>
          <div className="customer-list__action-field">
            <label>Xác thực Captcha</label>
            <Captcha onChange={setEmailCaptchaToken} />
          </div>
        </div>
      </Modal>
    </>
  );
};

export default CustomerActions;
