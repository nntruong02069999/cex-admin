import { Tag, Radio, RadioChangeEvent } from "antd";
import { AlignType } from "rc-table/lib/interface";
import { ColumnsType } from "antd/lib/table";
import dayjs from "dayjs";
import BtnSetResult from "./BtnSetResult";
import BtnRecentGame from "./BtnRecentGame";
import * as gameHelpers from "@src/util/gameHelpers";
import {
  ARRAY_GAME_RESULT_SIDE_WINNERS,
  CURRENCY,
  SECONDS_TO_DISABLE_SET_RESULT_GAME,
} from "@src/constants/constants";
import { GameCompletedRound } from "@src/interfaces/WingoGame";
import { GAME_RESULT_SIDE_WINNER } from "@src/constants/enums";

// Assuming ARRAY_UNIT_DIGITS items have a structure like this, define it for better type safety
interface UnitDigitOption {
  id: number;
  name: string;
  value: GAME_RESULT_SIDE_WINNER;
}

export const columnsCompletedRound: ColumnsType<GameCompletedRound> = [
  {
    title: "Phiên",
    dataIndex: "issueNumber",
    key: "issueNumber",
    align: "center" as AlignType,
    width: 120,
  },
  {
    title: "Tổng mua",
    dataIndex: "totalBuy",
    key: "totalBuy",
    align: "center" as AlignType,
    width: 100,
   render: (value: number) => {
       return <span>{CURRENCY + value}</span>;
    },
  },
  {
    title: "Tổng bán",
    dataIndex: "totalSell",
    key: "totalSell",
    align: "center" as AlignType,
    width: 100,
   render: (value: number) => {
       return <span>{CURRENCY + value}</span>;
    },
  },
  {
    title: "Kết quả",
    dataIndex: "sideWinner",
    key: "sideWinner",
    align: "center" as AlignType,
    width: 120,
    render: (value: GAME_RESULT_SIDE_WINNER) => {
      const findSideWinner = ARRAY_GAME_RESULT_SIDE_WINNERS.find(
        (item: UnitDigitOption) => item.value === value
      );
      const isBuy = value === GAME_RESULT_SIDE_WINNER.BUY;
      return (
        <Tag color={isBuy ? "#04c793" : "#fa4b62"} key={value}>
          {findSideWinner?.name}
        </Tag>
      );
    },
  },
  {
    title: "Số tiền trả cho khách",
    dataIndex: "totalWinAmount",
    key: "totalWinAmount",
    align: "center" as AlignType,
    width: 150,
    render: (value: number) => gameHelpers.renderShowAmount(value),
  },
  {
    title: "Lợi nhuận",
    dataIndex: "houseProfit",
    key: "houseProfit",
    align: "center" as AlignType,
    width: 150,
    render: (value: number) => gameHelpers.renderShowAmount(value),
  },
  {
    title: "Thời gian",
    dataIndex: "timestamp",
    key: "timestamp",
    align: "center" as AlignType,
    width: 150,
    render: (value: number) => {
      const date = dayjs(value * 1000).format("DD/MM/YYYY");
      const startTime = dayjs(value * 1000).format("HH:mm:ss");
      const endTime = dayjs(value * 1000).add(29, "second").format("HH:mm:ss");
      return `${date + "  " + startTime + " > " + endTime}`;
    },
  },
  {
    title: "Hành động",
    key: "id",
    dataIndex: "id",
    align: "center" as AlignType,
    width: 120,
    render: (value: string, record: GameCompletedRound) => {
      return <BtnRecentGame currentGameInfos={record} />;
    },
  },
];

export const columnsNextRound = (
  loadingNextRound: boolean,
  secondsLeft: number,
  setIsSetResultSuccess: (data: boolean) => void,
  onResultChange: (
    issueNumber: string,
    newResult: GAME_RESULT_SIDE_WINNER | null
  ) => void
): ColumnsType<GameCompletedRound> => [
  {
    title: "Phiên",
    dataIndex: "issueNumber",
    key: "issueNumber",
    align: "center" as AlignType,
    width: 140,
    render: (text: string, record: GameCompletedRound, index: number) => {
      const isFirstRow = index === 0;
      const countdownTextArr =
        gameHelpers.renderArrayTextCountdown(secondsLeft);
      return (
        <div>
          <span
            className="gx-d-block"
            style={{ fontWeight: isFirstRow ? "bold" : "normal" }}
          >
            {text}
          </span>
          <span className="gx-d-block">
            {isFirstRow && countdownTextArr.join("")}
          </span>
        </div>
      );
    },
  },
  {
    title: "Thời gian",
    dataIndex: "timestamp",
    key: "timestamp",
    align: "center" as AlignType,
    width: 400,
    render: (value: number, record: GameCompletedRound, index: number) => {
      const isFirstRow = index === 0;
      const date = dayjs(value * 1000).format("DD/MM/YYYY");
      const startTime = dayjs(value * 1000).format("HH:mm:ss");
      const endTime = dayjs(value * 1000).add(29, "second").format("HH:mm:ss");
      return (
        <span style={{ fontWeight: isFirstRow ? "bold" : "normal" }}>
          {date + "  " + startTime + " > " + endTime}
        </span>
      );
    },
  },
  {
    title: "Kết quả",
    dataIndex: "sideWinner",
    key: "sideWinner",
    align: "center" as AlignType,
    width: 120,
    render: (
      value: GAME_RESULT_SIDE_WINNER | null,
      record: GameCompletedRound,
      index: number
    ) => {
      const isFirstRow = index === 0;
      const isDisabled =
        loadingNextRound ||
        (secondsLeft <= SECONDS_TO_DISABLE_SET_RESULT_GAME && isFirstRow);

      const handleChange = (e: RadioChangeEvent) => {
        const radioValue = e.target.value;
        const newResultNumber = radioValue !== null ? radioValue : null;
        onResultChange(record.issueNumber, newResultNumber);
      };

      return (
        <Radio.Group
          disabled={isDisabled}
          value={value}
          onChange={handleChange}
          name={`wingo-completed-round-${record.id}`}
          optionType="button"
          options={ARRAY_GAME_RESULT_SIDE_WINNERS.map((item: UnitDigitOption) => ({
            label: item.name,
            value: item.value,
          }))}
        />
      );
    },
  },
  {
    title: "Hành động",
    dataIndex: "issueNumber",
    key: "issueNumber",
    align: "center" as AlignType,
    width: 100,
    render: (value: string, record: GameCompletedRound, index: number) => {
      const isFirstRow = index === 0;
      return (
        <BtnSetResult
          value={value}
          record={record}
          setIsSetResultSuccess={setIsSetResultSuccess}
          secondsLeft={secondsLeft}
          isFirstRow={isFirstRow}
          loadingNextRound={loadingNextRound}
        />
      );
    },
  },
];
