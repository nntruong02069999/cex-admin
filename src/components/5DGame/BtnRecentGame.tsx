import React, { useState } from "react";
import { Button, Modal, Table } from "antd";
import { FiveDGameCompletedRound } from "@src/interfaces/5DGame";
import * as TableColumns from "@src/components/5DGame/TableColumns";
import * as gameHelpers from "@src/util/gameHelpers";

interface BtnRecentGameProps {
  currentGameInfos: FiveDGameCompletedRound;
}

export const BtnRecentGame: React.FC<BtnRecentGameProps> = (props: BtnRecentGameProps) => {
  const { currentGameInfos } = props;
  const [isShowModal, setIsShowModal] = useState(false);

  const onOpenModal = () => {
    setIsShowModal(true);
  }

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
            <Table
              rowKey={"id"}
              scroll={{ x: true, y: 500 }}
              bordered={true}
              columns={TableColumns.columnsCurrentGame}
              dataSource={gameHelpers.renderDataCurrentGame(currentGameInfos)}
              pagination={false}
              title={() => gameHelpers.renderTitleCurrentGame(currentGameInfos)}
              className="main-game-table game-current-table gx-mb-0"
              loading={false}
              rowClassName={(record) =>
                record.id % 2 === 0 ? "even-row" : "odd-row"
              }
            />
          </section>
        </div>
      </Modal>
    </React.Fragment>
  );
};