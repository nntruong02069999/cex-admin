import React, { useState } from "react";
import { connect } from "dva";
import {
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Switch,
  Button,
  Space,
  Row,
  Col,
  Divider,
} from "antd";
import {
  EyeInvisibleOutlined,
  EyeTwoTone,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { HouseWalletState } from "@src/models/houseWallet";
import {
  CreateWalletData,
  UpdateWalletData,
} from "@src/services/houseWalletService";

const { Option } = Select;
const { TextArea } = Input;

interface WalletConfigModalProps {
  houseWallet: HouseWalletState;
  dispatch: any;
}

const WalletConfigModal: React.FC<WalletConfigModalProps> = ({
  houseWallet,
  dispatch,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const { walletConfigModal } = houseWallet;
  const { visible, editingRecord } = walletConfigModal;
  const isEditing = !!editingRecord;

  const walletTypeOptions = [
    {
      value: "HOUSE_MAIN",
      label: "Ví chính",
      description: "Ví chính của nhà cái",
    },
    {
      value: "FEE_PAYMENT",
      label: "Ví trả phí",
      description: "Ví dùng để trả phí giao dịch",
    },
    {
      value: "CUSTOMER_PAYOUT",
      label: "Ví rút",
      description: "Ví dùng để rút tiền cho khách hàng",
    },
  ];

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);

      if (isEditing) {
        const updateData: UpdateWalletData = {
          minBalance: values.minBalance,
          maxBalance: values.maxBalance,
          description: values.description,
          isActive: values.isActive,
        };
        await dispatch({
          type: "houseWallet/updateWalletConfig",
          payload: { id: editingRecord!.id, ...updateData },
        });
      } else {
        const createData: CreateWalletData = {
          walletType: values.walletType,
          address: values.address,
          privateKey: values.privateKey,
          description: values.description,
          minBalance: values.minBalance,
          maxBalance: values.maxBalance,
        };
        await dispatch({
          type: "houseWallet/createWalletConfig",
          payload: createData,
        });
      }
    } catch (error) {
      console.error("Failed to save wallet configuration:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    dispatch({ type: "houseWallet/closeWalletConfigModal" });
    form.resetFields();
  };

  const generatePrivateKey = () => {
    // This is a placeholder - you should implement proper key generation
    const randomKey =
      "0x" +
      Array.from({ length: 64 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join("");
    form.setFieldsValue({ privateKey: randomKey });
  };

  const validateAddress = (rule: any, value: string) => {
    if (!value) return Promise.resolve();

    // Basic Ethereum address validation
    const addressRegex = /^0x[a-fA-F0-9]{40}$/;
    if (!addressRegex.test(value)) {
      return Promise.reject("Please enter a valid BSC address");
    }

    return Promise.resolve();
  };

  const validatePrivateKey = (rule: any, value: string) => {
    if (!value) return Promise.resolve();

    // Basic private key validation
    const keyRegex = /^0x[a-fA-F0-9]{64}$/;
    if (!keyRegex.test(value)) {
      return Promise.reject(
        "Please enter a valid private key (64 hex characters)"
      );
    }

    return Promise.resolve();
  };

  return (
    <Modal
      title={isEditing ? "Chỉnh sửa ví" : "Tạo ví"}
      visible={visible}
      onCancel={handleCancel}
      footer={null}
      width={600}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={
          isEditing
            ? {
                walletType: editingRecord?.walletType,
                address: editingRecord?.address,
                description: editingRecord?.description,
                minBalance: editingRecord?.minBalance,
                maxBalance: editingRecord?.maxBalance,
                isActive: editingRecord?.isActive ?? true,
              }
            : {
                isActive: true,
              }
        }
      >
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="walletType"
              label="Loại ví"
              rules={[{ required: true, message: "Vui lòng chọn loại ví" }]}
            >
              <Select placeholder="Chọn loại ví" disabled={isEditing}>
                {walletTypeOptions.map((option) => (
                  <Option key={option.value} value={option.value}>
                    <div>
                      <div>
                        <strong>{option.label}</strong>
                      </div>
                      <div style={{ fontSize: "12px", color: "#666" }}>
                        {option.description}
                      </div>
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="address"
              label="Địa chỉ ví"
              rules={[
                { required: true, message: "Vui lòng nhập địa chỉ ví" },
                { validator: validateAddress },
              ]}
            >
              <Input placeholder="0x..." disabled={isEditing} />
            </Form.Item>
          </Col>
        </Row>

        {!isEditing && (
          <Row gutter={16}>
            <Col span={20}>
              <Form.Item
                name="privateKey"
                label="Khóa riêng"
                rules={[{ validator: validatePrivateKey }]}
              >
                <Input.Password
                  placeholder="0x... (tùy chọn - có thể tạo)"
                  iconRender={(visible) =>
                    visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                  }
                />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item label=" ">
                <Button
                  icon={<ThunderboltOutlined />}
                  onClick={generatePrivateKey}
                  style={{ width: "100%" }}
                >
                  Tạo
                </Button>
              </Form.Item>
            </Col>
          </Row>
        )}

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="minBalance" label="Số tiền tối thiểu (USDT)">
              <InputNumber
                placeholder="0.00"
                min={0}
                precision={2}
                style={{ width: "100%" }}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="maxBalance" label="Số tiền tối đa (USDT)">
              <InputNumber
                placeholder="No limit"
                min={0}
                precision={2}
                style={{ width: "100%" }}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item name="description" label="Mô tả">
              <TextArea
                placeholder="Nhập mô tả ví hoặc mục đích"
                rows={3}
                maxLength={500}
                showCount
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="isActive"
              label="Trạng thái"
              valuePropName="checked"
            >
              <Switch
                checkedChildren="Hoạt động"
                unCheckedChildren="Không hoạt động"
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider />

        <Form.Item>
          <Space>
            <Button onClick={handleCancel}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {isEditing ? "Cập nhật" : "Tạo"} ví
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

const mapStateToProps = ({ houseWallet }: any) => ({
  houseWallet,
});

export default connect(mapStateToProps)(WalletConfigModal);
