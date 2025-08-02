import { Button, message } from "antd";
import { get } from "lodash";
import { useState } from "react";

import * as wingoGameServices from "@src/services/wingo-game";
import { GameCompletedRound } from "@src/interfaces/WingoGame";
import { SECONDS_TO_DISABLE_SET_RESULT_GAME } from "@src/constants/constants";

interface BtnSetResultProps {
  value: string;
  record: GameCompletedRound;
  setIsSetResultSuccess: (data: boolean) => void;
  secondsLeft: number;
  isFirstRow: boolean;
  loadingNextRound: boolean;
}

const BtnSetResult: React.FC<BtnSetResultProps> = (
  props: BtnSetResultProps
) => {
  const {
    value,
    record,
    setIsSetResultSuccess,
    secondsLeft,
    isFirstRow,
    loadingNextRound,
  } = props;
  const [isLoading, setIsLoading] = useState(false);

  const isDisabled =
    isLoading ||
    (secondsLeft <= SECONDS_TO_DISABLE_SET_RESULT_GAME && isFirstRow) ||
    loadingNextRound;

  const setWingoGameResult = async () => {
    const sideWinner = get(record, "sideWinner", null);
    console.log("🚀 ~ setWingoGameResult ~ sideWinner:", sideWinner)
    if (sideWinner === null || !sideWinner) {
      message.error("Please choose the result number");
      setIsSetResultSuccess(false);
      return;
    }
    const params = {
      issueNumber: value,
      result: sideWinner,
    };
    setIsLoading(true);
    const result = await wingoGameServices.setWingoGameResult(params);
    if (result.code === 0) {
      message.success(result?.message);
      setIsLoading(false);
      setIsSetResultSuccess(true);
    } else {
      message.error(result?.message);
      setIsLoading(false);
      setIsSetResultSuccess(false);
    }
  };

  return (
    <Button
      type="primary"
      className="is-btn-submit"
      onClick={setWingoGameResult}
      disabled={isDisabled}
      loading={isLoading}
    >
      Đặt trước kết quả
    </Button>
  );
};

export default BtnSetResult;
