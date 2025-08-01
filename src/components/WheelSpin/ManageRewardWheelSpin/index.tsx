import React, { useState, useEffect } from "react";
import { Row, Col, Card, message } from "antd";
import { WheelSpinReward } from "../../../interfaces/WheelSpinReward";
import { getWheelSpinRewards } from "../../../services/wheelSpinService";
import RewardList from "./RewardList";
import LuckyWheelPreview from "./LuckyWheelPreview";
import "./styles.less";

const ManageRewardWheelSpin: React.FC = () => {
  const [rewards, setRewards] = useState<WheelSpinReward[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchRewards = async () => {
    setLoading(true);
    try {
      const response = await getWheelSpinRewards();
      if (response.errorCode) {
        message.error(response.message);
      } else {
        setRewards(response.data || []);
      }
    } catch (error) {
      message.error("Không thể tải danh sách phần thưởng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRewards();
  }, []);

  const handleRewardUpdate = () => {
    fetchRewards();
  };

  // Get active rewards sorted by position for wheel display
  const activeRewards = rewards
    .filter((reward) => reward.isActive)
    .sort((a, b) => a.position - b.position);

  return (
    <div className="manage-reward-wheel-spin">
      <Row gutter={[24, 24]}>
        {/* Left Section - Reward Management */}
        <Col xs={24} lg={14}>
          <Card title="Quản lý phần thưởng" className="reward-management-card">
            <RewardList
              rewards={rewards}
              loading={loading}
              onRewardUpdate={handleRewardUpdate}
            />
          </Card>
        </Col>

        {/* Right Section - Lucky Wheel Preview */}
        <Col xs={24} lg={10}>
          <Card title="Xem trước vòng quay" className="wheel-preview-card">
            <LuckyWheelPreview rewards={activeRewards} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ManageRewardWheelSpin;
