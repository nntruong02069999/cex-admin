import React, { useEffect, useState } from "react";
import { Button, message, Table, TablePaginationConfig, Typography } from "antd";
import get from "lodash/get";
import isEmpty from "lodash/isEmpty";
import {
  ARRAY_WINGO_TIME_CONFIGS,
  DEFAULT_PAGINATION,
} from "@src/constants/constants";
import {
  WingoGameCompletedRound,
  GetListCompletedRoundParams,
  WingoGameStatisticCurrentRound,
} from "@src/interfaces/WingoGame";
import { Pagination } from "@src/interfaces";
import * as wingoGameServices from "@src/services/wingo-game";
import * as TableColumns from "@src/components/WingoGame/TableColumns";
import * as gameHelpers from "@src/util/gameHelpers";
import { getSecondsLeftFromIST } from "@src/util/timeUtils";
import { BettingStatistics } from "@src/components/5DGame/BettingStatistics";
import CurrentGameStatistics from "@src/components/WingoGame/CurrentGameStatistics";

const WingoGame: React.FC<any> = () => {
  const [selectedWingoTimeConfig, setSelectedWingoTimeConfig] = useState(
    ARRAY_WINGO_TIME_CONFIGS[0]
  );
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [loadingRecentGame, setLoadingRecentGame] = useState(false);
  const [listCompletedRound, setListCompletedRound] = useState<
    WingoGameCompletedRound[]
  >([]);
  const [pagination, setPagination] = useState<Pagination>(DEFAULT_PAGINATION);

  const [loadingNextRound, setLoadingNextRound] = useState(false);
  const [listNextRound, setListNextRound] = useState<WingoGameCompletedRound[]>(
    []
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loadingStatisticCurrentRound, setLoadingStatisticCurrentRound] =
    useState(false);
  const [statisticCurrentRoundAllInfos, setStatisticCurrentRoundAllInfos] =
    useState<Partial<WingoGameStatisticCurrentRound>>({});

  const [isSetResultSuccess, setIsSetResultSuccess] = useState(false);

  const renderGetCompletedRoundParams = () => {
    return {
      skip: pagination.skip,
      limit: pagination.limit,
      timeConfig: selectedWingoTimeConfig.value,
    };
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
    onChange: async (page: number) => {
      const newPagination = Object.assign(pagination, {
        skip: (page - 1) * pagination.limit,
      });
      setPagination(newPagination);
      const newParams = {
        skip: (page - 1) * pagination.limit,
        limit: pagination.limit,
        timeConfig: selectedWingoTimeConfig.value,
      };
      await getListCompletedRounds(newParams);
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
        const newPagination = Object.assign(pagination, {
          total: response?.total,
          page: params.skip / params.limit + 1,
          totalPage: Math.floor(
            (response?.total + params.limit - 1) / params.limit
          ),
        });
        setPagination(newPagination);
      } else {
        setListCompletedRound([]);
      }
    } catch (error: any) {
      message.error(error?.message);
    } finally {
      setLoadingRecentGame(false);
    }
  };

  const getListNextRounds = async () => {
    setLoadingNextRound(true);
    try {
      const response: any = await wingoGameServices.getListNextRoundsWingo(
        selectedWingoTimeConfig.value
      );
      if (response?.code === 0) {
        setListNextRound(response?.data);
      } else {
        setListNextRound([]);
      }
    } catch (error: any) {
      message.error(error?.message);
    } finally {
      setLoadingNextRound(false);
    }
  };

  // Handler for when a result is changed in the "Next Round" table
  const handleNextRoundResultChange = (
    issueNumber: string,
    newResult: number | null
  ) => {
    setListNextRound((prevData) =>
      prevData.map((round) =>
        round.issueNumber === issueNumber ? { ...round, resultNumber: newResult } : round
      )
    );
  };
  
  const getStatisticCurrentRound = async () => {
    setLoadingStatisticCurrentRound(true);
    try {
      const response: any = await wingoGameServices.getStatisticCurrentRoundWingo(
        selectedWingoTimeConfig.value
      );
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

  const onSelectWingoTimeConfig = (option: any) => {
    if (option.value === selectedWingoTimeConfig.value) {
      return;
    } else {
      setSecondsLeft(0);
      setSelectedWingoTimeConfig(option);
    }
  };

  const initData = () => {
    setPagination(DEFAULT_PAGINATION);
    getStatisticCurrentRound();
    getListCompletedRounds(params);
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
      const endTime = get(
        statisticCurrentRoundAllInfos,
        "currentRound.endTime",
        ""
      );
      const timeEnd = getSecondsLeftFromIST(endTime);
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
  }, [secondsLeft]);

  return (
    <div className="main-game-container">
      <Typography.Title level={4} className="main-game-title">
        Thông tin game
      </Typography.Title>

      <Button.Group className="main-game-time-config-groups">
        {ARRAY_WINGO_TIME_CONFIGS.map((option) => {
          const isActive = selectedWingoTimeConfig.value === option.value;
          return (
            <Button
              key={option.value}
              type={isActive ? "primary" : "default"}
              onClick={() => onSelectWingoTimeConfig(option)}
            >
              {option.label}
            </Button>
          );
        })}
      </Button.Group>
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
