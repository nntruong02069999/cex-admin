import { get } from "lodash";
import { ARRAY_UNIT_DIGITS, CURRENCY } from "@src/constants/constants";
import { WingoGameCompletedRound } from "@src/interfaces/WingoGame";

interface CurrentGameStatisticsProps {
  currentGameInfos: Partial<WingoGameCompletedRound>;
}

const CurrentGameStatistics: React.FC<CurrentGameStatisticsProps> = (
  props: CurrentGameStatisticsProps
) => {
  const { currentGameInfos } = props;

  return (
    <div className="game-history">
      <div className="color-bets">
        <div className="color-row">
          <div className="color-label">Màu sắc</div>
          <div
            style={{ backgroundColor: "#27ae60", color: "white" }}
            className="color-green"
          >
            Xanh
          </div>
          <div
            style={{ backgroundColor: "#9b59b6", color: "white" }}
            className="color-pink"
          >
            Tím
          </div>
          <div
            style={{ backgroundColor: "#e74c3c", color: "white" }}
            className="color-red"
          >
            Đỏ
          </div>
        </div>
        <div className="color-row">
          <div className="bet-label">Tổng đặt</div>
          <div className="bet-amount">
            {get(currentGameInfos, "totalGreenBets", 0) + CURRENCY}
          </div>
          <div className="bet-amount">
            {get(currentGameInfos, "totalPurpleBets", 0) + CURRENCY}
          </div>
          <div className="bet-amount">
            {get(currentGameInfos, "totalRedBets", 0) + CURRENCY}
          </div>
        </div>
      </div>

      <div className="number-bets">
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

      <div className="size-bets">
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
