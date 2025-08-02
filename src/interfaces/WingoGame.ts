import { GAME_RESULT_GENERATION_TYPE, GAME_RESULT_SIDE_WINNER, GAME_STATE, WINGO_TIME_CONFIG } from "@src/constants/enums"
import { StatisticCustomersOrder } from "./GlobalGame"

export interface GetListCompletedRoundParams {
    skip: number
    limit: number
}

export interface SetGameResultParams {
    issueNumber: string
    result: GAME_RESULT_SIDE_WINNER
}

export interface GameCompletedRound {
    createdAt: number
    updatedAt: number
    id: number
    symbol: "BTC/USDT"
    timeframe: string
    issueNumber: string
    open: number
    high: number
    low: number
    close: number
    volume: number
    timestamp: number
    order: number
    closeCandlestick: boolean
    state: GAME_STATE
    totalBuy: number
    totalSell: number
    houseProfit: number
    isAdminConfigManually: boolean
    sideWinner: GAME_RESULT_SIDE_WINNER | null
    playerCount: number
    resultGenerationType: GAME_RESULT_GENERATION_TYPE
    syntheticSuccess: false

    // Additional fields for the Wingo game
    tempWinner?: GAME_RESULT_SIDE_WINNER | null
}

export interface WingoGameStatisticCurrentRound {
    currentRound: GameCompletedRound
    statisticCustomersOrder: StatisticCustomersOrder[]
    startTime: string
    endTime: string
}