/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import {
  Button,
  DatePicker,
  message,
  Space,
  Table,
  TablePaginationConfig,
  Typography,
} from "antd";
import moment, { Moment } from "moment";
import get from "lodash/get";
import isEmpty from "lodash/isEmpty";
import {
  ARRAY_WINGO_TIME_CONFIGS,
  DEFAULT_PAGINATION,
} from "@src/constants/constants";
import {
  GameCompletedRound,
  GetListCompletedRoundParams,
  WingoGameStatisticCurrentRound,
} from "@src/interfaces/WingoGame";
import { Pagination } from "@src/interfaces";
import * as wingoGameServices from "@src/services/wingo-game";
import * as TableColumns from "@src/components/WingoGame/TableColumns";
import * as gameHelpers from "@src/util/gameHelpers";
import { getSecondsLeftFromISTWithoutTimeZone } from "@src/util/timeUtils";
import { BettingStatistics } from "@src/components/5DGame/BettingStatistics";
import CurrentGameStatistics from "@src/components/WingoGame/CurrentGameStatistics";
import { GAME_RESULT_SIDE_WINNER } from "@src/constants/enums";
import { ReloadOutlined, SearchOutlined } from "@ant-design/icons";

type TimeRangeValue = [Moment | null, Moment | null] | null;

