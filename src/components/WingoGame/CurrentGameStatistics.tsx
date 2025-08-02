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
            style={{ backgroundColor: "rgb(49, 204, 101)", color: "white" }}
            className="color-green"
          >
            Mua
          </div>
          <div
            style={{ backgroundColor: "rgb(209, 47, 36)", color: "white" }}
            className="color-pink"
          >
            Bán
          </div>
        </div>
        <div className="color-row">
          <div className="bet-label">Tổng tiền</div>
          <div className="bet-amount">
            {CURRENCY + get(currentGameInfos, "totalBuy", 0) }
          </div>
          <div className="bet-amount">
            {CURRENCY +  get(currentGameInfos, "totalSell", 0) }
          </div>
        </div>
      </div>

      <div className="number-bets" style={{display: "none"}}>
        <div className="number-row">
          <div className="number-label">Số</div>
          {ARRAY_UNIT_DIGITS.map((item) => (
            <div
              key={item.id}
              style={{ background: item.backgroundColor }}
              className="number-item"
            >
              {item.name}
            </div>
          ))}
        </div>
        <div className="number-row">
          <div className="bet-label">Tổng đặt</div>
          {ARRAY_UNIT_DIGITS.map((item) => {
            const totalBetNumber = get(
              currentGameInfos,
              `totalBetNumber${item.value}`,
              0
            );
            return (
              <div key={item.id} className="bet-amount">
                {totalBetNumber + CURRENCY}
              </div>
            );
          })}
        </div>
      </div>

      <div className="size-bets" style={{display: "none"}}>
        <div className="size-row">
          <div className="size-label">Lớn nhỏ</div>
          <div
            className="size-big"
            style={{ backgroundColor: "#FEAA57", color: "white" }}
          >
            Lớn
          </div>
          <div
            className="size-small"
            style={{ backgroundColor: "#6EA8F4", color: "white" }}
          >
            Nhỏ
          </div>
        </div>
        <div className="size-row">
          <div className="bet-label">Tổng đặt</div>
          <div className="bet-amount">
            {get(currentGameInfos, "totalBigBets", 0) + CURRENCY}
          </div>
          <div className="bet-amount">
            {get(currentGameInfos, "totalSmallBets", 0) + CURRENCY}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrentGameStatistics;
