import { get } from "lodash";
import { CURRENCY } from "@src/constants/constants";
import { GameCompletedRound } from "@src/interfaces/WingoGame";
import upIcon from "@src/assets/images/up.svg";
import downIcon from "@src/assets/images/down.svg";

interface CurrentGameStatisticsProps {
  currentGameInfos: Partial<GameCompletedRound>;
}

const CurrentGameStatistics: React.FC<CurrentGameStatisticsProps> = (
  props: CurrentGameStatisticsProps
) => {
  const { currentGameInfos } = props;

  return (
    <div className="game-history">
      <div className="color-bets">
        <div className="color-row">
          <div className="bet-label">Phiên</div>
          <div className="bet-amount">{currentGameInfos?.issueNumber}</div>
        </div>
        <div className="color-row">
          <div className="color-label">Đã chọn</div>
          <div
            style={{
              backgroundColor: "#04c793",
              color: "white",
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
            className="color-green"
          >
            <img alt="buy" src={upIcon}></img>
            Mua
          </div>
          <div
            style={{
              backgroundColor: "#fa4b62",
              color: "white",
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
            className="color-pink"
          >
            <img alt="sell" src={downIcon}></img>
            Bán
          </div>
        </div>
        <div className="color-row">
          <div className="bet-label">Tổng tiền</div>
          <div className="bet-amount">
            {CURRENCY + get(currentGameInfos, "totalBuy", 0)}
          </div>
          <div className="bet-amount">
            {CURRENCY + get(currentGameInfos, "totalSell", 0)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrentGameStatistics;
