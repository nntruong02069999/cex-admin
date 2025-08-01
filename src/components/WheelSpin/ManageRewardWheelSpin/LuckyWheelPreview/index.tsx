import React, { useRef, useState } from "react";
import { LuckyWheel } from "@lucky-canvas/react";
import { Button, Empty, message } from "antd";
import { WheelSpinReward } from "@src/interfaces/WheelSpinReward";
import "./styles.less";

interface LuckyWheelPreviewProps {
  rewards: WheelSpinReward[];
}

const LuckyWheelPreview: React.FC<LuckyWheelPreviewProps> = ({ rewards }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const myLucky = useRef<any>(null);

  const prizeImgs = [
    {
      src: "https://cdn.jsdelivr.net/gh/buuing/cdn/demo/prize.png",
      width: "30%",
      top: "45%",
    },
  ];

  const blocks = [
    {
      padding: "24px",
      imgs: [
        {
          src: "https://91appl.com/assets/png/zp-624cd5c8.png",
          width: "100%",
          height: "100%",
          rotate: false,
        },
      ],
    },
  ];

  const buttons = [
    {
      radius: "45%",
      imgs: [
        {
          src: "https://91appl.com/assets/png/btn-779fac98.png",
          width: "65%",
          top: "-100%",
        },
      ],
    },
  ];

  // Convert rewards to prizes format
  const prizes = rewards.map((reward) => ({
    background: reward.color || "#1890ff",
    fonts: [
      {
        text:
          reward.rewardType === "MONEY" ? `${reward.moneyValue}đ` : reward.name,
        top: "20%",
        fontColor: "#fff",
        fontSize: "14px",
        textAlign: "center" as const,
      },
    ],
    imgs: reward.icon
      ? [{ src: reward.icon, width: "30%", top: "45%" }]
      : prizeImgs,
  }));

  const handleSpin = () => {
    if (rewards.length === 0) {
      message.warning("Chưa có phần thưởng nào để quay");
      return;
    }

    if (isSpinning) {
      return;
    }

    setIsSpinning(true);

    // Calculate random index based on probability weights
    const totalWeight = rewards.reduce(
      (sum, reward) => sum + reward.probabilityWeight,
      0
    );
    const randomNum = Math.random() * totalWeight;
    let currentWeight = 0;
    let selectedIndex = 0;

    for (let i = 0; i < rewards.length; i++) {
      currentWeight += rewards[i].probabilityWeight;
      if (randomNum <= currentWeight) {
        selectedIndex = i;
        break;
      }
    }

    // Start spinning
    myLucky.current?.play();

    setTimeout(() => {
      myLucky.current?.stop(selectedIndex);
    }, 2500);
  };

  const handleSpinEnd = (prize: any) => {
    setIsSpinning(false);
    const prizeIndex = prizes.findIndex((p) => p === prize);
    const selectedReward = rewards[prizeIndex];

    if (selectedReward) {
      message.success(
        `Chúc mừng! Bạn đã quay được: ${
          selectedReward.rewardType === "MONEY"
            ? `${selectedReward.moneyValue}đ`
            : selectedReward.name
        }`
      );
    }
  };

  if (rewards.length === 0) {
    return (
      <div className="lucky-wheel-preview empty-state">
        <Empty
          description="Chưa có phần thưởng nào"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </div>
    );
  }

  return (
    <div className="lucky-wheel-preview">
      <div className="wheel-container">
        <LuckyWheel
          ref={myLucky}
          width={350}
          height={350}
          blocks={blocks}
          prizes={prizes}
          buttons={buttons}
          className="overflow-hidden"
          onStart={handleSpin}
          onEnd={handleSpinEnd}
        />
      </div>

      <div className="wheel-controls">
        <Button
          type="primary"
          size="large"
          onClick={handleSpin}
          loading={isSpinning}
          disabled={rewards.length === 0}
        >
          {isSpinning ? "Đang quay..." : "Quay thử"}
        </Button>
      </div>

      <div className="reward-info">
        <div className="reward-count">
          Tổng số phần thưởng: <strong>{rewards.length}</strong>
        </div>
        <div className="reward-list-preview">
          {rewards.map((reward, index) => (
            <div key={reward.id} className="reward-item-preview">
              <div
                className="reward-color"
                style={{ backgroundColor: reward.color || "#1890ff" }}
              />
              <span className="reward-name">
                {reward.rewardType === "MONEY"
                  ? `${reward.moneyValue}đ`
                  : reward.name}{" "}
                (Trọng số: {reward.probabilityWeight.toLocaleString()})
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LuckyWheelPreview;
