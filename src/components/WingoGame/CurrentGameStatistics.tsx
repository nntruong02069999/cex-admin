import { get } from "lodash";
import { ARRAY_UNIT_DIGITS, CURRENCY } from "@src/constants/constants";
import { GameCompletedRound } from "@src/interfaces/WingoGame";

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
          <div className="bet-amount">
            {currentGameInfos?.issueNumber}
          </div>
        </div>
        <div className="color-row">
          <div className="color-label">Đã chọn</div>
          <div
            style={{ backgroundColor: "rgb(49, 204, 101)", color: "white", display: "flex", alignItems: "center", gap: "5px" }}
            className="color-green"

          >
            <img alt="buy" src="https://fiboex.net/static/media/greenup.c951824017a7b11c0dda86fb784f0e6f.svg"></  img>
            Mua
          </div>
          <div
            style={{ backgroundColor: "rgb(209, 47, 36)", color: "white", display: "flex", alignItems: "center", gap: "5px" }}
            className="color-pink"
          >
            <img alt="sell" src="https://fiboex.net/static/media/reddown.4e688600b1135732f6a23700e439250f.svg"></img>
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
