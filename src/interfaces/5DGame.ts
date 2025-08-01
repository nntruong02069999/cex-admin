import { WINGO_TIME_CONFIG } from "@src/constants/enums"
import { StatisticCustomersOrder } from "./GlobalGame"

export interface GetListCompletedRoundParams {
    skip: number
    limit: number
    timeConfig: WINGO_TIME_CONFIG
}

export interface Set5DGameResultParams {
    issueNumber: string
    A: number | null
    B: number | null
    C: number | null
    D: number | null
    E: number | null
}

export interface FiveDGameCompletedRound {
    id: number
    createdAt: number
    updatedAt: number
    issueNumber: string
    startTime: string
    endTime: string
    resultDigitA: number | null
    resultDigitB: number | null
    resultDigitC: number | null
    resultDigitD: number | null
    resultDigitE: number | null
    resultSum: number
    totalBetAmount: number
    totalWinAmount: number
    syntheticSuccess: boolean
    totalBetA0: number
    totalBetA1: number
    totalBetA2: number
    totalBetA3: number
    totalBetA4: number
    totalBetA5: number
    totalBetA6: number
    totalBetA7: number
    totalBetA8: number
    totalBetA9: number
    totalBetB0: number
    totalBetB1: number
    totalBetB2: number
    totalBetB3: number
    totalBetB4: number
    totalBetB5: number
    totalBetB6: number
    totalBetB7: number
    totalBetB8: number
    totalBetB9: number
    totalBetC0: number
    totalBetC1: number
    totalBetC2: number
    totalBetC3: number
    totalBetC4: number
    totalBetC5: number
    totalBetC6: number
    totalBetC7: number
    totalBetC8: number
    totalBetC9: number
    totalBetD0: number
    totalBetD1: number
    totalBetD2: number
    totalBetD3: number
    totalBetD4: number
    totalBetD5: number
    totalBetD6: number
    totalBetD7: number
    totalBetD8: number
    totalBetD9: number
    totalBetE0: number
    totalBetE1: number
    totalBetE2: number
    totalBetE3: number
    totalBetE4: number
    totalBetE5: number
    totalBetE6: number
    totalBetE7: number
    totalBetE8: number
    totalBetE9: number
    totalBetAHigh: number
    totalBetALow: number
    totalBetBHigh: number
    totalBetBLow: number
    totalBetCHigh: number
    totalBetCLow: number
    totalBetDHigh: number
    totalBetDLow: number
    totalBetEHigh: number
    totalBetELow: number
    totalBetAOdd: number
    totalBetAEven: number
    totalBetBOdd: number
    totalBetBEven: number
    totalBetCOdd: number
    totalBetCEven: number
    totalBetDOdd: number
    totalBetDEven: number
    totalBetEOdd: number
    totalBetEEven: number
    totalBetSumHigh: number
    totalBetSumLow: number
    totalBetSumOdd: number
    totalBetSumEven: number
    isAdminConfigManually: boolean
    playerCount: number
    d5TimeConfig: WINGO_TIME_CONFIG
    state: string
}


export interface FiveDGameStatisticCurrentRound {
    currentRound: FiveDGameCompletedRound
    statisticCustomersOrder: StatisticCustomersOrder[] 
    startTime: string
    endTime: string
}