import { Card, Tag } from "antd";
import { CURRENCY, renderBgColor } from "@src/constants/constants";
import { StatisticCustomersOrder } from "@src/interfaces/GlobalGame";

interface BettingStatisticsProps {
  statisticCustomersOrder: StatisticCustomersOrder[];
}

export const BettingStatistics: React.FC<BettingStatisticsProps> = (
  props: BettingStatisticsProps
) => {
  const { statisticCustomersOrder } = props;

  // Format numbers with Indian locale
  const formatCurrency = (value: number | null) => {
    if (value === null || value === undefined) return "0";
    return value.toLocaleString("en-US");
  };

  return statisticCustomersOrder?.length > 0 ? (
    <Card
      title={`Thống kê đặt: ${statisticCustomersOrder?.length} người đặt`}
      bordered={false}
      className="is-betting-statistics"
    >
      {statisticCustomersOrder?.map((item: StatisticCustomersOrder) => {
        // const total = Number(
        //   (item?.totalWinAmount - item?.totalBetAmount).toFixed(2)
        // );
        // const isWingoGame = item?.isWingoGame === true;
        const isWingoGame = false
        let backgroundColor = "";
        if (isWingoGame) {
          // Try to convert item?.selectValue to number if true, if not return 0
          const number = Number(item?.amount);
          if (isNaN(number)) {
            backgroundColor = item?.color || "#fb5b5b";
          } else {
            backgroundColor = renderBgColor(number);
          }
        } else {
          backgroundColor = item?.color || "#fb5b5b";
        }

        // Check if backgroundColor is a linear gradient or solid color
        const isGradient =
          backgroundColor.includes("linear-gradient") ||
          backgroundColor.includes("gradient");

        return (
          <Card.Grid
            key={item?.customerId}
            style={{
              border: "none",
              ...(isGradient
                ? { background: backgroundColor }
                : { backgroundColor: backgroundColor }),
            }}
            hoverable={false}
          >
            <div className="betting-item-container">
              <span className="betting-main-info">
                ID: {item?.customerId} chọn {item?.side}{" với giá: "}
                {CURRENCY + formatCurrency(item?.amount)}
              </span>
              {/* <Tag className="balance-tag">
                Số dư: {formatCurrency(item?.balance)} {CURRENCY}
              </Tag> */}
              {/* <Tag
                className={`total-tag ${total >= 0 ? "positive" : "negative"}`}
              >
                Tổng: {formatCurrency(total)} {CURRENCY}
              </Tag> */}
            </div>
          </Card.Grid>
        );
      })}
    </Card>
  ) : null;
};
