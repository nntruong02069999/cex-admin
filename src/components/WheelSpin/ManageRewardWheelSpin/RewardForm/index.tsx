import React, { useEffect } from "react";
import {
  Form,
  Input,
  Select,
  InputNumber,
  Switch,
  Button,
  Space,
  message,
  Descriptions,
} from "antd";
import {
  WheelSpinReward,
  WheelSpinRewardType,
  CreateWheelSpinRewardRequest,
  UpdateWheelSpinRewardRequest,
} from "@src/interfaces/WheelSpinReward";
import {
  createWheelSpinReward,
  updateWheelSpinReward,
} from "@src/services/wheelSpinService";
import Image from "@src/packages/pro-component/schema/Image";
import "./styles.less";

const { Option } = Select;
const { TextArea } = Input;

interface RewardFormProps {
  reward?: WheelSpinReward | null;
  mode: "create" | "edit" | "view";
  onSuccess: () => void;
  onCancel: () => void;
}

const RewardForm: React.FC<RewardFormProps> = ({
  reward,
  mode,
  onSuccess,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);
  const isViewMode = mode === "view";

  useEffect(() => {
    if (reward) {
      form.setFieldsValue({
        ...reward,
        color: reward.color || "#1890ff",
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        rewardType: WheelSpinRewardType.MONEY,
        probabilityWeight: 1,
        position: 0,
        displayOrder: 0,
        isActive: true,
        isDefault: false,
        color: "#1890ff",
      });
    }
  }, [reward, form]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const data = {
        ...values,
        color: values.color?.toHexString?.() || values.color,
      };

      let response;
      if (mode === "create") {
        response = await createWheelSpinReward(
          data as CreateWheelSpinRewardRequest
        );
      } else {
        response = await updateWheelSpinReward({
          id: reward!.id,
          ...data,
        } as UpdateWheelSpinRewardRequest);
      }

      if (response.errorCode) {
        message.error(response.message);
      } else {
        onSuccess();
      }
    } catch (error) {
      message.error("Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  if (isViewMode && reward) {
    return (
      <div className="reward-form-view">
        <Descriptions column={1} bordered>
          <Descriptions.Item label="Tên phần thưởng">
            {reward.name}
          </Descriptions.Item>
          <Descriptions.Item label="Loại phần thưởng">
            {reward.rewardType === "MONEY" ? "Tiền" : "Vật phẩm"}
          </Descriptions.Item>
          {reward.rewardType === "MONEY" && (
            <Descriptions.Item label="Giá trị tiền">
              {reward.moneyValue}đ
            </Descriptions.Item>
          )}
          {reward.rewardType === "ITEM" && (
            <Descriptions.Item label="Mô tả vật phẩm">
              {reward.itemDescription}
            </Descriptions.Item>
          )}
          <Descriptions.Item label="Trọng số">
            {reward.probabilityWeight}{" "}
            {reward.probabilityWeight === 0 ? "(Không quay trúng)" : ""}
          </Descriptions.Item>
          <Descriptions.Item label="Vị trí">
            {reward.position}
          </Descriptions.Item>
          <Descriptions.Item label="Thứ tự hiển thị">
            {reward.displayOrder}
          </Descriptions.Item>
          <Descriptions.Item label="Màu sắc">
            <div
              style={{
                width: 30,
                height: 20,
                backgroundColor: reward.color,
                borderRadius: 4,
                border: "1px solid #d9d9d9",
                display: "inline-block",
              }}
            />
            {reward.color}
          </Descriptions.Item>
          <Descriptions.Item label="Icon">
            {reward.icon ? (
              <img
                src={reward.icon}
                alt="Icon"
                style={{
                  width: 50,
                  height: 50,
                  objectFit: "cover",
                  borderRadius: 4,
                }}
              />
            ) : (
              "Không có"
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            {reward.isActive ? "Hoạt động" : "Không hoạt động"}
          </Descriptions.Item>
          <Descriptions.Item label="Phần thưởng mặc định">
            {reward.isDefault ? "Có" : "Không"}
          </Descriptions.Item>
        </Descriptions>

        <div
          className="form-actions"
          style={{ marginTop: 24, textAlign: "right" }}
        >
          <Button onClick={onCancel}>Đóng</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="reward-form">
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="name"
          label="Tên phần thưởng"
          rules={[{ required: true, message: "Vui lòng nhập tên phần thưởng" }]}
        >
          <Input placeholder="Nhập tên phần thưởng" />
        </Form.Item>

        <Form.Item
          name="rewardType"
          label="Loại phần thưởng"
          rules={[
            { required: true, message: "Vui lòng chọn loại phần thưởng" },
          ]}
        >
          <Select placeholder="Chọn loại phần thưởng">
            <Option value={WheelSpinRewardType.MONEY}>Tiền</Option>
            <Option value={WheelSpinRewardType.ITEM}>Vật phẩm</Option>
          </Select>
        </Form.Item>

        <Form.Item
          shouldUpdate={(prevValues, currentValues) =>
            prevValues.rewardType !== currentValues.rewardType
          }
        >
          {({ getFieldValue }) => {
            const rewardType = getFieldValue("rewardType");

            if (rewardType === WheelSpinRewardType.MONEY) {
              return (
                <Form.Item
                  name="moneyValue"
                  label="Giá trị tiền (VNĐ)"
                  rules={[
                    { required: true, message: "Vui lòng nhập giá trị tiền" },
                    {
                      type: "number",
                      min: 0,
                      message: "Giá trị phải lớn hơn 0",
                    },
                  ]}
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    placeholder="Nhập giá trị tiền"
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
                  />
                </Form.Item>
              );
            }

            if (rewardType === WheelSpinRewardType.ITEM) {
              return (
                <Form.Item
                  name="itemDescription"
                  label="Mô tả vật phẩm"
                  rules={[
                    { required: true, message: "Vui lòng nhập mô tả vật phẩm" },
                  ]}
                >
                  <TextArea
                    rows={3}
                    placeholder="Nhập mô tả chi tiết về vật phẩm"
                  />
                </Form.Item>
              );
            }

            return null;
          }}
        </Form.Item>

        <Form.Item
          name="probabilityWeight"
          label="Trọng số"
          rules={[
            { required: true, message: "Vui lòng nhập trọng số" },
            {
              type: "number",
              min: 0,
              message: "Trọng số phải >= 0",
            },
          ]}
          tooltip="Trọng số quyết định tỷ lệ quay trúng. Trọng số = 0 sẽ không bao giờ quay trúng. Trọng số càng cao thì tỷ lệ trúng càng lớn."
        >
          <InputNumber
            style={{ width: "100%" }}
            placeholder="Nhập trọng số (VD: 1, 100, 1000000...)"
            min={0}
          />
        </Form.Item>

        <Form.Item
          name="position"
          label="Vị trí trên vòng quay"
          rules={[
            { required: true, message: "Vui lòng nhập vị trí" },
            { type: "number", min: 0, message: "Vị trí phải >= 0" },
          ]}
        >
          <InputNumber
            style={{ width: "100%" }}
            placeholder="Nhập vị trí (0-based)"
            min={0}
          />
        </Form.Item>

        <Form.Item name="displayOrder" label="Thứ tự hiển thị">
          <InputNumber
            style={{ width: "100%" }}
            placeholder="Nhập thứ tự hiển thị"
            min={0}
          />
        </Form.Item>

        <Form.Item name="color" label="Màu sắc">
          <Input type="color" style={{ width: 100, height: 32 }} />
        </Form.Item>

        <Form.Item name="icon" label="Icon phần thưởng">
          <Image
            title="Tải lên icon"
            tooltip="Tải lên icon cho phần thưởng"
            width={100}
            height={100}
            multiple={false}
            maxCount={1}
          />
        </Form.Item>

        <Form.Item name="isActive" label="Trạng thái" valuePropName="checked">
          <Switch checkedChildren="Hoạt động" unCheckedChildren="Tắt" />
        </Form.Item>

        <Form.Item
          name="isDefault"
          label="Phần thưởng mặc định"
          valuePropName="checked"
          tooltip="Nếu vòng quay không quay ra phần thưởng nào khác, sẽ chọn phần thưởng này"
        >
          <Switch checkedChildren="Có" unCheckedChildren="Không" />
        </Form.Item>

        <div className="form-actions">
          <Space>
            <Button onClick={onCancel}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {mode === "create" ? "Tạo mới" : "Cập nhật"}
            </Button>
          </Space>
        </div>
      </Form>
    </div>
  );
};

export default RewardForm;
