import React, { useState } from "react";
import { connect } from "dva";
import {
  Modal,
  Form,
  Input,
  Alert,
  Typography,
  Space,
  Button,
  Descriptions,
  Tag,
  Divider,
} from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { HouseWalletState } from "@src/models/houseWallet";
import BSCScanLink from "../Common/BSCScanLink";
import AmountDisplay from "../Common/AmountDisplay";
import dayjs from "dayjs";

const { TextArea } = Input;
const { Text, Title } = Typography;

interface PayoutRetryModalProps {
  houseWallet: HouseWalletState;
  dispatch: any;
}

const PayoutRetryModal: React.FC<PayoutRetryModalProps> = ({
  houseWallet,
  dispatch,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const { payoutRetryModal } = houseWallet;
  const { visible, record } = payoutRetryModal;

  const handleRetry = async (values: any) => {
    if (!record) return;

    try {
      setLoading(true);
      await dispatch({
        type: "houseWallet/retryFailedPayout",
        payload: record.id,
      });

      // Close modal and refresh data
      handleCancel();
    } catch (error) {
      console.error("Failed to retry payout:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    dispatch({ type: "houseWallet/closePayoutRetryModal" });
    form.resetFields();
  };

  const getStatusColor = (status: string) => {
    const colors = {
      PENDING: "orange",
      PROCESSING: "blue",
      SUCCESS: "green",
      FAILED: "red",
      CANCELLED: "default",
      INSUFFICIENT_FUNDS: "magenta",
      INVALID_ADDRESS: "red",
    };
    return colors[status as keyof typeof colors] || "default";
  };

  if (!record) return null;

  const canRetry =
    record.status === "FAILED" &&
    (record.retryCount || 0) < (record.maxRetries || 3);

  return (
    <Modal
      title={
        <Space>
          <ReloadOutlined />
          <span>Thử lại giao dịch thanh toán</span>
        </Space>
      }
      visible={visible}
      onCancel={handleCancel}
      footer={null}
      width={700}
      className="payout-retry-modal"
    >
      <div className="payout-retry-content">
        {!canRetry && (
          <Alert
            message="Không thể thử lại"
            description="Giao dịch này không thể thử lại do đã vượt quá số lần thử lại tối đa hoặc trạng thái không cho phép."
            type="warning"
            style={{ marginBottom: 16 }}
            showIcon
          />
        )}

        {canRetry && (
          <Alert
            message="Xác nhận thử lại giao dịch"
            description="Bạn có chắc chắn muốn thử lại giao dịch thanh toán này? Hành động này sẽ tạo một giao dịch mới trên blockchain."
            type="info"
            style={{ marginBottom: 16 }}
            showIcon
          />
        )}

        <Title level={5}>Thông tin giao dịch</Title>
        <Descriptions
          bordered
          column={2}
          size="small"
          style={{ marginBottom: 16 }}
        >
          <Descriptions.Item label="ID giao dịch" span={1}>
            <Text strong>{record.id}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái" span={1}>
            <Tag color={getStatusColor(record.status)}>
              {record.status.replace("_", " ")}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="ID khách hàng" span={1}>
            <Text>{record.customerId}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Địa chỉ nhận" span={1}>
            <BSCScanLink address={record.toAddress} type="address" />
          </Descriptions.Item>
          <Descriptions.Item label="Số tiền" span={1}>
            <Text strong style={{ color: "#1890ff" }}>
              <AmountDisplay amount={record.amount} currency="USDT" />
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="Phí giao dịch" span={1}>
            <Text style={{ color: "#fa8c16" }}>
              <AmountDisplay amount={record.feeAmount || 0} currency="USDT" />
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="Số lần thử lại" span={1}>
            <Text>
              <span style={{ color: "#fa8c16" }}>{record.retryCount || 0}</span>
              <span style={{ color: "#999" }}> / {record.maxRetries || 3}</span>
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="Ngày tạo" span={1}>
            <Text>
              {record.createdAt
                ? dayjs(record.createdAt).format("DD/MM/YYYY HH:mm:ss")
                : "-"}
            </Text>
          </Descriptions.Item>
        </Descriptions>

        {record.failReason && (
          <>
            <Title level={5}>Lý do thất bại</Title>
            <div
              style={{
                padding: "12px",
                backgroundColor: "#fff2f0",
                borderRadius: "6px",
                border: "1px solid #ffccc7",
                marginBottom: 16,
              }}
            >
              <Text type="danger">{record.failReason}</Text>
            </div>
          </>
        )}

        {canRetry && (
          <Form form={form} layout="vertical" onFinish={handleRetry}>
            <Form.Item
              name="retryNotes"
              label="Ghi chú cho lần thử lại (tùy chọn)"
            >
              <TextArea
                placeholder="Nhập ghi chú cho lần thử lại này..."
                rows={3}
                maxLength={500}
                showCount
              />
            </Form.Item>

            <Divider />

            <Form.Item style={{ marginBottom: 0 }}>
              <Space style={{ width: "100%", justifyContent: "flex-end" }}>
                <Button onClick={handleCancel}>Hủy</Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  icon={<ReloadOutlined />}
                  danger={!canRetry}
                  disabled={!canRetry}
                >
                  {canRetry ? "Thử lại giao dịch" : "Không thể thử lại"}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        )}

        {!canRetry && (
          <div style={{ textAlign: "right", marginTop: 16 }}>
            <Button onClick={handleCancel}>Đóng</Button>
          </div>
        )}
      </div>
    </Modal>
  );
};

const mapStateToProps = ({ houseWallet }: any) => ({
  houseWallet,
});

export default connect(mapStateToProps)(PayoutRetryModal);
