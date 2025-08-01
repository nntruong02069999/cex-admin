import React, { useState, useEffect } from "react";
import { Button, Typography, message, Modal } from "antd";
import { ARRAY_WINGO_TIME_CONFIGS } from "@src/constants/constants";
import Widget from "@src/components/Widget";
import "@src/components/games/TrxWingo.less";
import { getSecondsLeftFromIST } from "@src/util/timeUtils";
import * as trxWingoServices from "@src/services/trx-wingo";
import { BettingStatistics } from "@src/components/5DGame/BettingStatistics";

interface TrxWingoCompletedRound {
  id: number;
  issueNumber: string;
  startTime: string;
  endTime: string;
  resultNumber: number;
  resultColor: string;
  resultSize: string;
  totalBetAmount: number;
  totalWinAmount: number;
  playerCount: number;
  state: string;
}

const TrxWingoGame: React.FC<any> = () => {
  const [selectedWingoTimeConfig, setSelectedWingoTimeConfig] = useState(
    ARRAY_WINGO_TIME_CONFIGS[0]
  );
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [currentGame, setCurrentGame] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [gameHistory, setGameHistory] = useState<TrxWingoCompletedRound[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [detailRound, setDetailRound] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const getListCompletedRounds = async () => {
    setLoadingHistory(true);
    try {
      const response = await trxWingoServices.getListCompletedRounds({
        skip: 0,
        limit: 10,
        timeConfig: selectedWingoTimeConfig.value,
      });
      if (response?.code === 0) {
        setGameHistory(response.data);
      } else {
        message.error(response?.message || "Failed to fetch completed rounds");
      }
    } catch (error: any) {
      message.error(error?.message || "An error occurred");
    } finally {
      setLoadingHistory(false);
    }
  };

  const getStatisticCurrentRound = async () => {
    setLoading(true);
    try {
      const response = await trxWingoServices.getStatisticCurrentRound(
        selectedWingoTimeConfig.value
      );
      if (response?.code === 0) {
        setCurrentGame(response.data);
        if (response.data?.currentRound?.endTime) {
          const timeEnd = getSecondsLeftFromIST(
            response.data.currentRound.endTime
          );
          setSecondsLeft(timeEnd);
        }
      } else {
        message.error(
          response?.message || "Failed to fetch current round statistics"
        );
      }
    } catch (error: any) {
      message.error(error?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getStatisticCurrentRound();
    getListCompletedRounds();
  }, [selectedWingoTimeConfig]);

  useEffect(() => {
    if (secondsLeft < 0) {
      getStatisticCurrentRound();
      return;
    }

    let timeLeft = secondsLeft;
    const timer = setInterval(() => {
      timeLeft = timeLeft - 1;
      setSecondsLeft(timeLeft);

      if (timeLeft % 3 === 0 && timeLeft > 0) {
        getStatisticCurrentRound();
      }

      if (timeLeft <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft]);

  const renderCountdown = () => {
    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;

    const minutesStr = minutes.toString().padStart(2, "0");
    const secondsStr = seconds.toString().padStart(2, "0");

    return (
      <div className="game-countdown">
        <div style={{ gap: "10px" }} className="countdown-digits">
          <div className="countdown-digit">{minutesStr[0]}</div>
          <div className="countdown-digit">{minutesStr[1]}</div>
          <div className="countdown-separator">:</div>
          <div className="countdown-digit">{secondsStr[0]}</div>
          <div className="countdown-digit">{secondsStr[1]}</div>
        </div>
      </div>
    );
  };

  const handleShowDetail = (round: any) => {
    setDetailRound({
      currentRound: round,
      statisticCustomersOrder: [], // Nếu có API lấy thống kê cho round này, truyền vào đây
    });
    setIsDetailModalOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailModalOpen(false);
    setDetailRound(null);
  };

  const renderCurrentGameSection = (gameData: any) => {
    if (!gameData?.currentRound) return null;
    const currentRound = gameData.currentRound;
    const startTime = new Date(currentRound.startTime).toLocaleTimeString();
    const endTime = new Date(currentRound.endTime).toLocaleTimeString();
    return (
      <div className="game-current">
        <div className="game-header-info">
          <span>Phiên {currentRound.issueNumber}</span>
          <span>
            Tổng giá trị {currentRound.totalBetAmount.toLocaleString()} đ
          </span>
          <span>Số người chơi: {currentRound.playerCount}</span>
          <span>
            {startTime} → {endTime}
          </span>
        </div>
        {renderGameInfo(currentRound)}
        <BettingStatistics
          statisticCustomersOrder={gameData?.statisticCustomersOrder || []}
        />
      </div>
    );
  };

  const renderCurrentGame = () => {
    if (!currentGame?.currentRound) return null;

    const currentRound = currentGame.currentRound;
    const startTime = new Date(currentRound.startTime).toLocaleTimeString();
    const endTime = new Date(currentRound.endTime).toLocaleTimeString();

    return (
      <div className="game-current">
        <h3 className="section-title">GAME HIỆN TẠI</h3>
        {renderCountdown()}
        {renderGameInfo(currentRound)}

        <BettingStatistics
          statisticCustomersOrder={currentGame?.statisticCustomersOrder || []}
        />
      </div>
    );
  };

  const renderGameInfo = (currentRound: any) => {
    if (!currentRound) return null;
    const startTime = new Date(currentRound.startTime).toLocaleTimeString();
    const endTime = new Date(currentRound.endTime).toLocaleTimeString();

    return (
      <>
        <div className="game-info">
          <div className="game-id">Phiên {currentRound.issueNumber}</div>
          <div className="total-value">
            Tổng giá trị: {(currentRound.totalBetAmount ?? 0).toLocaleString()}{" "}
            đ
          </div>
          <div className="game-time">
            {startTime} → {endTime}
          </div>
        </div>
        <div className="color-bets">
          <div className="color-row">
            <div className="color-label">Màu sắc</div>
            <div
              style={{ backgroundColor: "green", color: "white" }}
              className="color-green"
            >
              Xanh
            </div>
            <div
              style={{ backgroundColor: "purple", color: "white" }}
              className="color-pink"
            >
              Tím
            </div>
            <div
              style={{ backgroundColor: "red", color: "white" }}
              className="color-red"
            >
              Đỏ
            </div>
          </div>
          <div className="color-row">
            <div className="bet-label">Tổng đặt</div>
            <div className="bet-amount">
              {(currentRound.totalGreenBets ?? 0).toLocaleString()} đ
            </div>
            <div className="bet-amount">
              {(currentRound.totalPurpleBets ?? 0).toLocaleString()} đ
            </div>
            <div className="bet-amount">
              {(currentRound.totalRedBets ?? 0).toLocaleString()} đ
            </div>
          </div>
        </div>
        <div className="number-bets">
          <div className="number-row">
            <div className="number-label">Số</div>
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <div
                key={num}
                style={{
                  background:
                    num === 0
                      ? 'linear-gradient(to bottom right,#fb5b5b 50%,#800080 0)'
                      : num === 5
                      ? 'linear-gradient(to bottom right,#008000 50%,#800080 0)'
                      : num % 2 === 0
                      ? 'red'
                      : 'green',
                  color: "#fff",
                }}
                className="number-item"
              >
                {num}
              </div>
            ))}
          </div>
          <div className="number-row">
            <div className="bet-label">Tổng đặt</div>
            <div className="bet-amount">
              {(currentRound.totalBetNumber0 ?? 0).toLocaleString()} đ
            </div>
            <div className="bet-amount">
              {(currentRound.totalBetNumber1 ?? 0).toLocaleString()} đ
            </div>
            <div className="bet-amount">
              {(currentRound.totalBetNumber2 ?? 0).toLocaleString()} đ
            </div>
            <div className="bet-amount">
              {(currentRound.totalBetNumber3 ?? 0).toLocaleString()} đ
            </div>
            <div className="bet-amount">
              {(currentRound.totalBetNumber4 ?? 0).toLocaleString()} đ
            </div>
            <div className="bet-amount">
              {(currentRound.totalBetNumber5 ?? 0).toLocaleString()} đ
            </div>
            <div className="bet-amount">
              {(currentRound.totalBetNumber6 ?? 0).toLocaleString()} đ
            </div>
            <div className="bet-amount">
              {(currentRound.totalBetNumber7 ?? 0).toLocaleString()} đ
            </div>
            <div className="bet-amount">
              {(currentRound.totalBetNumber8 ?? 0).toLocaleString()} đ
            </div>
            <div className="bet-amount">
              {(currentRound.totalBetNumber9 ?? 0).toLocaleString()} đ
            </div>
          </div>
        </div>
        <div className="size-bets">
          <div className="size-row">
            <div className="size-label">Lớn nhỏ</div>
            <div className="size-big">Lớn</div>
            <div className="size-small">Nhỏ</div>
          </div>
          <div className="size-row">
            <div className="bet-label">Tổng đặt</div>
            <div className="bet-amount">
              {(currentRound.totalBigBets ?? 0).toLocaleString()} đ
            </div>
            <div className="bet-amount">
              {(currentRound.totalSmallBets ?? 0).toLocaleString()} đ
            </div>
          </div>
        </div>
      </>
    );
  };

  const renderRecentGames = () => {
    return (
      <div className="game-history">
        <h3 className="section-title">GAME GẦN ĐÂY</h3>
        <table className="game-table">
          <thead>
            <tr>
              <th>Phiên</th>
              <th>Tổng giá trị</th>
              <th>Số thắng</th>
              <th>Màu</th>
              <th>Lớn/Nhỏ</th>
              <th>Số tiền trả cho khách</th>
              <th>Thời gian</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {gameHistory.map((game) => (
              <tr key={game.id}>
                <td>Phiên {game.issueNumber}</td>
                <td>{game.totalBetAmount.toLocaleString()} đ</td>
                <td>{game.resultNumber}</td>
                <td>
                  {game.resultColor.split(",").map((color, index) => (
                    <span
                      key={index}
                      style={{
                        backgroundColor:
                          color === "RED"
                            ? "red"
                            : color === "GREEN"
                            ? "green"
                            : "purple",
                        color: "white",
                        padding: "2px 8px",
                        marginRight: "4px",
                        borderRadius: "4px",
                      }}
                    >
                      {color}
                    </span>
                  ))}
                </td>
                <td>{game.resultSize}</td>
                <td>{game.totalWinAmount.toLocaleString()} đ</td>
                <td>
                  {new Date(game.startTime).toLocaleTimeString()} →{" "}
                  {new Date(game.endTime).toLocaleTimeString()}
                </td>
                <td>
                  <Button
                    type="primary"
                    size="small"
                    onClick={() => handleShowDetail(game)}
                  >
                    Chi tiết
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderModalGameInfo = (currentRound: any) => {
    if (!currentRound) return null;
    const startTime = new Date(currentRound.startTime).toLocaleTimeString();
    const endTime = new Date(currentRound.endTime).toLocaleTimeString();

    return (
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: 15,
          background: "#fff",
        }}
      >
        <tbody>
          <tr>
            <td colSpan={10} style={{ padding: 8, fontWeight: 600 }}>
              Phiên {currentRound.issueNumber}
            </td>
            <td
              colSpan={10}
              style={{ padding: 8, textAlign: "center", fontWeight: 600 }}
            >
              Tổng giá trị:{" "}
              {(currentRound.totalBetAmount ?? 0).toLocaleString()} đ
            </td>
            <td colSpan={10} style={{ padding: 8, textAlign: "right" }}>
              {startTime} → {endTime}
            </td>
          </tr>
          {/* Màu sắc */}
          <tr>
            <td
              colSpan={3}
              style={{
                background: "#f5f5f5",
                fontWeight: 600,
                textAlign: "center",
                border: "1px solid #eee",
              }}
            >
              Màu sắc
            </td>
            <td
              colSpan={8}
              style={{
                background: "green",
                color: "#fff",
                textAlign: "center",
                border: "1px solid #eee",
              }}
            >
              Xanh
            </td>
            <td
              colSpan={8}
              style={{
                background: "purple",
                color: "#fff",
                textAlign: "center",
                border: "1px solid #eee",
              }}
            >
              Tím
            </td>
            <td
              colSpan={8}
              style={{
                background: "red",
                color: "#fff",
                textAlign: "center",
                border: "1px solid #eee",
              }}
            >
              Đỏ
            </td>
          </tr>
          <tr>
            <td
              colSpan={3}
              style={{
                background: "#f5f5f5",
                textAlign: "center",
                border: "1px solid #eee",
              }}
            >
              Tổng đặt
            </td>
            <td
              colSpan={8}
              style={{ textAlign: "center", border: "1px solid #eee" }}
            >
              {(currentRound.totalGreenBets ?? 0).toLocaleString()} đ
            </td>
            <td
              colSpan={8}
              style={{ textAlign: "center", border: "1px solid #eee" }}
            >
              {(currentRound.totalPurpleBets ?? 0).toLocaleString()} đ
            </td>
            <td
              colSpan={8}
              style={{ textAlign: "center", border: "1px solid #eee" }}
            >
              {(currentRound.totalRedBets ?? 0).toLocaleString()} đ
            </td>
          </tr>
          {/* Số */}
          <tr>
            <td
              colSpan={7}
              style={{
                background: "#f5f5f5",
                fontWeight: 600,
                textAlign: "center",
                border: "1px solid #eee",
              }}
            >
              Số
            </td>{" "}
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <td
                key={num}
                colSpan={2}
                style={{
                  background:
                    num === 0
                      ? "linear-gradient(to bottom right,#fb5b5b 50%,#800080 0)"
                      : num === 5
                      ? "linear-gradient(to bottom right,#008000 50%,#800080 0)"
                      : num % 2 === 0
                      ? "red"
                      : "green",
                  color: "#fff",
                  textAlign: "center",
                  minWidth: 50,
                  fontWeight: 600,
                }}
              >
                {num}
              </td>
            ))}
          </tr>
          <tr>
            <td
              colSpan={7}
              style={{
                background: "#f5f5f5",
                textAlign: "center",
                border: "1px solid #eee",
              }}
            >
              Tổng đặt
            </td>
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <td
                key={num}
                colSpan={2}
                style={{
                  textAlign: "center",
                  minWidth: 50,
                  border: "1px solid #eee",
                }}
              >
                {(currentRound[`totalBetNumber${num}`] ?? 0).toLocaleString()} đ
              </td>
            ))}
          </tr>
          {/* Lớn nhỏ */}
          <tr>
            <td
              colSpan={10}
              style={{
                background: "#f5f5f5",
                fontWeight: 600,
                textAlign: "center",
                border: "1px solid #eee",
              }}
            >
              Lớn nhỏ
            </td>
            <td
              colSpan={10}
              style={{ textAlign: "center", border: "1px solid #eee" }}
            >
              Lớn
            </td>
            <td
              colSpan={10}
              style={{ textAlign: "center", border: "1px solid #eee" }}
            >
              Nhỏ
            </td>
          </tr>
          <tr>
            <td
              colSpan={10}
              style={{
                background: "#f5f5f5",
                textAlign: "center",
                border: "1px solid #eee",
              }}
            >
              Tổng đặt
            </td>
            <td
              colSpan={10}
              style={{ textAlign: "center", border: "1px solid #eee" }}
            >
              {(currentRound.totalBigBets ?? 0).toLocaleString()} đ
            </td>
            <td
              colSpan={10}
              style={{ textAlign: "center", border: "1px solid #eee" }}
            >
              {(currentRound.totalSmallBets ?? 0).toLocaleString()} đ
            </td>
          </tr>
        </tbody>
      </table>
    );
  };

  return (
    <div className="gx-main-content">
      <Widget>
        <div className="trx-wingo-container">
          <Typography.Title level={4} className="trx-wingo-title">
            Thông tin game
          </Typography.Title>

          {/* <div className="filters">
            <Button type="primary">
              <i className="icon-chart"></i> D/s User lãi (game) trên 500,000 ₫
            </Button>
            <Button>
              <i className="icon-chart"></i> D/s User lãi (tổng) trên 500,000 ₫
            </Button>
          </div> */}

          <Button.Group className="time-config-buttons">
            {ARRAY_WINGO_TIME_CONFIGS.map((option) => {
              const isActive = selectedWingoTimeConfig.value === option.value;
              return (
                <Button
                  key={option.value}
                  type={isActive ? "primary" : "default"}
                  onClick={() => setSelectedWingoTimeConfig(option)}
                >
                  {option.label}
                </Button>
              );
            })}
          </Button.Group>

          {renderCurrentGame()}
          {renderRecentGames()}
        </div>
      </Widget>
      <Modal
        visible={isDetailModalOpen}
        onCancel={handleCloseDetail}
        footer={null}
        width={900}
        title={`Chi tiết phiên ${detailRound?.currentRound?.issueNumber || ""}`}
      >
        {detailRound && renderModalGameInfo(detailRound.currentRound)}
      </Modal>
    </div>
  );
};

export default TrxWingoGame;
