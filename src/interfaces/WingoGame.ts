import { WINGO_TIME_CONFIG } from "@src/constants/enums"
import { StatisticCustomersOrder } from "./GlobalGame"

export interface GetListCompletedRoundParams {
    skip: number
    limit: number
    timeConfig: WINGO_TIME_CONFIG
}

export interface SetWingoGameResultParams {
    issueNumber: string
    result: number
}

export interface WingoGameCompletedRound {
    id: number
    createdAt: number
    updatedAt: number
    issueNumber: string
    startTime: string
    endTime: string
    resultNumber: number | null
    resultColor: string | null
    resultSize: string | null
    totalBetAmount: number
    totalWinAmount: number
    totalGreenBets: number
    totalPurpleBets: number
    totalRedBets: number
    totalBigBets: number
    totalSmallBets: number
    totalBetNumber0: number
    totalBetNumber1: number
    totalBetNumber2: number
    totalBetNumber3: number
    totalBetNumber4: number
    totalBetNumber5: number
    totalBetNumber6: number
    totalBetNumber7: number
    totalBetNumber8: number
    totalBetNumber9: number
    isAdminConfigManually: boolean
    playerCount: number
    wingoTimeConfig: WINGO_TIME_CONFIG
    state: string;
    syntheticSuccess: boolean
}

export interface WingoGameStatisticCurrentRound {
    currentRound: WingoGameCompletedRound
    statisticCustomersOrder: StatisticCustomersOrder[]
    startTime: string
    endTime: string
}