const WingoGame: React.FC<any> = () => {
  const [selectedWingoTimeConfig] = useState(ARRAY_WINGO_TIME_CONFIGS[0]);
  const [secondsLeft, setSecondsLeft] = useState(30);
  const [loadingRecentGame, setLoadingRecentGame] = useState(false);
  const [listCompletedRound, setListCompletedRound] = useState<
    GameCompletedRound[]
  >([]);
  const [pagination, setPagination] = useState<Pagination>(DEFAULT_PAGINATION);

  const [loadingNextRound, setLoadingNextRound] = useState(false);
  const [listNextRound, setListNextRound] = useState<GameCompletedRound[]>([]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loadingStatisticCurrentRound, setLoadingStatisticCurrentRound] =
    useState(false);
  const [statisticCurrentRoundAllInfos, setStatisticCurrentRoundAllInfos] =
    useState<Partial<WingoGameStatisticCurrentRound>>({});

  const [isSetResultSuccess, setIsSetResultSuccess] = useState(false);

  const [paramFilters, setParamFilters] = useState<TimeRangeValue>(null);
  const [localFilters, setLocalFilters] = useState<TimeRangeValue>(null);

  const isEmptyParamFilters = () => {
    return !(
      paramFilters &&
      paramFilters.length === 2 &&
      paramFilters[0] &&
      paramFilters[1]
    );
  };

  const isEmptyLocalFilters = () => {
    return !(
      localFilters &&
      localFilters.length === 2 &&
      localFilters[0] &&
      localFilters[1]
    );
  };

  const isDisabledBtnSearch = () => {
    return loadingRecentGame || isEmptyLocalFilters();
  };

  const isDisabledBtnReset = () => {
    return loadingRecentGame || isEmptyLocalFilters() || isEmptyParamFilters();
  };

  const renderIsTimeNowInRangeTimeFilter = () => {
    if (isEmptyParamFilters()) {
      return true;
    } else {
      const paramStartTime = paramFilters?.[0];
      const paramEndTime = paramFilters?.[1];
      return paramStartTime?.isBefore() && paramEndTime?.isAfter();
    }
  };

  const isTimeNowInRangeTimeFilter = renderIsTimeNowInRangeTimeFilter();

  const handleDateRangeChange = (dates: any) => {
    if (dates && dates.length === 2) {
      setLocalFilters([dates[0].startOf("minute"), dates[1].endOf("minute")]);
    } else {
      setLocalFilters(null);
    }
  };

  const handleReset = () => {
    setLocalFilters(null);
    setParamFilters(null);
    setPagination(DEFAULT_PAGINATION);
    const resetParams = { skip: 0, limit: pagination.limit };
    getListCompletedRounds(resetParams);
  };

  const renderGetCompletedRoundParams = () => {
    const params = {
      skip: pagination.skip,
      limit: pagination.limit,
    };
    if (!isEmptyParamFilters()) {
      Object.assign(params, {
        startTime: paramFilters?.[0]?.valueOf(),
        endTime: paramFilters?.[1]?.valueOf(),
      });
    }
    return params;
  };

  const onFilterChangeTime = () => {
    const filterParams = { skip: 0, limit: pagination.limit };
    if (!isEmptyParamFilters()) {
      Object.assign(filterParams, {
        startTime: paramFilters?.[0]?.valueOf(),
        endTime: paramFilters?.[1]?.valueOf(),
      });
    }
    getListCompletedRounds(filterParams);
  };

  const params = renderGetCompletedRoundParams();

  const statisticCustomersOrder = get(
    statisticCurrentRoundAllInfos,
    "statisticCustomersOrder",
    []
  );

  const currentGameInfos = get(
    statisticCurrentRoundAllInfos,
    "currentRound",
    {}
  );

  const tablePagination: TablePaginationConfig = {
    pageSize: pagination.limit,
    total: pagination.total,
    showTotal: (total: number) => (
      <div>
        Tổng số bản ghi: <b>{total}</b>
      </div>
    ),
    showSizeChanger: false,
    showQuickJumper: false,
    current: pagination.page,
    onChange: (page: number) => {
      const newPagination = Object.assign({}, pagination, {
        skip: (page - 1) * pagination.limit,
      });
      setPagination(newPagination);
      const newParams = {
        skip: (page - 1) * pagination.limit,
        limit: pagination.limit,
      };
      if (!isEmptyParamFilters()) {
        Object.assign(newParams, {
          startTime: paramFilters?.[0]?.valueOf(),
          endTime: paramFilters?.[1]?.valueOf(),
        });
      }
      getListCompletedRounds(newParams);
    },
  };

  const getListCompletedRounds = async (
    params: GetListCompletedRoundParams
  ) => {
    setLoadingRecentGame(true);
    try {
      const response: any = await wingoGameServices.getListCompletedRoundsWingo(
        params
      );
      if (response?.code === 0) {
        setListCompletedRound(response?.data);
        const newPagination = Object.assign({}, pagination, {
          total: response?.total,
          page: params.skip / params.limit + 1,
          totalPage: Math.floor(
            (response?.total + params.limit - 1) / params.limit
          ),
        });
        setPagination(newPagination);
      } else {
        setListCompletedRound([]);
        setPagination(DEFAULT_PAGINATION);
      }
    } catch (error: any) {
      message.error(error?.message);
      setListCompletedRound([]);
      setPagination(DEFAULT_PAGINATION);
    } finally {
      setLoadingRecentGame(false);
    }
  };

  const getListNextRounds = async () => {
    setLoadingNextRound(true);
    try {
      const response: any = await wingoGameServices.getListNextRoundsWingo();
      if (response?.code === 0) {
        setListNextRound(response?.data);
      } else {
        setListNextRound([]);
      }
    } catch (error: any) {
      message.error(error?.message);
      setListNextRound([]);
    } finally {
      setLoadingNextRound(false);
    }
  };

  // Handler for when a result is changed in the "Next Round" table
  const handleNextRoundResultChange = (
    issueNumber: string,
    newResult: GAME_RESULT_SIDE_WINNER | null
  ) => {
    setListNextRound((prevData) =>
      prevData.map((round) =>
        issueNumber && round.issueNumber === issueNumber
          ? { ...round, sideWinner: newResult }
          : round
      )
    );
  };

  const getStatisticCurrentRound = async () => {
    setLoadingStatisticCurrentRound(true);
    try {
      const response: any =
        await wingoGameServices.getStatisticCurrentRoundWingo();
      if (response?.code === 0) {
        setStatisticCurrentRoundAllInfos(response?.data);
      } else {
        setStatisticCurrentRoundAllInfos({});
      }
    } catch (error: any) {
      message.error(error?.message);
    } finally {
      setLoadingStatisticCurrentRound(false);
    }
  };

  const initData = () => {
    getStatisticCurrentRound();
    if (isTimeNowInRangeTimeFilter) {
      setPagination(DEFAULT_PAGINATION);
      getListCompletedRounds(params);
    }
    getListNextRounds();
  };

  useEffect(() => {
    if (!isEmpty(selectedWingoTimeConfig)) {
      initData();
    }
  }, []);

  useEffect(() => {
    if (isSetResultSuccess) {
      getListNextRounds();
      getStatisticCurrentRound();
      setTimeout(() => {
        setIsSetResultSuccess(false);
      }, 1000);
    }
  }, [isSetResultSuccess]);

  useEffect(() => {
    if (statisticCurrentRoundAllInfos) {
      const endTime = get(statisticCurrentRoundAllInfos, "endTime", "");
      const timeEnd = getSecondsLeftFromISTWithoutTimeZone(endTime);
      setSecondsLeft(timeEnd);
    }
  }, [statisticCurrentRoundAllInfos]);

  useEffect(() => {
    if (secondsLeft < 0) {
      // Call api to get data
      initData();
      return;
    }

    // Calculate timeLeft initially
    let timeLeft = secondsLeft;

    const timer = setInterval(() => {
      timeLeft = timeLeft - 1;
      // Update the seconds left display
      setSecondsLeft(timeLeft);

      // Call api every 3 seconds
      if (timeLeft % 3 === 0 && timeLeft > 0) {
        getStatisticCurrentRound();
      }

      if (timeLeft <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => {
      clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft]);

  useEffect(() => {
    if (!isEmptyParamFilters()) {
      setPagination(DEFAULT_PAGINATION);
      onFilterChangeTime();
    }
  }, [paramFilters]);

  return (
    <div className="main-game-container">
      <Typography.Title level={4} className="main-game-title">
        Thông tin game
      </Typography.Title>
      <section className="main-game-current-game">
        <div className="main-game-current-game-header">
          <Typography.Title level={4} className="">
            GAME HIỆN TẠI
          </Typography.Title>
        </div>
        <Button.Group className="main-game-current-countdown">
          {gameHelpers
            .renderArrayTextCountdown(secondsLeft)
            ?.map((item: string, index: number) => (
              <Button key={index} type="primary">
                {item}
              </Button>
            ))}
        </Button.Group>
        <CurrentGameStatistics currentGameInfos={currentGameInfos} />
        {statisticCustomersOrder?.length > 0 ? (
          <BettingStatistics
            statisticCustomersOrder={statisticCustomersOrder}
          />
        ) : null}
      </section>
      <Table
        rowKey={"id"}
        scroll={{ x: true, y: 500 }}
        bordered={true}
        columns={TableColumns.columnsNextRound(
          loadingNextRound,
          secondsLeft,
          setIsSetResultSuccess,
          handleNextRoundResultChange // Pass the new handler here
        )}
        dataSource={listNextRound}
        pagination={false}
        loading={loadingNextRound}
        title={() => (
          <Typography.Title level={4}>Đặt trước kết quả</Typography.Title>
        )}
        className="main-game-table next-round-table"
        rowClassName={(record, index) =>
          index === 0 ? "current-running-round" : ""
        }
      />

      <div style={{ display: "block", textAlign: "right" }}>
        <Space align="center" size="large">
          <span>Bộ lọc</span>
          <DatePicker.RangePicker
            showTime={{ format: "HH:mm" }}
            placeholder={["Từ ngày", "Đến ngày"]}
            value={localFilters}
            onChange={handleDateRangeChange}
            format="DD/MM/YYYY HH:mm"
            style={{ width: 400 }}
            clearIcon={false}
          />
          <Button
            type="primary"
            icon={<SearchOutlined />}
            style={{ marginRight: 0 }}
            onClick={() => setParamFilters(localFilters)}
            disabled={isDisabledBtnSearch()}
          >
            Tìm kiếm
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => handleReset()}
            disabled={isDisabledBtnReset()}
          >
            Đặt lại
          </Button>
        </Space>
      </div>
      <br />
      <Table
        rowKey={"id"}
        scroll={{ x: true, y: 500 }}
        bordered={true}
        columns={TableColumns.columnsCompletedRound}
        dataSource={listCompletedRound || []}
        title={() => (
          <Typography.Title level={4}>GAME GẦN ĐÂY</Typography.Title>
        )}
        className="main-game-table completed-round-table"
        loading={loadingRecentGame}
        pagination={tablePagination}
      />
    </div>
  );
};

export default WingoGame;
