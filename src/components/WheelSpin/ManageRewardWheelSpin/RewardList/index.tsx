import React, { useState } from "react";
import {
  Tabs,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  message,
  Typography,
} from "antd";
import { PlusOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";
import { WheelSpinReward } from "@src/interfaces/WheelSpinReward";
import RewardForm from "../RewardForm";
import "./styles.less";

const { TabPane } = Tabs;
const { Text } = Typography;

interface RewardListProps {
  rewards: WheelSpinReward[];
  loading: boolean;
  onRewardUpdate: () => void;
}

const RewardList: React.FC<RewardListProps> = ({
  rewards,
  loading,
  onRewardUpdate,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingReward, setEditingReward] = useState<WheelSpinReward | null>(
    null
  );
  const [viewMode, setViewMode] = useState<"create" | "edit" | "view">(
    "create"
  );

  // Split rewards into active and inactive
  const activeRewards = rewards
    .filter((reward) => reward.isActive)
    .sort((a, b) => a.position - b.position);

  const inactiveRewards = rewards
    .filter((reward) => !reward.isActive)
    .sort((a, b) => a.position - b.position);

  const handleCreate = () => {
    setEditingReward(null);
    setViewMode("create");
    setIsModalVisible(true);
  };

  const handleEdit = (reward: WheelSpinReward) => {
    setEditingReward(reward);
    setViewMode("edit");
    setIsModalVisible(true);
  };

  const handleView = (reward: WheelSpinReward) => {
    setEditingReward(reward);
    setViewMode("view");
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setEditingReward(null);
  };

  const handleFormSuccess = () => {
    setIsModalVisible(false);
    setEditingReward(null);
    onRewardUpdate();
    message.success(
      viewMode === "create"
        ? "Tạo phần thưởng thành công"
        : "Cập nhật phần thưởng thành công"
    );
  };

  const columns = [
    {
      title: "Vị trí",
      dataIndex: "position",
      key: "position",
      width: 80,
      sorter: (a: WheelSpinReward, b: WheelSpinReward) =>
        a.position - b.position,
    },
    {
      title: "Tên phần thưởng",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: WheelSpinReward) => (
        <div>
          <Text strong>{text}</Text>
          {record.isDefault && (
            <Tag color="gold" style={{ marginLeft: 8, fontSize: "12px" }}>
              Mặc định
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: "Loại",
      dataIndex: "rewardType",
      key: "rewardType",
      width: 100,
      render: (type: string) => (
        <Tag color={type === "MONEY" ? "green" : "blue"}>
          {type === "MONEY" ? "Tiền" : "Vật phẩm"}
        </Tag>
      ),
    },
    {
      title: "Giá trị",
      key: "value",
      width: 150,
      render: (record: WheelSpinReward) => {
        if (record.rewardType === "MONEY") {
          return <Text type="success">₹{record.moneyValue}</Text>;
        }
        return <Text>{record.itemDescription}</Text>;
      },
    },
    {
      title: "Trọng số",
      dataIndex: "probabilityWeight",
      key: "probabilityWeight",
      width: 120,
      render: (weight: number) => (
        <span>
          {weight.toLocaleString()}
          {weight === 0 && (
            <span style={{ color: "#ff4d4f", fontSize: "12px", marginLeft: 4 }}>
              (Không trúng)
            </span>
          )}
        </span>
      ),
    },
    {
      title: "Màu sắc",
      dataIndex: "color",
      key: "color",
      width: 100,
      render: (color: string) =>
        color ? (
          <div
            style={{
              width: 20,
              height: 20,
              backgroundColor: color,
              borderRadius: 4,
              border: "1px solid #d9d9d9",
            }}
          />
        ) : (
          "-"
        ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 150,
      render: (record: WheelSpinReward) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
            title="Xem chi tiết"
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            title="Chỉnh sửa"
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="reward-list">
      <div className="reward-list-header">
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Thêm phần thưởng
        </Button>
      </div>

      <Tabs defaultActiveKey="active" className="reward-tabs">
        <TabPane tab={`Đang hoạt động (${activeRewards.length})`} key="active">
          <Table
            columns={columns}
            dataSource={activeRewards}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
            size="small"
          />
        </TabPane>

        <TabPane
          tab={`Không hoạt động (${inactiveRewards.length})`}
          key="inactive"
        >
          <Table
            columns={columns}
            dataSource={inactiveRewards}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
            size="small"
          />
        </TabPane>
      </Tabs>

      <Modal
        title={
          viewMode === "create"
            ? "Thêm phần thưởng mới"
            : viewMode === "edit"
            ? "Chỉnh sửa phần thưởng"
            : "Chi tiết phần thưởng"
        }
        visible={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={600}
        destroyOnClose
      >
        <RewardForm
          reward={editingReward}
          mode={viewMode}
          onSuccess={handleFormSuccess}
          onCancel={handleModalClose}
        />
      </Modal>
    </div>
  );
};

export default RewardList;
