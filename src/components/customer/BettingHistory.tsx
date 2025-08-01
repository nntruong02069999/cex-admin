import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Select,
  Alert,
  Spin,
  Table,
  Pagination,
  Tag,
  Input,
} from "antd";
import SectionCard from "./common/SectionCard";
import { useParams } from "react-router-dom";
import {
  getBettingHistory,
  getBettingStatistics,
  GetBettingHistoryParams,
} from "@src/services/customer-transaction";
import {
  BettingStatistics,
  GameType,
  GamePlayStyle,
  WingoOrder,
  WingoOrderState,
  WingoOrderType,
  WingoSize,
  WingoTimeConfig,
  TRXWingoOrder,
  K3Order,
  K3OrderType,
  K3TimeConfig,
  D5Order,
  D5OrderType,
  D5Position,
  D5TimeConfig,
} from "@src/interfaces/CustomerTransaction";
import moment from "moment";
import { TablePaginationConfig } from "antd/es/table/interface";
import { ColumnsType } from "antd/es/table";

const { Option } = Select;

interface RouteParams {
  customerId?: string;
}

const BettingHistory: React.FC = () => {
  const { customerId } = useParams<RouteParams>();
  const [loading, setLoading] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [gameType, setGameType] = useState<GameType>(GameType.WINGO);
  const [gamePlayStyle, setGamePlayStyle] = useState<GamePlayStyle | undefined>(
    undefined
  );
  const [orderState, setOrderState] = useState<string | undefined>(undefined);
  const [issueNumber, setIssueNumber] = useState<string | undefined>(undefined);
  const [wingoOrders, setWingoOrders] = useState<WingoOrder[]>([]);
  const [trxWingoOrders, setTrxWingoOrders] = useState<TRXWingoOrder[]>([]);
  const [k3Orders, setK3Orders] = useState<K3Order[]>([]);
  const [d5Orders, setD5Orders] = useState<D5Order[]>([]);
  const [statistics, setStatistics] = useState<BettingStatistics | null>(null);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Fetch data when filters change
  useEffect(() => {
    fetchBettingStatistics();
    fetchBettingHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId, gameType, gamePlayStyle]);

  const fetchBettingStatistics = async () => {
    setLoadingStats(true);
    try {
      const params = {
        customerId: customerId ? parseInt(customerId) : undefined,
        gameType,
        gamePlayStyle,
      };

      const result = await getBettingStatistics(params);
      if (result) {
        setStatistics(result.data);
      }
    } catch (error) {
      console.error("Error fetching betting statistics:", error);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchBettingHistory = async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      const params: GetBettingHistoryParams = {
        customerId: customerId ? parseInt(customerId) : undefined,
        gameType,
        gamePlayStyle,
        page,
        limit,
        state: orderState,
        issueNumber,
      };

      const result = await getBettingHistory(params);
      if (result && result.data) {
        // Reset all order state arrays
        setWingoOrders([]);
        setTrxWingoOrders([]);
        setK3Orders([]);
        setD5Orders([]);

        // Set the appropriate order array based on game type
        if (gameType === GameType.WINGO) {
          setWingoOrders(result.data);
        } else if (gameType === GameType.TRX_WINGO) {
          setTrxWingoOrders(result.data);
        } else if (gameType === GameType.K3) {
          setK3Orders(result.data);
        } else if (gameType === GameType.D5) {
          setD5Orders(result.data);
        }

        setPagination({
          ...pagination,
          current: page,
          pageSize: limit,
          total: result.total,
        });
      }
    } catch (error) {
      console.error("Error fetching betting history:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number, pageSize?: number) => {
    fetchBettingHistory(page, pageSize);
  };

  // Game type and style filter handlers
  const handleGameTypeChange = (value: GameType) => {
    setGameType(value);
    setGamePlayStyle(undefined); // Reset game style when type changes
    setOrderState(undefined);
    setIssueNumber(undefined);
  };

  const handleGameStyleChange = (value: GamePlayStyle | undefined) => {
    setGamePlayStyle(value);
  };

  const handleStateChange = (value: string | undefined) => {
    setOrderState(value);
  };

  const handleIssueNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIssueNumber(e.target.value);
  };

  const handleFilter = () => {
    setPagination({
      ...pagination,
      current: 1,
    });
    fetchBettingHistory(1, pagination.pageSize);
  };

  const handleReset = () => {
    setOrderState(undefined);
    setIssueNumber(undefined);
    setPagination({
      ...pagination,
      current: 1,
    });
    fetchBettingHistory(1, pagination.pageSize);
  };

  // Helper function to render K3 bet type
  const renderK3BetType = (type: K3OrderType, value: string) => {
    switch (type) {
      case K3OrderType.SUM:
        return `Tổng: ${value}`;
      case K3OrderType.TRIPLE_ANY:
        return "Ba số giống nhau - Toàn bộ";
      case K3OrderType.TRIPLE_SPECIFIC:
        return `Ba số giống nhau - ${value}`;
      case K3OrderType.DOUBLE_ANY:
        return "Hai số giống nhau - Phức hợp";
      case K3OrderType.DOUBLE_SPECIFIC:
        return `Hai số giống nhau - ${value}`;
      case K3OrderType.THREE_DISTINCT:
        return "Ba số khác nhau";
      case K3OrderType.TWO_DISTINCT:
        return "Hai số khác nhau";
      case K3OrderType.THREE_CONSECUTIVE:
        return "Ba số liên tiếp";
      case K3OrderType.ODD_EVEN:
        return value === "ODD" ? "Lẻ" : "Chẵn";
      case K3OrderType.BIG_SMALL:
        return value === "BIG" ? "Lớn (11-18)" : "Nhỏ (3-10)";
      default:
        return value;
    }
  };

  // Helper function to render D5 bet type
  const renderD5BetType = (
    type: D5OrderType,
    value: string,
    position: D5Position
  ) => {
    let positionText = "";
    switch (position) {
      case D5Position.A:
        positionText = "Vị trí 1";
        break;
      case D5Position.B:
        positionText = "Vị trí 2";
        break;
      case D5Position.C:
        positionText = "Vị trí 3";
        break;
      case D5Position.D:
        positionText = "Vị trí 4";
        break;
      case D5Position.E:
        positionText = "Vị trí 5";
        break;
      case D5Position.SUM:
        positionText = "Tổng";
        break;
      default:
        positionText = position;
    }

    let betType = "";
    switch (type) {
      case D5OrderType.DIGIT_SPECIFIC:
        betType = `Số ${value}`;
        break;
      case D5OrderType.DIGIT_HIGH_LOW:
        betType = value === "HIGH" ? "Lớn" : "Nhỏ";
        break;
      case D5OrderType.DIGIT_ODD_EVEN:
        betType = value === "ODD" ? "Lẻ" : "Chẵn";
        break;
      case D5OrderType.SUM_HIGH_LOW:
        betType = value === "HIGH" ? "Tổng lớn" : "Tổng nhỏ";
        break;
      case D5OrderType.SUM_ODD_EVEN:
        betType = value === "ODD" ? "Tổng lẻ" : "Tổng chẵn";
        break;
      default:
        betType = value;
    }

    return `${positionText}: ${betType}`;
  };

  // Render game order state
  const renderOrderState = (state: WingoOrderState) => {
    let color = "blue";
    let text = "Chờ";

    switch (state) {
      case WingoOrderState.WAITING:
        color = "blue";
        text = "Chờ";
        break;
      case WingoOrderState.WINNING:
        color = "green";
        text = "Thắng";
        break;
      case WingoOrderState.LOSING:
        color = "red";
        text = "Thua";
        break;
      default:
        break;
    }

    return <Tag color={color}>{text}</Tag>;
  };

  // Columns for Wingo history table
  const wingoColumns: ColumnsType<WingoOrder> = [
    {
      title: "STT",
      key: "index",
      width: 70,
      render: (_, __, index) =>
        (pagination.current! - 1) * pagination.pageSize! + index + 1,
    },
    {
      title: "Thời gian",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (timestamp) =>
        timestamp ? moment(timestamp).format("DD/MM/YYYY HH:mm:ss") : "-",
    },
    {
      title: "Mã đơn",
      dataIndex: "orderNumber",
      key: "orderNumber",
      width: 120,
    },
    {
      title: "Phiên",
      dataIndex: "issueNumber",
      key: "issueNumber",
      width: 120,
    },
    {
      title: "Kiểu chơi",
      key: "gamePlayStyle",
      dataIndex: "wingoTimeConfig",
      render: (style) => {
        switch (style) {
          case WingoTimeConfig.SECONDS_30:
            return "30 giây";
          case WingoTimeConfig.MINUTES_1:
            return "1 phút";
          case WingoTimeConfig.MINUTES_3:
            return "3 phút";
          case WingoTimeConfig.MINUTES_5:
            return "5 phút";
          case WingoTimeConfig.MINUTES_10:
            return "10 phút";
          default:
            return "-";
        }
      },
    },
    {
      title: "Loại cược",
      key: "betType",
      render: (_, record) => {
        let type = "";
        switch (record.selectType) {
          case WingoOrderType.NUMBER:
            type = `Số: ${record.selectValue}`;
            break;
          case WingoOrderType.COLOR:
            type = `Màu: ${
              record.selectValue === "GREEN"
                ? "Xanh"
                : record.selectValue === "RED"
                ? "Đỏ"
                : record.selectValue === "VIOLET"
                ? "Tím"
                : record.selectValue
            }`;
            break;
          case WingoOrderType.SIZE:
            type = `Kích thước: ${
              record.selectValue === WingoSize.SMALL ? "Nhỏ" : "Lớn"
            }`;
            break;
          default:
            type = record.selectValue;
        }
        return type;
      },
    },
    {
      title: "Kết quả",
      key: "result",
      render: (_, record) => {
        if (
          !record.number &&
          record.state !== WingoOrderState.WINNING &&
          record.state !== WingoOrderState.LOSING
        )
          return "-";

        let result = "";
        if (record.number !== null && record.number !== undefined) {
          result = `${record.number}`;
          if (record.colour) {
            const color = record.colour.toLowerCase();
            result += ` (${
              color === "green"
                ? "Xanh"
                : color === "red"
                ? "Đỏ"
                : color === "violet"
                ? "Tím"
                : record.colour
            })`;
          }
          if (record.smallOrLarge) {
            result += ` ${
              record.smallOrLarge === WingoSize.SMALL ? "Nhỏ" : "Lớn"
            }`;
          }
        }
        return result;
      },
    },
    {
      title: "Số tiền cược",
      dataIndex: "amount",
      key: "amount",
      render: (amount) => `₹${amount.toLocaleString("en-US")}`,
    },
    {
      title: "Phí",
      dataIndex: "fee",
      key: "fee",
      render: (fee) => `₹${fee.toLocaleString("en-US")}`,
    },
    {
      title: "Tiền thắng",
      dataIndex: "winAmount",
      key: "winAmount",
      render: (amount) => `₹${amount.toLocaleString("en-US")}`,
    },
    {
      title: "Trạng thái",
      dataIndex: "state",
      key: "state",
      render: renderOrderState,
    },
  ];

  // Columns for TRX Wingo history table - same as the normal Wingo columns
  const trxWingoColumns: ColumnsType<TRXWingoOrder> = [
    {
      title: "STT",
      key: "index",
      width: 70,
      render: (_, __, index) =>
        (pagination.current! - 1) * pagination.pageSize! + index + 1,
    },
    {
      title: "Thời gian",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (timestamp) =>
        timestamp ? moment(timestamp).format("DD/MM/YYYY HH:mm:ss") : "-",
    },
    {
      title: "Mã đơn",
      dataIndex: "orderNumber",
      key: "orderNumber",
      width: 120,
    },
    {
      title: "Phiên",
      dataIndex: "issueNumber",
      key: "issueNumber",
      width: 120,
    },
    {
      title: "Kiểu chơi",
      key: "gamePlayStyle",
      dataIndex: "wingoTimeConfig",
      render: (style) => {
        switch (style) {
          case WingoTimeConfig.SECONDS_30:
            return "30 giây";
          case WingoTimeConfig.MINUTES_1:
            return "1 phút";
          case WingoTimeConfig.MINUTES_3:
            return "3 phút";
          case WingoTimeConfig.MINUTES_5:
            return "5 phút";
          case WingoTimeConfig.MINUTES_10:
            return "10 phút";
          default:
            return "-";
        }
      },
    },
    {
      title: "Loại cược",
      key: "betType",
      render: (_, record) => {
        let type = "";
        switch (record.selectType) {
          case WingoOrderType.NUMBER:
            type = `Số: ${record.selectValue}`;
            break;
          case WingoOrderType.COLOR:
            type = `Màu: ${
              record.selectValue === "GREEN"
                ? "Xanh"
                : record.selectValue === "RED"
                ? "Đỏ"
                : record.selectValue === "VIOLET"
                ? "Tím"
                : record.selectValue
            }`;
            break;
          case WingoOrderType.SIZE:
            type = `Kích thước: ${
              record.selectValue === WingoSize.SMALL ? "Nhỏ" : "Lớn"
            }`;
            break;
          default:
            type = record.selectValue;
        }
        return type;
      },
    },
    {
      title: "Kết quả",
      key: "result",
      render: (_, record) => {
        if (
          !record.number &&
          record.state !== WingoOrderState.WINNING &&
          record.state !== WingoOrderState.LOSING
        )
          return "-";

        let result = "";
        if (record.number !== null && record.number !== undefined) {
          result = `${record.number}`;
          if (record.colour) {
            const color = record.colour.toLowerCase();
            result += ` (${
              color === "green"
                ? "Xanh"
                : color === "red"
                ? "Đỏ"
                : color === "violet"
                ? "Tím"
                : record.colour
            })`;
          }
          if (record.smallOrLarge) {
            result += ` ${
              record.smallOrLarge === WingoSize.SMALL ? "Nhỏ" : "Lớn"
            }`;
          }
        }
        return result;
      },
    },
    {
      title: "Số tiền cược",
      dataIndex: "amount",
      key: "amount",
      render: (amount) => `${amount.toLocaleString("vi-VN")} đ`,
    },
    {
      title: "Phí",
      dataIndex: "fee",
      key: "fee",
      render: (fee) => `${fee.toLocaleString("vi-VN")} đ`,
    },
    {
      title: "Tiền thắng",
      dataIndex: "winAmount",
      key: "winAmount",
      render: (amount) => `${amount.toLocaleString("vi-VN")} đ`,
    },
    {
      title: "Trạng thái",
      dataIndex: "state",
      key: "state",
      render: renderOrderState,
    },
  ];

  // Columns for K3 history table
  const k3Columns: ColumnsType<K3Order> = [
    {
      title: "STT",
      key: "index",
      width: 70,
      render: (_, __, index) =>
        (pagination.current! - 1) * pagination.pageSize! + index + 1,
    },
    {
      title: "Thời gian",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (timestamp) =>
        timestamp ? moment(timestamp).format("DD/MM/YYYY HH:mm:ss") : "-",
    },
    {
      title: "Mã đơn",
      dataIndex: "orderNumber",
      key: "orderNumber",
      width: 120,
    },
    {
      title: "Phiên",
      dataIndex: "issueNumber",
      key: "issueNumber",
      width: 120,
    },
    {
      title: "Kiểu chơi",
      key: "gamePlayStyle",
      dataIndex: "k3TimeConfig",
      render: (style) => {
        switch (style) {
          case K3TimeConfig.SECONDS_30:
            return "30 giây";
          case K3TimeConfig.MINUTES_1:
            return "1 phút";
          case K3TimeConfig.MINUTES_3:
            return "3 phút";
          case K3TimeConfig.MINUTES_5:
            return "5 phút";
          case K3TimeConfig.MINUTES_10:
            return "10 phút";
          default:
            return "-";
        }
      },
    },
    {
      title: "Loại cược",
      key: "betType",
      render: (_, record) =>
        renderK3BetType(record.selectType, record.selectValue),
    },
    {
      title: "Kết quả",
      key: "result",
      render: (_, record) => {
        if (
          !record.resultDice1 &&
          !record.resultDice2 &&
          !record.resultDice3 &&
          record.state !== WingoOrderState.WINNING &&
          record.state !== WingoOrderState.LOSING
        )
          return "-";

        let result = "";
        if (
          record.resultDice1 !== null &&
          record.resultDice1 !== undefined &&
          record.resultDice2 !== null &&
          record.resultDice2 !== undefined &&
          record.resultDice3 !== null &&
          record.resultDice3 !== undefined
        ) {
          result = `${record.resultDice1} - ${record.resultDice2} - ${record.resultDice3}`;
          if (record.resultSum) {
            result += ` (Tổng: ${record.resultSum})`;
          }
        }
        return result;
      },
    },
    {
      title: "Số tiền cược",
      dataIndex: "amount",
      key: "amount",
      render: (amount) => `₹${amount.toLocaleString("en-US")}`,
    },
    {
      title: "Phí",
      dataIndex: "fee",
      key: "fee",
      render: (amount) => `₹${amount.toLocaleString("en-US")}`,
    },
    {
      title: "Tiền thắng",
      dataIndex: "winAmount",
      key: "winAmount",
      render: (amount) => `₹${amount.toLocaleString("en-US")}`,
    },
    {
      title: "Trạng thái",
      dataIndex: "state",
      key: "state",
      render: renderOrderState,
    },
  ];

  // Columns for D5 history table
  const d5Columns: ColumnsType<D5Order> = [
    {
      title: "STT",
      key: "index",
      width: 70,
      render: (_, __, index) =>
        (pagination.current! - 1) * pagination.pageSize! + index + 1,
    },
    {
      title: "Thời gian",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (timestamp) =>
        timestamp ? moment(timestamp).format("DD/MM/YYYY HH:mm:ss") : "-",
    },
    {
      title: "Mã đơn",
      dataIndex: "orderNumber",
      key: "orderNumber",
      width: 120,
    },
    {
      title: "Phiên",
      dataIndex: "issueNumber",
      key: "issueNumber",
      width: 120,
    },
    {
      title: "Kiểu chơi",
      key: "gamePlayStyle",
      dataIndex: "d5TimeConfig",
      render: (style) => {
        switch (style) {
          case D5TimeConfig.SECONDS_30:
            return "30 giây";
          case D5TimeConfig.MINUTES_1:
            return "1 phút";
          case D5TimeConfig.MINUTES_3:
            return "3 phút";
          case D5TimeConfig.MINUTES_5:
            return "5 phút";
          case D5TimeConfig.MINUTES_10:
            return "10 phút";
          default:
            return "-";
        }
      },
    },
    {
      title: "Loại cược",
      key: "betType",
      render: (_, record) =>
        renderD5BetType(record.selectType, record.selectValue, record.position),
    },
    {
      title: "Kết quả",
      key: "result",
      render: (_, record) => {
        if (
          !record.resultDigitA &&
          !record.resultDigitB &&
          !record.resultDigitC &&
          !record.resultDigitD &&
          !record.resultDigitE &&
          record.state !== WingoOrderState.WINNING &&
          record.state !== WingoOrderState.LOSING
        )
          return "-";

        let result = "";
        if (
          record.resultDigitA !== null &&
          record.resultDigitA !== undefined &&
          record.resultDigitB !== null &&
          record.resultDigitB !== undefined &&
          record.resultDigitC !== null &&
          record.resultDigitC !== undefined &&
          record.resultDigitD !== null &&
          record.resultDigitD !== undefined &&
          record.resultDigitE !== null &&
          record.resultDigitE !== undefined
        ) {
          result = `${record.resultDigitA}${record.resultDigitB}${record.resultDigitC}${record.resultDigitD}${record.resultDigitE}`;
          if (record.resultSum) {
            result += ` (Tổng: ${record.resultSum})`;
          }
        }
        return result;
      },
    },
    {
      title: "Số tiền cược",
      dataIndex: "amount",
      key: "amount",
      render: (amount) => `₹${amount.toLocaleString("en-US")}`,
    },
    {
      title: "Phí",
      dataIndex: "fee",
      key: "fee",
      render: (fee) => `₹${fee.toLocaleString("en-US")}`,
    },
    {
      title: "Tiền thắng",
      dataIndex: "winAmount",
      key: "winAmount",
      render: (amount) => `₹${amount.toLocaleString("en-US")}`,
    },
    {
      title: "Trạng thái",
      dataIndex: "state",
      key: "state",
      render: renderOrderState,
    },
  ];

  return (
    <SectionCard title="Lịch sử cược">
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <div>Game</div>
          <Select
            value={gameType}
            onChange={handleGameTypeChange}
            style={{ width: "100%" }}
          >
            <Option value={GameType.WINGO}>WINGO</Option>
            <Option value={GameType.TRX_WINGO}>TRX WINGO</Option>
            <Option value={GameType.K3}>K3</Option>
            <Option value={GameType.D5}>5D</Option>
          </Select>
        </Col>
        <Col span={6}>
          <div>Kiểu chơi</div>
          <Select
            value={gamePlayStyle}
            onChange={handleGameStyleChange}
            style={{ width: "100%" }}
            allowClear
            placeholder="Tất cả"
          >
            <Option value={GamePlayStyle.SECONDS_30}>30 giây</Option>
            <Option value={GamePlayStyle.MINUTES_1}>1 phút</Option>
            <Option value={GamePlayStyle.MINUTES_3}>3 phút</Option>
            <Option value={GamePlayStyle.MINUTES_5}>5 phút</Option>
            <Option value={GamePlayStyle.MINUTES_10}>10 phút</Option>
          </Select>
        </Col>
        <Col span={6}>
          <div>Trạng thái</div>
          <Select
            value={orderState}
            onChange={handleStateChange}
            style={{ width: "100%" }}
            allowClear
            placeholder="Tất cả"
          >
            <Option value={WingoOrderState.WAITING}>Chờ</Option>
            <Option value={WingoOrderState.WINNING}>Thắng</Option>
            <Option value={WingoOrderState.LOSING}>Thua</Option>
          </Select>
        </Col>
        <Col span={6}>
          <div>Số phiên</div>
          <Input
            placeholder="Nhập số phiên"
            value={issueNumber}
            onChange={handleIssueNumberChange}
            style={{ width: "100%" }}
          />
        </Col>
      </Row>

      <Row style={{ marginBottom: 16 }}>
        <Col span={24} style={{ textAlign: "right" }}>
          <button
            className="ant-btn ant-btn-primary"
            onClick={handleFilter}
            style={{ marginRight: 8 }}
          >
            Lọc
          </button>
          <button className="ant-btn" onClick={handleReset}>
            Đặt lại
          </button>
        </Col>
      </Row>

      {loadingStats ? (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <Spin size="small" />
        </div>
      ) : statistics ? (
        <Row style={{ marginBottom: 16 }}>
          <Col span={8}>
            <div style={{ color: "#673ab7" }}>
              Liên thắng gần nhất: {statistics.currentWinStreak}
            </div>
            <div style={{ color: "#673ab7" }}>
              Vận thắng lớn nhất: ₹
              {statistics.maxWinAmount.toLocaleString("en-US")}
            </div>
          </Col>
          <Col span={8}>
            <div style={{ color: "#ff9800" }}>
              Liên thắng cao nhất: {statistics.maxWinStreak}
            </div>
            <div style={{ color: "#ff9800" }}>
              Tổng cược: ₹{statistics.totalBetAmount.toLocaleString("en-US")}
            </div>
          </Col>
          <Col span={8}>
            <div style={{ color: "#2196f3" }}>
              Vận cược lớn nhất: ₹
              {statistics.maxBetAmount?.toLocaleString("en-US") || "0"}
            </div>
            <div style={{ color: "#e91e63" }}>
              Tổng thắng: ₹{statistics.totalWinAmount.toLocaleString("en-US")}
            </div>
          </Col>
        </Row>
      ) : null}

      {loading ? (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <Spin size="large" />
        </div>
      ) : pagination.total && pagination.total > 0 ? (
        <>
          {/* Total display */}
          <div style={{ marginBottom: 16, textAlign: "right" }}>
            <span style={{ fontSize: 16, fontWeight: "bold" }}>
              Tổng số: {pagination.total} lượt cược
            </span>
          </div>

          {gameType === GameType.WINGO && (
            <Table
              dataSource={wingoOrders}
              columns={wingoColumns}
              rowKey="id"
              pagination={false}
              scroll={{ x: 1500 }}
            />
          )}

          {gameType === GameType.TRX_WINGO && (
            <Table
              dataSource={trxWingoOrders}
              columns={trxWingoColumns}
              rowKey="id"
              pagination={false}
              scroll={{ x: 1500 }}
            />
          )}

          {gameType === GameType.K3 && (
            <Table
              dataSource={k3Orders}
              columns={k3Columns}
              rowKey="id"
              pagination={false}
              scroll={{ x: 1500 }}
            />
          )}

          {gameType === GameType.D5 && (
            <Table
              dataSource={d5Orders}
              columns={d5Columns}
              rowKey="id"
              pagination={false}
              scroll={{ x: 1500 }}
            />
          )}

          <div style={{ marginTop: 16, textAlign: "right" }}>
            <Pagination
              current={pagination.current}
              pageSize={pagination.pageSize}
              total={pagination.total}
              onChange={handlePageChange}
              showSizeChanger
              showQuickJumper
              showTotal={(total) => `Tổng ${total} lượt cược`}
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

export default BettingHistory;
