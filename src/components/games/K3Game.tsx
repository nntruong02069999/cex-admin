import React, { useState, useEffect } from 'react';
import { Input, Button, message, Modal } from 'antd';
import Widget from '@src/components/Widget/index';
import './K3Game.less';
import { WINGO_TIME_CONFIG } from '@src/constants/enums';
import { K3GameCompletedRound } from '@src/interfaces/K3Game';
import * as k3GameServices from '@src/services/k3-game';
import { getSecondsLeftFromIST } from '@src/util/timeUtils';
import { BettingStatistics } from "@src/components/5DGame/BettingStatistics";

interface K3GameProps {
  location?: any;
}

const TIME_CONFIGS = [
  { value: WINGO_TIME_CONFIG.MINUTES_1, label: '1 Phút' },
  { value: WINGO_TIME_CONFIG.MINUTES_3, label: '3 Phút' },
  { value: WINGO_TIME_CONFIG.MINUTES_5, label: '5 Phút' },
  { value: WINGO_TIME_CONFIG.MINUTES_10, label: '10 Phút' }
];

const K3Game: React.FC<K3GameProps> = (props) => {
  // State initialization
  const [loading, setLoading] = useState(true);
  const [selectedTimeConfig, setSelectedTimeConfig] = useState<WINGO_TIME_CONFIG>(WINGO_TIME_CONFIG.MINUTES_1);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [currentGame, setCurrentGame] = useState<any>(null);
  const [gameHistory, setGameHistory] = useState<K3GameCompletedRound[]>([]);
  const [listNextRound, setListNextRound] = useState<K3GameCompletedRound[]>([]);
  const [loadingRecentGame, setLoadingRecentGame] = useState(false);
  const [loadingNextRound, setLoadingNextRound] = useState(false);
  const [loadingStatisticCurrentRound, setLoadingStatisticCurrentRound] = useState(false);
  const [isSetResultSuccess, setIsSetResultSuccess] = useState(false);
  const [diceInputs, setDiceInputs] = useState<{[key: string]: {dice1: number | null, dice2: number | null, dice3: number | null}}>({});
  const [detailRound, setDetailRound] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // API calls
  const getListCompletedRounds = async () => {
    setLoadingRecentGame(true);
    try {
      const response = await k3GameServices.getListCompletedRounds({
        skip: 0,
        limit: 10,
        timeConfig: selectedTimeConfig
      });
      if (response?.code === 0) {
        setGameHistory(response.data);
      } else {
        message.error(response?.message || 'Failed to fetch completed rounds');
      }
    } catch (error: any) {
      message.error(error?.message || 'An error occurred');
    } finally {
      setLoadingRecentGame(false);
    }
  };

  const getListNextRounds = async () => {
    setLoadingNextRound(true);
    try {
      const response = await k3GameServices.getListNextRounds(selectedTimeConfig);
      if (response?.code === 0) {
        setListNextRound(response.data);
        // Update dice inputs from API response
        const newDiceInputs = { ...diceInputs };
        response.data.forEach((round: any) => {
          if (round.resultDice1 || round.resultDice2 || round.resultDice3) {
            newDiceInputs[round.issueNumber] = {
              dice1: round.resultDice1,
              dice2: round.resultDice2,
              dice3: round.resultDice3
            };
          }
        });
        setDiceInputs(newDiceInputs);
      } else {
        message.error(response?.message || 'Failed to fetch next rounds');
      }
    } catch (error: any) {
      message.error(error?.message || 'An error occurred');
    } finally {
      setLoadingNextRound(false);
    }
  };

  const getStatisticCurrentRound = async () => {
    setLoadingStatisticCurrentRound(true);
    try {
      const response = await k3GameServices.getStatisticCurrentRound(selectedTimeConfig);
      if (response?.code === 0) {
        setCurrentGame(response.data);
        if (response.data?.currentRound?.endTime) {
          const timeEnd = getSecondsLeftFromIST(response.data.currentRound.endTime);
          setSecondsLeft(timeEnd);
        }
      } else {
        message.error(response?.message || 'Failed to fetch current round statistics');
      }
    } catch (error: any) {
      message.error(error?.message || 'An error occurred');
    } finally {
      setLoadingStatisticCurrentRound(false);
    }
  };

  const handleDiceInputChange = (issueNumber: string, diceNumber: number, value: string) => {
    const numValue = value ? parseInt(value) : null;
    if (numValue !== null && (numValue < 1 || numValue > 6)) {
      message.error('Dice value must be between 1 and 6');
      return;
    }
    
    setDiceInputs(prev => ({
      ...prev,
      [issueNumber]: {
        ...prev[issueNumber],
        [`dice${diceNumber}`]: numValue
      }
    }));
  };

  const handleSetResult = async (issueNumber: string) => {
    const diceValues = diceInputs[issueNumber];
    if (!diceValues || !diceValues.dice1 || !diceValues.dice2 || !diceValues.dice3) {
      message.error('Please enter all three dice values');
      return;
    }

    try {
      const response = await k3GameServices.setK3GameResult({
        issueNumber,
        dice1: diceValues.dice1,
        dice2: diceValues.dice2,
        dice3: diceValues.dice3
      });
      if (response?.code === 0) {
        message.success('Set result successfully');
        setIsSetResultSuccess(true);
        // Clear the dice inputs for this issue number
        setDiceInputs(prev => {
          const newInputs = { ...prev };
          delete newInputs[issueNumber];
          return newInputs;
        });
        getListNextRounds();
        getStatisticCurrentRound();
      } else {
        message.error(response?.message || 'Failed to set result');
      }
    } catch (error: any) {
      message.error(error?.message || 'An error occurred');
    }
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

  // Initialize data
  const initData = () => {
    getStatisticCurrentRound();
    getListCompletedRounds();
    getListNextRounds();
  };

  // Effects
  useEffect(() => {
    initData();
  }, [selectedTimeConfig]);

  useEffect(() => {
    if (isSetResultSuccess) {
      setTimeout(() => {
        setIsSetResultSuccess(false);
      }, 1000);
    }
  }, [isSetResultSuccess]);

  useEffect(() => {
    if (secondsLeft < 0) {
      initData();
      return;
    }

    let timeLeft = secondsLeft;
    const timer = setInterval(() => {
      timeLeft = timeLeft - 1;
      setSecondsLeft(timeLeft);

      // Call api every 3 seconds
      if (timeLeft % 3 === 0 && timeLeft > 0) {
        getStatisticCurrentRound();
      }

      if (timeLeft <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft]);

  const renderGameNumbers = () => {
    if (!currentGame?.currentRound) return null;
    
    const numbers = [
      currentGame.currentRound.resultDice1,
      currentGame.currentRound.resultDice2,
      currentGame.currentRound.resultDice3
    ];
    
    return (
      <div className="game-numbers">
        {numbers.map((number: number | null, index: number) => (
          <div key={index} className="number-circle">
            {number !== null ? number : '?'}
          </div>
        ))}
      </div>
    );
  };

  const renderCountdown = () => {
    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;
    
    const minutesStr = minutes.toString().padStart(2, '0');
    const secondsStr = seconds.toString().padStart(2, '0');

    return (
      <div className="game-countdown">
        <div style={{gap: '10px'}} className="countdown-digits">
          <div className="countdown-digit">{minutesStr[0]}</div>
          <div className="countdown-digit">{minutesStr[1]}</div>
          <div className="countdown-separator">:</div>
          <div className="countdown-digit">{secondsStr[0]}</div>
          <div className="countdown-digit">{secondsStr[1]}</div>
        </div>
      </div>
    );
  };

  const renderBetTable = (roundData: any) => {
    if (!roundData) return null;
    const currentRound = roundData;
    return (
      <div className="bet-tables-container">
        {/* Bảng tổng số từ 3-18 */}
        <div className="total-number-table">
          <table className="k3-table">
            <tbody>
              <tr>
                <td rowSpan={2} className="first-cell">Tổng số</td>
                <td>3</td>
                <td>4</td>
                <td>5</td>
                <td>6</td>
                <td>7</td>
                <td>8</td>
                <td>9</td>
                <td>10</td>
                <td>11</td>
                <td>12</td>
                <td>13</td>
                <td>14</td>
                <td>15</td>
                <td>16</td>
                <td>17</td>
                <td>18</td>
              </tr>
              <tr>
                <td>{currentRound.totalBetSum3?.toLocaleString() || 0} đ</td>
                <td>{currentRound.totalBetSum4?.toLocaleString() || 0} đ</td>
                <td>{currentRound.totalBetSum5?.toLocaleString() || 0} đ</td>
                <td>{currentRound.totalBetSum6?.toLocaleString() || 0} đ</td>
                <td>{currentRound.totalBetSum7?.toLocaleString() || 0} đ</td>
                <td>{currentRound.totalBetSum8?.toLocaleString() || 0} đ</td>
                <td>{currentRound.totalBetSum9?.toLocaleString() || 0} đ</td>
                <td>{currentRound.totalBetSum10?.toLocaleString() || 0} đ</td>
                <td>{currentRound.totalBetSum11?.toLocaleString() || 0} đ</td>
                <td>{currentRound.totalBetSum12?.toLocaleString() || 0} đ</td>
                <td>{currentRound.totalBetSum13?.toLocaleString() || 0} đ</td>
                <td>{currentRound.totalBetSum14?.toLocaleString() || 0} đ</td>
                <td>{currentRound.totalBetSum15?.toLocaleString() || 0} đ</td>
                <td>{currentRound.totalBetSum16?.toLocaleString() || 0} đ</td>
                <td>{currentRound.totalBetSum17?.toLocaleString() || 0} đ</td>
                <td>{currentRound.totalBetSum18?.toLocaleString() || 0} đ</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Bảng lớn nhỏ và chẵn lẻ */}
        <div className="bet-table-section">
          <table className="k3-table">
            <tbody>
              <tr className="section-row">
                <td className="first-cell" rowSpan={4}>Tổng số</td>
                <td className="sub-label">Lớn nhỏ</td>
                <td>Lớn</td>
                <td>Nhỏ</td>
              </tr>
              <tr>
                <td className="sub-label">Tổng đặt</td>
                <td className="big-value">{currentRound.totalBetBig?.toLocaleString() || 0} đ</td>
                <td className="small-value">{currentRound.totalBetSmall?.toLocaleString() || 0} đ</td>
              </tr>
              <tr className="section-row">
                <td className="sub-label">Chẵn lẻ</td>
                <td className="odd-option">Lẻ</td>
                <td className="even-option">Chẵn</td>
              </tr>
              <tr>
                <td className="sub-label">Tổng đặt</td>
                <td className="odd-value">{currentRound.totalBetOdd?.toLocaleString() || 0} đ</td>
                <td className="even-value">{currentRound.totalBetEven?.toLocaleString() || 0} đ</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Phần "2 số trùng" */}
        <div className="bet-table-section">
          <table className="k3-table">
            <tbody>
              <tr className="section-row">
                <td className="number-category" rowSpan={4}>2 số trùng</td>
                <td colSpan={1} className="bet-category">2 con số trùng</td>
                <td>11</td>
                <td>22</td>
                <td>33</td>
                <td>44</td>
                <td>55</td>
                <td>66</td>
              </tr>
              <tr>
                <td colSpan={1} className="bet-category">Tổng đặt</td>
                <td>{currentRound.totalBetDouble1?.toLocaleString() || 0} đ</td>
                <td>{currentRound.totalBetDouble2?.toLocaleString() || 0} đ</td>
                <td>{currentRound.totalBetDouble3?.toLocaleString() || 0} đ</td>
                <td>{currentRound.totalBetDouble4?.toLocaleString() || 0} đ</td>
                <td>{currentRound.totalBetDouble5?.toLocaleString() || 0} đ</td>
                <td>{currentRound.totalBetDouble6?.toLocaleString() || 0} đ</td>
              </tr>
              <tr className="section-row">
                <td colSpan={1} className="bet-category">Một cặp số đặc biệt</td>
                <td>11</td>
                <td>22</td>
                <td>33</td>
                <td>44</td>
                <td>55</td>
                <td>66</td>
              </tr>
              <tr>
                <td colSpan={1} className="bet-category">Tổng đặt</td>
                <td>{currentRound.totalBetDoubleAny?.toLocaleString() || 0} đ</td>
                <td>{currentRound.totalBetDoubleAny?.toLocaleString() || 0} đ</td>
                <td>{currentRound.totalBetDoubleAny?.toLocaleString() || 0} đ</td>
                <td>{currentRound.totalBetDoubleAny?.toLocaleString() || 0} đ</td>
                <td>{currentRound.totalBetDoubleAny?.toLocaleString() || 0} đ</td>
                <td>{currentRound.totalBetDoubleAny?.toLocaleString() || 0} đ</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Phần "3 số trùng" */}
        <div className="bet-table-section">
          <table className="k3-table">
            <tbody>
              <tr className="section-row">
                <td className="number-category" rowSpan={6}>3 số trùng</td>
                <td colSpan={1} className="bet-category">3 con số giống nhau</td>
                <td>111</td>
                <td>222</td>
                <td>333</td>
                <td>444</td>
                <td>555</td>
                <td>666</td>
              </tr>
              <tr>
                <td colSpan={1} className="bet-category">Tổng đặt</td>
                <td>{currentRound.totalBetTriple1?.toLocaleString() || 0} đ</td>
                <td>{currentRound.totalBetTriple2?.toLocaleString() || 0} đ</td>
                <td>{currentRound.totalBetTriple3?.toLocaleString() || 0} đ</td>
                <td>{currentRound.totalBetTriple4?.toLocaleString() || 0} đ</td>
                <td>{currentRound.totalBetTriple5?.toLocaleString() || 0} đ</td>
                <td>{currentRound.totalBetTriple6?.toLocaleString() || 0} đ</td>
              </tr>
              <tr className="section-row">
                <td colSpan={1} className="bet-category">3 con số giống nhau nhưng nhiên</td>
                <td colSpan={9} className="centered-text">3 con số giống nhau</td>
              </tr>
              <tr>
                <td colSpan={1} className="bet-category">Tổng đặt</td>
                <td colSpan={9}>{currentRound.totalBetTripleAny?.toLocaleString() || 0} đ</td>
              </tr>
              <tr className="section-row">
                <td colSpan={1} className="bet-category">3 con số khác nhau</td>
                <td>1</td>
                <td>2</td>
                <td>3</td>
                <td>4</td>
                <td>5</td>
                <td>6</td>
              </tr>
              <tr>
                <td colSpan={1} className="bet-category">Tổng đặt</td>
                <td colSpan={6}>{currentRound.totalBetThreeDistinct?.toLocaleString() || 0} đ</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Phần "Khác số" */}
        <div className="bet-table-section">
          <table className="k3-table">
            <tbody>
              <tr className="section-row">
                <td className="number-category" rowSpan={4}>Khác số</td>
                <td colSpan={1} className="bet-category">3 con số liên tiếp</td>
                <td colSpan={9} className="centered-text">3 con số liên tiếp</td>
              </tr>
              <tr>
                <td colSpan={1} className="bet-category">Tổng đặt</td>
                <td colSpan={9}>{currentRound.totalBetThreeConsecutive?.toLocaleString() || 0} đ</td>
              </tr>
              <tr className="section-row">
                <td colSpan={1} className="bet-category">2 con số khác nhau</td>
                <td>1</td>
                <td>2</td>
                <td>3</td>
                <td>4</td>
                <td>5</td>
                <td>6</td>
              </tr>
              <tr>
                <td colSpan={1} className="bet-category">Tổng đặt</td>
                <td colSpan={6}>{currentRound.totalBetTwoDistinct?.toLocaleString() || 0} đ</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderCurrentGameSection = (gameData: any) => {
    if (!gameData?.currentRound) return null;
    const currentRound = gameData.currentRound;
    const startTime = new Date(currentRound.startTime).toLocaleTimeString();
    const endTime = new Date(currentRound.endTime).toLocaleTimeString();
    return (
      <div style={{display: 'flex', flexDirection: 'column', width: '100%'}} className="current-game-info">
        <div className="game-header-info">
          <span>Phiên {currentRound.issueNumber}</span>
          <span>Tổng giá trị {currentRound.totalBetAmount.toLocaleString()} đ</span>
          <span>Số người chơi: {currentRound.playerCount}</span>
          <span>{startTime} → {endTime}</span>
        </div>
        <div style={{width: '100%'}}>
          {renderBetTable(currentRound)}
        </div>
        <BettingStatistics statisticCustomersOrder={gameData?.statisticCustomersOrder || []} />
      </div>
    );
  };

  const renderUpcomingBets = () => {
    return (
      <div className="upcoming-bets">
        <h3 className="section-title">ĐẶT TRƯỚC KẾT QUẢ</h3>
        <table className="k3-table">
          <thead>
            <tr>
              <th>Phiên</th>
              <th>Thời gian</th>
              <th>Tổng giá trị</th>
              <th>Số người chơi</th>
              <th>Điểm xúc xắc 1</th>
              <th>Điểm xúc xắc 2</th>
              <th>Điểm xúc xắc 3</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {listNextRound.map((game) => (
              <tr key={game.id} className={game.state === 'WAITING' ? 'waiting-round' : ''}>
                <td>{game.issueNumber}</td>
                <td>{game.startTime} → {game.endTime}</td>
                <td>{game.totalBetAmount.toLocaleString()} đ</td>
                <td>{game.playerCount}</td>
                <td>
                  <Input 
                    placeholder="Nhập số điểm"
                    value={diceInputs[game.issueNumber]?.dice1 || ''}
                    onChange={(e) => handleDiceInputChange(game.issueNumber, 1, e.target.value)}
                    disabled={game.state !== 'WAITING'}
                  />
                </td>
                <td>
                  <Input 
                    placeholder="Nhập số điểm"
                    value={diceInputs[game.issueNumber]?.dice2 || ''}
                    onChange={(e) => handleDiceInputChange(game.issueNumber, 2, e.target.value)}
                    disabled={game.state !== 'WAITING'}
                  />
                </td>
                <td>
                  <Input 
                    placeholder="Nhập số điểm"
                    value={diceInputs[game.issueNumber]?.dice3 || ''}
                    onChange={(e) => handleDiceInputChange(game.issueNumber, 3, e.target.value)}
                    disabled={game.state !== 'WAITING'}
                  />
                </td>
                <td>
                  <Button 
                    type="primary"
                    onClick={() => handleSetResult(game.issueNumber)}
                    disabled={game.state !== 'WAITING'}
                  >
                    Đặt trước kết quả
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderGameHistory = () => {
    return (
      <div className="game-history">
        <h3 className="section-title">GAME GẦN ĐÂY</h3>
        <table className="k3-table">
          <thead>
            <tr>
              <th>Phiên</th>
              <th>Tổng giá trị</th>
              <th>Số thắng</th>
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
                <td>{`${game.resultDice1},${game.resultDice2},${game.resultDice3}`}</td>
                <td>{game.totalWinAmount.toLocaleString()} đ</td>
                <td>{game.startTime} → {game.endTime}</td>
                <td>
                  <Button type="primary" onClick={() => handleShowDetail(game)}>Chi tiết</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="gx-main-content">
      <Widget>
        <div className="k3-game-container">
          <div className="game-header">
            <h2>Thông tin game</h2>
            {/* <div className="game-filters">
              <Button type="primary">
                <i className="icon-chart"></i> D/s User lãi (game) trên 500,000 ₫
              </Button>
              <Button>
                <i className="icon-chart"></i> D/s User lãi (tổng) trên 500,000 ₫
              </Button>
            </div> */}
            <div className="time-tabs">
              {TIME_CONFIGS.map((config) => (
                <Button 
                  key={config.value}
                  style={{
                    backgroundColor: selectedTimeConfig === config.value ? 'red' : '#fff',
                    color: selectedTimeConfig === config.value ? '#fff' : '#000',
                    border: selectedTimeConfig === config.value ? '1px solid red' : '1px solid #ccc',
                  }}
                  type={selectedTimeConfig === config.value ? "primary" : 'default'}
                  onClick={() => setSelectedTimeConfig(config.value)}
                >
                  {config.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="game-current">
            <h3 className="section-title">GAME HIỆN TẠI</h3>
            {renderCountdown()}
            {renderCurrentGameSection(currentGame)}
          </div>

          {renderUpcomingBets()}
          {renderGameHistory()}
        </div>
      </Widget>
      <Modal
        visible={isDetailModalOpen}
        onCancel={handleCloseDetail}
        footer={null}
        width={900}
        title={`Chi tiết phiên ${detailRound?.currentRound?.issueNumber || ''}`}
      >
        {detailRound && renderCurrentGameSection(detailRound)}
      </Modal>
    </div>
  );
};

export default K3Game; 