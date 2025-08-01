import { Tag, Radio, RadioChangeEvent } from "antd";
import { AlignType } from "rc-table/lib/interface";
import { ColumnsType } from "antd/lib/table";
import dayjs from "dayjs";
import BtnSetResult from "./BtnSetResult";
import BtnRecentGame from "./BtnRecentGame";
import * as gameHelpers from "@src/util/gameHelpers";
import {
  ARRAY_UNIT_DIGITS,
  CURRENCY,
  SECONDS_TO_DISABLE_SET_RESULT_GAME,
} from "@src/constants/constants";
import { WingoGameCompletedRound } from "@src/interfaces/WingoGame";

// Assuming ARRAY_UNIT_DIGITS items have a structure like this, define it for better type safety
interface UnitDigitOption {
  id: string | number;
  name: string;
  value: number;
}

export const columnsCompletedRound: ColumnsType<WingoGameCompletedRound> = [
  {
    title: "Phiên",
    dataIndex: "issueNumber",
    key: "issueNumber",
    align: "center" as AlignType,
    width: 120,
  },
  {
    title: "Tổng giá trị",
    dataIndex: "totalBetAmount",
    key: "totalBetAmount",
    align: "center" as AlignType,
    width: 100,
    render: (value: number) => `${value + CURRENCY}`,
  },
  {
    title: "Kết quả",
    dataIndex: "resultNumber",
    key: "resultNumber",
    align: "center" as AlignType,
    width: 120,
    render: (value: number) => {
      return (
        <Tag color="#ee2634" key={value}>
          {value}
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
    render: (value: number) => (
      <span style={{ color: "#ee2634" }}>
        {value ? value + CURRENCY : 0 + CURRENCY}
      </span>
    ),
  },
  {
    title: "Thời gian",
    dataIndex: "id",
    key: "id",
    align: "center" as AlignType,
    width: 150,
    render: (value: string, record: WingoGameCompletedRound) => {
      const date = dayjs(record?.startTime).format("DD/MM/YYYY");
      const startTime = dayjs(record?.startTime).format("HH:mm");
      const endTime = dayjs(record?.endTime).format("HH:mm");
      return `${date + "  " + startTime + " > " + endTime}`;
    },
  },
  {
    title: "Hành động",
    key: "id",
    dataIndex: "id",
    align: "center" as AlignType,
    width: 120,
    render: (value: string, record: WingoGameCompletedRound) => {
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
    newResult: number | null
  ) => void
): ColumnsType<WingoGameCompletedRound> => [
  {
    title: "Phiên",
    dataIndex: "issueNumber",
    key: "issueNumber",
    align: "center" as AlignType,
    width: 140,
    render: (text: string, record: WingoGameCompletedRound, index: number) => {
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
    dataIndex: "id",
    key: "id",
    align: "center" as AlignType,
    width: 400,
    render: (value: string, record: WingoGameCompletedRound, index: number) => {
      const isFirstRow = index === 0;
      const date = dayjs(record?.startTime).format("DD/MM/YYYY");
      const startTime = dayjs(record?.startTime).format("HH:mm");
      const endTime = dayjs(record?.endTime).format("HH:mm");
      return (
        <span style={{ fontWeight: isFirstRow ? "bold" : "normal" }}>
          {date + "  " + startTime + " > " + endTime}
        </span>
      );
    },
  },
  {
    title: "Kết quả",
    dataIndex: "resultNumber",
    key: "resultNumber",
    align: "center" as AlignType,
    width: 120,
    render: (
      value: number | null,
      record: WingoGameCompletedRound,
      index: number
    ) => {
      const isFirstRow = index === 0;
      const isDisabled =
        loadingNextRound ||
        (secondsLeft <= SECONDS_TO_DISABLE_SET_RESULT_GAME && isFirstRow);

      const handleChange = (e: RadioChangeEvent) => {
        const radioValue = e.target.value;
        const newResultNumber = radioValue !== null ? Number(radioValue) : null;
        onResultChange(record.issueNumber, newResultNumber);
      };

      return (
        <Radio.Group
          disabled={isDisabled}
          value={value}
          onChange={handleChange}
          name={`wingo-completed-round-${record.id}`}
          optionType="button"
          options={ARRAY_UNIT_DIGITS.map((item: UnitDigitOption) => ({
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
    render: (value: string, record: WingoGameCompletedRound, index: number) => {
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
