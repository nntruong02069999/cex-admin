import { GAME_RESULT_SIDE_WINNER } from "@src/constants/enums"

export interface StatisticCustomersOrder {
    customerId: number
    amount: number
    totalTradeAmount: number
    totalTradeAmountWin: number
    side: GAME_RESULT_SIDE_WINNER
    color?: string
}
