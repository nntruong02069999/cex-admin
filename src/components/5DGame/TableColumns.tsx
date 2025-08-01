import {
  CURRENCY,
  SECONDS_TO_DISABLE_SET_RESULT_GAME,
} from "@src/constants/constants";
import { FiveDGameCompletedRound } from "@src/interfaces/5DGame";
import { InputNumber, Space, Tag } from "antd";
import { pick } from "lodash";
import { AlignType } from "rc-table/lib/interface";
import { ColumnsType } from "antd/lib/table";
import { BtnSetResult } from "./BtnSetResult";
import dayjs from "dayjs";
import * as gameHelpers from "@src/util/gameHelpers";
import { BtnRecentGame } from "./BtnRecentGame";

export const columnsCompletedRound: ColumnsType<any> = [
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
    width: 90,
    render: (value: number) => `${value + CURRENCY}`,
  },
  {
    title: "Số thắng",
    dataIndex: "id",
    key: "id",
    align: "center" as AlignType,
    width: 120,
    render: (value: string, record: FiveDGameCompletedRound) => {
      const resultDigit = pick(record, [
        "resultDigitA",
        "resultDigitB",
        "resultDigitC",
        "resultDigitD",
        "resultDigitE",
      ]);
      const array = Object.values(resultDigit);
      return (
        <Space>
          {array.map((item: number | null) => (
            <Tag color="#ee2634" key={item}>
              {item}
            </Tag>
          ))}
        </Space>
      );
    },
  },
  {
    title: "Số tiền trả cho khách",
    dataIndex: "totalWinAmount",
    key: "totalWinAmount",
    align: "center" as AlignType,
    width: 120,
    render: (value: number) => `${value + CURRENCY}`,
  },
  {
    title: "Thời gian",
    dataIndex: "id",
    key: "id",
    align: "center" as AlignType,
    width: 150,
    render: (value: string, record: FiveDGameCompletedRound) => {
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
    render: (value: string, record: FiveDGameCompletedRound) => {
      return (
        <BtnRecentGame currentGameInfos={record} />
      )
    },
  },
];

