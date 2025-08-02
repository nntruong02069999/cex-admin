import { Typography } from "antd";
import dayjs from "dayjs";
import { get } from "lodash";
import { ARRAY_FIVE_D_GAME_DIGITS, CURRENCY } from "@src/constants/constants";
import { FiveDGameCompletedRound } from "@src/interfaces/5DGame";

export const renderArrayTextCountdown = (secondsLeft: number) => {
  if (secondsLeft >= 0) {
    const minutes = Math.floor((secondsLeft % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (secondsLeft % 60).toString().padStart(2, "0");
    const merge = `${minutes}:${seconds}`;

    return merge.split("");
  } else {
    return [];
  }
};

export const renderShowAmount = (amount: number) => {
  if (amount > 0) {
    return (
      <span color="#16a34a">
        {CURRENCY + amount}
      </span>
    )
  } else if (amount < 0) {
    return (
      <span style={{ color: "#dc2626" }}>
        {"-" + CURRENCY + Math.abs(amount)}
      </span>
    )
  } else {
    return (
      <span>{CURRENCY + 0} </span>
    )
  }
}


export const renderDataCurrentGame = (currentGameInfos: Partial<FiveDGameCompletedRound>) => {
  return ARRAY_FIVE_D_GAME_DIGITS.map((item: any) => {
    return {
      ...item,
      large: get(currentGameInfos, `totalBet${item.value}High`, 0),
      small: get(currentGameInfos, `totalBet${item.value}Low`, 0),
      even: get(currentGameInfos, `totalBet${item.value}Even`, 0),
      odd: get(currentGameInfos, `totalBet${item.value}Odd`, 0),
      0: get(currentGameInfos, `totalBet${item.value}0`, 0),
      1: get(currentGameInfos, `totalBet${item.value}1`, 0),
      2: get(currentGameInfos, `totalBet${item.value}2`, 0),
      3: get(currentGameInfos, `totalBet${item.value}3`, 0),
      4: get(currentGameInfos, `totalBet${item.value}4`, 0),
      5: get(currentGameInfos, `totalBet${item.value}5`, 0),
      6: get(currentGameInfos, `totalBet${item.value}6`, 0),
      7: get(currentGameInfos, `totalBet${item.value}7`, 0),
      8: get(currentGameInfos, `totalBet${item.value}8`, 0),
      9: get(currentGameInfos, `totalBet${item.value}9`, 0),
    };
  });
};

export const renderTitleCurrentGame = (currentGameInfos: Partial<FiveDGameCompletedRound>) => {
  return (
    <Typography.Title level={5}>
      <div className="is-header-infos">
        <span>
          Phiên
          <b className="is-session">{currentGameInfos?.issueNumber}</b>
        </span>
        <span>
          Tổng giá trị
          <b className="is-total-value">
            {currentGameInfos?.totalBetAmount} ₹
          </b>
        </span>
        <span>
          {dayjs(currentGameInfos?.startTime).format("DD/MM/YYYY")}
          <b>
            {dayjs(currentGameInfos?.startTime).format("HH:mm") +
              " > " +
              dayjs(currentGameInfos?.endTime).format("HH:mm")}
          </b>
        </span>
      </div>
    </Typography.Title>
  );
}