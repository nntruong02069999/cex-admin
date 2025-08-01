import React, { useEffect, useState } from "react";
import { Row, Col, Select, Alert, Table, Spin, Pagination } from "antd";
import SectionCard from "./common/SectionCard";
import { useParams } from "react-router-dom";
import {
  getGameProviders,
  getGameThirdPartyHistory,
} from "../../services/game-history";
import { TablePaginationConfig } from "antd/es/table/interface";
import { ColumnsType } from "antd/es/table";
import moment from "moment";

const { Option } = Select;

interface RouteParams {
  customerId?: string;
}

interface GameProvider {
  id: number;
  name: string;
  providerCode: string;
  isActive: boolean;
  image?: string;
  aliasName?: string;
  iconHistory?: string;
}

interface GameThirdPartyHistory {
  id: number;
  createdAt?: number;
  gameTypeCode: string;
  providerCode: string;
  orderId: number;
  customerId: number;
  timePlay: number;
  gameId?: string;
  gameName?: string;
  betAmount: number;
  commission: number;
  winAmount: number;
  jackpotBetAmount: number;
  betDetail: string;
}

const ThirdPartyGames: React.FC = () => {
  const { customerId } = useParams<RouteParams>();
  const [loading, setLoading] = useState(false);
  const [loadingProviders, setLoadingProviders] = useState(false);
  const [providers, setProviders] = useState<GameProvider[]>([]);
  const [gameHistory, setGameHistory] = useState<GameThirdPartyHistory[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string | undefined>(
    undefined
  );
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [totalBet, setTotalBet] = useState(0);
  const [totalWin, setTotalWin] = useState(0);

  useEffect(() => {
    fetchGameProviders();
  }, []);

  useEffect(() => {
    if (customerId) {
      fetchGameHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId, selectedProvider, pagination.current, pagination.pageSize]);

  const fetchGameProviders = async () => {
    setLoadingProviders(true);
    try {
      const result = await getGameProviders();
      if (result && result.data) {
        setProviders(result.data);
      }
    } catch (error) {
      console.error("Error fetching game providers:", error);
    } finally {
      setLoadingProviders(false);
    }
  };

  const fetchGameHistory = async () => {
    if (!customerId) return;

    setLoading(true);
    try {
      const result = await getGameThirdPartyHistory({
        customerId: parseInt(customerId),
        page: pagination.current as number,
        limit: pagination.pageSize as number,
        providerCode: selectedProvider,
      });
      console.log("result", result);
      if (result && result.data) {
        setGameHistory(result.data);
        setPagination({
          ...pagination,
          total: result.total || 0,
        });

        // Calculate totals
        let totalBetAmount = 0;
        let totalWinAmount = 0;
        result.data.forEach((item: GameThirdPartyHistory) => {
          totalBetAmount += item.betAmount;
          totalWinAmount += item.winAmount;
        });
        setTotalBet(totalBetAmount);
        setTotalWin(totalWinAmount);
      }
    } catch (error) {
      console.error("Error fetching game history:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProviderChange = (value: string | undefined) => {
    setSelectedProvider(value);
    setPagination({
      ...pagination,
      current: 1,
    });
  };

  const handlePageChange = (page: number, pageSize?: number) => {
    setPagination({
      ...pagination,
      current: page,
      pageSize: pageSize || pagination.pageSize,
    });
  };

  const columns: ColumnsType<GameThirdPartyHistory> = [
    {
      title: "STT",
      key: "index",
      width: 70,
      render: (_, __, index) =>
        (pagination.current! - 1) * pagination.pageSize! + index + 1,
    },
    {
      title: "Thời gian",
      dataIndex: "timePlay",
      key: "timePlay",
      render: (timePlay) =>
        timePlay ? moment(timePlay * 1000).format("DD/MM/YYYY HH:mm:ss") : "-",
    },
    {
      title: "ID đơn",
      dataIndex: "orderId",
      key: "orderId",
    },
    {
      title: "Nhà cung cấp",
      dataIndex: "providerCode",
      key: "providerCode",
      render: (providerCode) => {
        const provider = providers.find((p) => p.providerCode === providerCode);
        return provider ? provider.name : providerCode;
      },
    },
    {
      title: "Loại game",
      dataIndex: "gameTypeCode",
      key: "gameTypeCode",
    },
    {
      title: "Tên game",
      dataIndex: "gameName",
      key: "gameName",
      render: (gameName) => gameName || "-",
    },
    {
      title: "Số tiền cược",
      dataIndex: "betAmount",
      key: "betAmount",
      render: (amount) => `₹${amount.toLocaleString("en-IN")}`,
    },
    {
      title: "Phí hoa hồng",
      dataIndex: "commission",
      key: "commission",
      render: (amount) => `₹${amount.toLocaleString("en-IN")}`,
    },
    {
      title: "Tiền thắng",
      dataIndex: "winAmount",
      key: "winAmount",
      render: (amount) => `₹${amount.toLocaleString("en-IN")}`,
    },
    {
      title: "Kết quả",
      key: "result",
      render: (_, record) => {
        const profit = record.winAmount - record.betAmount;
        return (
          <span style={{ color: profit >= 0 ? "green" : "red" }}>
            {profit >= 0 ? "+" : ""}
            {profit.toLocaleString("en-IN")} ₹
          </span>
        );
      },
    },
  ];

  return (
    <SectionCard title="Lịch sử cược game bên thứ 3">
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={24}>
          <div>Bên cung cấp</div>
          <Select
            placeholder="Tất cả"
            style={{ width: "100%" }}
            onChange={handleProviderChange}
            value={selectedProvider}
            allowClear
            loading={loadingProviders}
          >
            {providers.map((provider) => (
              <Option key={provider.providerCode} value={provider.providerCode}>
                {provider.name}
              </Option>
            ))}
          </Select>
        </Col>
      </Row>

      {gameHistory.length > 0 && (
        <Row style={{ marginBottom: 16 }}>
          <Col span={12}>
            <div style={{ color: "blue" }}>
              Tổng cược: ₹{totalBet.toLocaleString("en-IN")}
            </div>
          </Col>
          <Col span={12}>
            <div style={{ color: totalWin >= totalBet ? "green" : "red" }}>
              Tổng thắng: ₹{totalWin.toLocaleString("en-IN")}
            </div>
          </Col>
        </Row>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <Spin size="large" />
        </div>
      ) : gameHistory.length > 0 ? (
        <>
          <Table
            rowKey="id"
            columns={columns}
            dataSource={gameHistory}
            pagination={false}
            scroll={{ x: 1200 }}
          />
          <div style={{ marginTop: 16, textAlign: "right" }}>
            <Pagination
              current={pagination.current}
              pageSize={pagination.pageSize}
              total={pagination.total}
              onChange={handlePageChange}
              showSizeChanger
              showQuickJumper
              showTotal={(total) => `Tổng ${total} lượt chơi`}
            />
          </div>
        </>
      ) : (
        <Alert
          message="Tạm thời chưa có bản ghi nào"
          type="warning"
          showIcon
          style={{ marginTop: 16 }}
        />
      )}
    </SectionCard>
  );
};

export default ThirdPartyGames;