export const columnsNextRound = (
  loadingNextRound: boolean,
  secondsLeft: number,
  setIsSetResultSuccess: (data: boolean) => void
): ColumnsType<any> => [
    {
      title: "Phiên",
      dataIndex: "issueNumber",
      key: "issueNumber",
      align: "center" as AlignType,
      width: 140,
      render: (text: string, record: FiveDGameCompletedRound, index: number) => {
        const isFirstRow = index === 0;
        const countdownTextArr = gameHelpers.renderArrayTextCountdown(secondsLeft)
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
      render: (value: string, record: FiveDGameCompletedRound, index: number) => {
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
      title: "Điểm A",
      dataIndex: "resultDigitA",
      key: "resultDigitA",
      align: "center" as AlignType,
      width: 120,
      render: (value: number | null, record: FiveDGameCompletedRound, index: number) => {
        const isFirstRow = index === 0;
        const isDisabled =
          loadingNextRound || 
          (secondsLeft <= SECONDS_TO_DISABLE_SET_RESULT_GAME && isFirstRow);
        return (
          <InputNumber
            placeholder="Nhập số điểm"
            min={0}
            max={9}
            disabled={isDisabled}
            value={value ?? undefined}
            style={{ borderColor: isFirstRow ? "#1890ff" : undefined }}
            onChange={(value) => {
              record.resultDigitA = value !== null ? Number(value) : null;
              // Force re-render by creating a new object
              Object.assign(record, { ...record });
            }}
          />
        );
      },
    },
    {
      title: "Điểm B",
      dataIndex: "resultDigitB",
      key: "resultDigitB",
      align: "center" as AlignType,
      width: 120,
      render: (value: number | null, record: FiveDGameCompletedRound, index: number) => {
        const isFirstRow = index === 0;
        const isDisabled =
          loadingNextRound ||
          (secondsLeft <= SECONDS_TO_DISABLE_SET_RESULT_GAME && isFirstRow);
        return (
          <InputNumber
            placeholder="Nhập số điểm"
            min={0}
            max={9}
            disabled={isDisabled}
            value={value ?? undefined}
            style={{ borderColor: isFirstRow ? "#1890ff" : undefined }}
            onChange={(value) => {
              record.resultDigitB = value !== null ? Number(value) : null;
              // Force re-render by creating a new object
              Object.assign(record, { ...record });
            }}
          />
        );
      },
    },
    {
      title: "Điểm C",
      dataIndex: "resultDigitC",
      key: "resultDigitC",
      align: "center" as AlignType,
      width: 120,
      render: (value: number | null, record: FiveDGameCompletedRound, index: number) => {
        const isFirstRow = index === 0;
        const isDisabled =
          loadingNextRound ||
          (secondsLeft <= SECONDS_TO_DISABLE_SET_RESULT_GAME && isFirstRow);
        return (
          <InputNumber
            placeholder="Nhập số điểm"
            min={0}
            max={9}
            disabled={isDisabled}
            value={value ?? undefined}
            style={{ borderColor: isFirstRow ? "#1890ff" : undefined }}
            onChange={(value) => {
              record.resultDigitC = value !== null ? Number(value) : null;
              // Force re-render by creating a new object
              Object.assign(record, { ...record });
            }}
          />
        );
      },
    },
    {
      title: "Điểm D",
      dataIndex: "resultDigitD",
      key: "resultDigitD",
      align: "center" as AlignType,
      width: 120,
      render: (value: number | null, record: FiveDGameCompletedRound, index: number) => {
        const isFirstRow = index === 0;
        const isDisabled =
          loadingNextRound ||
          (secondsLeft <= SECONDS_TO_DISABLE_SET_RESULT_GAME && isFirstRow);
        return (
          <InputNumber
            placeholder="Nhập số điểm"
            min={0}
            max={9}
            disabled={isDisabled}
            value={value ?? undefined}
            style={{ borderColor: isFirstRow ? "#1890ff" : undefined }}
            onChange={(value) => {
              record.resultDigitD = value !== null ? Number(value) : null;
              // Force re-render by creating a new object
              Object.assign(record, { ...record });
            }}
          />
        );
      },
    },
    {
      title: "Điểm E",
      dataIndex: "resultDigitE",
      key: "resultDigitE",
      align: "center" as AlignType,
      width: 120,
      render: (value: number | null, record: FiveDGameCompletedRound, index: number) => {
        const isFirstRow = index === 0;
        const isDisabled =
          loadingNextRound ||
          (secondsLeft <= SECONDS_TO_DISABLE_SET_RESULT_GAME && isFirstRow);
        return (
          <InputNumber
            placeholder="Nhập số điểm"
            min={0}
            max={9}
            disabled={isDisabled}
            value={value ?? undefined}
            style={{ borderColor: isFirstRow ? "#1890ff" : undefined }}
            onChange={(value) => {
              record.resultDigitE = value !== null ? Number(value) : null;
              // Force re-render by creating a new object
              Object.assign(record, { ...record });
            }}
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
      render: (value: string, record: FiveDGameCompletedRound, index: number) => {
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

export const columnsCurrentGame: ColumnsType<any> = [
  {
    title: "",
    dataIndex: "label",
    key: "label",
    align: "center" as AlignType,
    width: 80,
    render: (text: string) => (
      <span style={{ fontWeight: "bold", color: "#1890ff", fontSize: "16px" }}>
        {text}
      </span>
    ),
  },
  {
    title: "Lớn nhỏ",
    dataIndex: "id",
    key: "id",
    align: "center" as AlignType,
    width: 300,
    children: [
      {
        title: "Lớn",
        dataIndex: "large",
        key: "large",
        width: 150,
        align: "center" as AlignType,
        render: (total: number) => (
          <span
            style={{
              color: total > 0 ? "#4db6ac" : "inherit",
              fontSize: total > 0 ? "16px" : "inherit",
              fontWeight: total > 0 ? "bold" : "normal",
            }}
          >
            {total + CURRENCY}
          </span>
        ),
      },
      {
        title: "Nhỏ",
        dataIndex: "small",
        key: "small",
        width: 150,
        align: "center" as AlignType,
        render: (total: number) => (
          <span
            style={{
              color: total > 0 ? "#4db6ac" : "inherit",
              fontSize: total > 0 ? "16px" : "inherit",
              fontWeight: total > 0 ? "bold" : "normal",
            }}
          >
            {total + CURRENCY}
          </span>
        ),
      },
    ],
  },
  {
    title: "Chẵn lẻ",
    dataIndex: "evenOdd",
    key: "evenOdd",
    width: 100,
    align: "center" as AlignType,
    children: [
      {
        title: "Chẵn",
        dataIndex: "even",
        key: "even",
        width: 100,
        align: "center" as AlignType,
        render: (total: number) => (
          <span
            style={{
              color: total > 0 ? "#7986cb" : "inherit",
              fontSize: total > 0 ? "16px" : "inherit",
              fontWeight: total > 0 ? "bold" : "normal",
            }}
          >
            {total + CURRENCY}
          </span>
        ),
      },
      {
        title: "Lẻ",
        dataIndex: "odd",
        key: "odd",
        width: 100,
        align: "center" as AlignType,
        render: (total: number) => (
          <span
            style={{
              color: total > 0 ? "#7986cb" : "inherit",
              fontSize: total > 0 ? "16px" : "inherit",
              fontWeight: total > 0 ? "bold" : "normal",
            }}
          >
            {total + CURRENCY}
          </span>
        ),
      },
    ],
  },
  {
    title: "Chọn số",
    dataIndex: "total",
    key: "total",
    width: 500,
    align: "center" as AlignType,
    children: [
      {
        title: "0",
        dataIndex: "0",
        key: "0",
        width: 50,
        align: "center" as AlignType,
        render: (total: number) => (
          <span
            style={{
              color: total > 0 ? "#66bb6a" : "inherit",
              fontSize: total > 0 ? "16px" : "inherit",
              fontWeight: total > 0 ? "bold" : "normal",
            }}
          >
            {total + CURRENCY}
          </span>
        ),
      },
      {
        title: "1",
        dataIndex: "1",
        key: "1",
        width: 50,
        align: "center" as AlignType,
        render: (total: number) => (
          <span
            style={{
              color: total > 0 ? "#66bb6a" : "inherit",
              fontSize: total > 0 ? "16px" : "inherit",
              fontWeight: total > 0 ? "bold" : "normal",
            }}
          >
            {total + CURRENCY}
          </span>
        ),
      },
      {
        title: "2",
        dataIndex: "2",
        key: "2",
        width: 50,
        align: "center" as AlignType,
        render: (total: number) => (
          <span
            style={{
              color: total > 0 ? "#66bb6a" : "inherit",
              fontSize: total > 0 ? "16px" : "inherit",
              fontWeight: total > 0 ? "bold" : "normal",
            }}
          >
            {total + CURRENCY}
          </span>
        ),
      },
      {
        title: "3",
        dataIndex: "3",
        key: "3",
        width: 50,
        align: "center" as AlignType,
        render: (total: number) => (
          <span
            style={{
              color: total > 0 ? "#66bb6a" : "inherit",
              fontSize: total > 0 ? "16px" : "inherit",
              fontWeight: total > 0 ? "bold" : "normal",
            }}
          >
            {total + CURRENCY}
          </span>
        ),
      },
      {
        title: "4",
        dataIndex: "4",
        key: "4",
        width: 50,
        align: "center" as AlignType,
        render: (total: number) => (
          <span
            style={{
              color: total > 0 ? "#66bb6a" : "inherit",
              fontSize: total > 0 ? "16px" : "inherit",
              fontWeight: total > 0 ? "bold" : "normal",
            }}
          >
            {total + CURRENCY}
          </span>
        ),
      },
      {
        title: "5",
        dataIndex: "5",
        key: "5",
        width: 50,
        align: "center" as AlignType,
        render: (total: number) => (
          <span
            style={{
              color: total > 0 ? "#66bb6a" : "inherit",
              fontSize: total > 0 ? "16px" : "inherit",
              fontWeight: total > 0 ? "bold" : "normal",
            }}
          >
            {total + CURRENCY}
          </span>
        ),
      },
      {
        title: "6",
        dataIndex: "6",
        key: "6",
        width: 50,
        align: "center" as AlignType,
        render: (total: number) => (
          <span
            style={{
              color: total > 0 ? "#66bb6a" : "inherit",
              fontSize: total > 0 ? "16px" : "inherit",
              fontWeight: total > 0 ? "bold" : "normal",
            }}
          >
            {total + CURRENCY}
          </span>
        ),
      },
      {
        title: "7",
        dataIndex: "7",
        key: "7",
        width: 50,
        align: "center" as AlignType,
        render: (total: number) => (
          <span
            style={{
              color: total > 0 ? "#66bb6a" : "inherit",
              fontSize: total > 0 ? "16px" : "inherit",
              fontWeight: total > 0 ? "bold" : "normal",
            }}
          >
            {total + CURRENCY}
          </span>
        ),
      },
      {
        title: "8",
        dataIndex: "8",
        key: "8",
        width: 50,
        align: "center" as AlignType,
        render: (total: number) => (
          <span
            style={{
              color: total > 0 ? "#66bb6a" : "inherit",
              fontSize: total > 0 ? "16px" : "inherit",
              fontWeight: total > 0 ? "bold" : "normal",
            }}
          >
            {total + CURRENCY}
          </span>
        ),
      },
      {
        title: "9",
        dataIndex: "9",
        key: "9",
        width: 50,
        align: "center" as AlignType,
        render: (total: number) => (
          <span
            style={{
              color: total > 0 ? "#66bb6a" : "inherit",
              fontSize: total > 0 ? "16px" : "inherit",
              fontWeight: total > 0 ? "bold" : "normal",
            }}
          >
            {total + CURRENCY}
          </span>
        ),
      },
    ],
  },
];
