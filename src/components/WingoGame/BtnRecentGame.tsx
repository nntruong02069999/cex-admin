import React, { useState } from "react";
import { Button, Modal } from "antd";
import { WingoGameCompletedRound } from "@src/interfaces/WingoGame";
import CurrentGameStatistics from "./CurrentGameStatistics";

interface BtnRecentGameProps {
  currentGameInfos: WingoGameCompletedRound;
}

const BtnRecentGame: React.FC<BtnRecentGameProps> = (props: BtnRecentGameProps) => {
  const { currentGameInfos } = props;
  const [isShowModal, setIsShowModal] = useState(false);

  const onOpenModal = () => {
    setIsShowModal(true);
  };

  return (
    <React.Fragment>
      <Button type="primary" className="is-btn-submit" onClick={onOpenModal}>
        Chi tiết
      </Button>
      <Modal
        visible={isShowModal}
        width='80vw'
        footer={null}
        centered
        onCancel={() => setIsShowModal(false)}
        title="Game gần đây"
        destroyOnClose={true}
        className="is-modal-recent-game"
      >
        <div className="main-game-container gx-p-0 gx-mb-0">
          <section className="main-game-current-game">
            <CurrentGameStatistics currentGameInfos={currentGameInfos} />
          </section>
        </div>
      </Modal>
    </React.Fragment>
  );
};

export default BtnRecentGame; 