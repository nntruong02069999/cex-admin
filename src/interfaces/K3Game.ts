import { WINGO_TIME_CONFIG } from "@src/constants/enums"

export interface GetListCompletedRoundParams {
    skip: number
    limit: number
    timeConfig: WINGO_TIME_CONFIG
}

export interface SetK3GameResultParams {
    issueNumber: string
    dice1: number
    dice2: number
    dice3: number
}

export interface K3GameCompletedRound {
    id: number
    createdAt: number
    updatedAt: number
    issueNumber: string
    startTime: string
    endTime: string
    resultDice1: number
    resultDice2: number
    resultDice3: number
    resultSum: number
    isTriple: boolean
    isDouble: boolean
    isThreeDistinct: boolean
    isThreeConsecutive: boolean
    resultSize: "BIG" | "SMALL"
    resultOddEven: "ODD" | "EVEN"
    totalBetAmount: number
    totalWinAmount: number
    totalBetSum3: number
    totalBetSum4: number
    totalBetSum5: number
    totalBetSum6: number
    totalBetSum7: number
    totalBetSum8: number
    totalBetSum9: number
    totalBetSum10: number
    totalBetSum11: number
    totalBetSum12: number
    totalBetSum13: number
    totalBetSum14: number
    totalBetSum15: number
    totalBetSum16: number
    totalBetSum17: number
    totalBetSum18: number
    totalBetTripleAny: number
    totalBetTriple1: number
    totalBetTriple2: number
    totalBetTriple3: number
    totalBetTriple4: number
    totalBetTriple5: number
    totalBetTriple6: number
    totalBetDoubleAny: number
    totalBetDouble1: number
    totalBetDouble2: number
    totalBetDouble3: number
    totalBetDouble4: number
    totalBetDouble5: number
    totalBetDouble6: number
    totalBetThreeDistinct: number
    totalBetTwoDistinct: number
    totalBetThreeConsecutive: number
    totalBetBig: number
    totalBetSmall: number
    totalBetOdd: number
    totalBetEven: number
    isAdminConfigManually: boolean
    playerCount: number
    k3TimeConfig: WINGO_TIME_CONFIG
    state: string
    syntheticSuccess: boolean
} 