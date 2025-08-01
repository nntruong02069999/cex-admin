export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

export enum WithdrawStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
}

export enum GameType {
  WINGO = 'wingo',
  TRX_WINGO = 'trx_wingo',
  K3 = '3k',
  D5 = '5d'
}

export enum GamePlayStyle {
  SECONDS_30 = 'SECONDS_30',
  MINUTES_1 = 'MINUTES_1',
  MINUTES_3 = 'MINUTES_3',
  MINUTES_5 = 'MINUTES_5',
  MINUTES_10 = 'MINUTES_10'
}

export interface PaymentTransaction {
  id: number
  createdAt?: number
  updatedAt?: number
  customerId: number
  paymentGatewayId: number
  paymentGatewayCode: string
  paymentChannelId: number
  paymentChannelCode: string
  providerPaymentCode: string
  orderId: string
  gatewayOrderId: string
  amount: number
  status: PaymentStatus
  paymentAt?: number
  failMessage?: string
  customerName?: string
}

export interface Withdraw {
  id: number
  createdAt?: number
  updatedAt?: number
  withdrawCode: string
  customerId: number
  amount: number
  feeWithdraw: number
  status: WithdrawStatus
  bankAccountId: number
  bankAccount?: {
    id: number
    bankName: string
    accountNumber: string
    accountName: string
  }
  customerName?: string
}

export interface TransactionResponse {
  code: number
  message: string
  data: {
    items: PaymentTransaction[] | Withdraw[]
    meta: {
      totalItems: number
      itemCount: number
      itemsPerPage: number
      totalPages: number
      currentPage: number
    }
  }
}

export interface CustomerLogin {
  id: number
  createdAt?: number
  updatedAt?: number
  customerId: number
  ipLogin: string
}

export interface BettingHistory {
  id: number
  createdAt?: number
  customerId: number
  gameType: GameType
  gamePlayStyle?: GamePlayStyle
  betAmount: number
  winAmount: number
  roundId: string
  result?: string
  status: string
}

export interface BettingStatistics {
  currentWinStreak: number  // Current consecutive wins (Liên thắng gần nhất)
  maxWinAmount: number      // Largest win amount (Vận thắng lớn nhất)
  maxWinStreak: number      // Highest consecutive win streak (Liên thắng cao nhất)
  totalBetAmount: number    // Total bet amount (Tổng cược)
  totalWinAmount: number    // Total win amount (Tổng thắng)
  maxBetAmount?: number     // Largest bet amount (Vận cược lớn nhất)
}

export enum WingoOrderState {
  WAITING = 'WAITING',
  WINNING = 'WINNING',
  LOSING = 'LOSING'
}

export enum WingoOrderType {
  NUMBER = 'NUMBER',
  COLOR = 'COLOR',
  SIZE = 'SIZE'
}

export enum WingoSize {
  SMALL = 'SMALL',
  LARGE = 'LARGE'
}

export enum WingoTimeConfig {
  SECONDS_30 = 'SECONDS_30',
  MINUTES_1 = 'MINUTES_1',
  MINUTES_3 = 'MINUTES_3',
  MINUTES_5 = 'MINUTES_5',
  MINUTES_10 = 'MINUTES_10'
}

export enum K3OrderType {
  SUM = 'SUM', // Tổng Số (Sum Value)
  TRIPLE_ANY = 'TRIPLE_ANY', // Ba Số Giống Nhau - Toàn bộ
  TRIPLE_SPECIFIC = 'TRIPLE_SPECIFIC', // Ba Số Giống Nhau - Đơn lẻ
  DOUBLE_ANY = 'DOUBLE_ANY', // Hai Số Giống Nhau - Phức hợp
  DOUBLE_SPECIFIC = 'DOUBLE_SPECIFIC', // Hai Số Giống Nhau - Đơn lẻ
  THREE_DISTINCT = 'THREE_DISTINCT', // Ba Số Khác Nhau
  TWO_DISTINCT = 'TWO_DISTINCT', // Hai Số Khác Nhau
  THREE_CONSECUTIVE = 'THREE_CONSECUTIVE', // Ba Số Liên Tiếp - Toàn bộ
  ODD_EVEN = 'ODD_EVEN', // Chẵn lẻ
  BIG_SMALL = 'BIG_SMALL' // Lớn nhỏ
}

export enum K3TimeConfig {
  SECONDS_30 = 'SECONDS_30',
  MINUTES_1 = 'MINUTES_1',
  MINUTES_3 = 'MINUTES_3',
  MINUTES_5 = 'MINUTES_5',
  MINUTES_10 = 'MINUTES_10'
}

export interface WingoOrder {
  id: number
  createdAt?: number
  updatedAt?: number
  customerId: number
  orderNumber: string
  issueNumber: string
  addTime: number
  amount: number
  number?: number
  colour?: string
  smallOrLarge?: WingoSize
  betCount: number
  fee: number
  realAmount: number
  selectType: WingoOrderType
  selectValue: string
  serviceCharge: number
  state: WingoOrderState
  winAmount: number
  wingoTimeConfig: WingoTimeConfig
  wingoGameRoundId: number
}

export interface TRXWingoOrder {
  id: number
  createdAt?: number
  updatedAt?: number
  customerId: number
  orderNumber: string
  issueNumber: string
  addTime: number
  amount: number
  number?: number
  colour?: string
  smallOrLarge?: WingoSize
  betCount: number
  fee: number
  realAmount: number
  selectType: WingoOrderType
  selectValue: string
  serviceCharge: number
  state: WingoOrderState
  winAmount: number
  wingoTimeConfig: WingoTimeConfig
  trxWingoGameRoundId: number
}

export interface K3Order {
  id: number
  createdAt?: number
  updatedAt?: number
  customerId: number
  orderNumber: string
  issueNumber: string
  addTime: number
  amount: number
  resultDice1?: number
  resultDice2?: number
  resultDice3?: number
  resultSum?: number
  betCount: number
  fee: number
  realAmount: number
  selectType: K3OrderType
  selectValue: string
  serviceCharge: number
  state: WingoOrderState
  winAmount: number
  k3TimeConfig: K3TimeConfig
  k3GameRoundId: number
}

export enum D5OrderType {
  DIGIT_SPECIFIC = 'DIGIT_SPECIFIC', // Số cụ thể cho vị trí A, B, C, D hoặc E
  DIGIT_HIGH_LOW = 'DIGIT_HIGH_LOW', // Lớn/Nhỏ cho vị trí A, B, C, D hoặc E
  DIGIT_ODD_EVEN = 'DIGIT_ODD_EVEN', // Chẵn/Lẻ cho vị trí A, B, C, D hoặc E
  SUM_HIGH_LOW = 'SUM_HIGH_LOW',     // Tổng Lớn/Nhỏ
  SUM_ODD_EVEN = 'SUM_ODD_EVEN'      // Tổng Chẵn/Lẻ
}

export enum D5Position {
  A = 'A',  // First position
  B = 'B',  // Second position
  C = 'C',  // Third position
  D = 'D',  // Fourth position
  E = 'E',  // Fifth position
  SUM = 'SUM' // All positions (for sum bets)
}

export enum D5TimeConfig {
  SECONDS_30 = 'SECONDS_30',
  MINUTES_1 = 'MINUTES_1',
  MINUTES_3 = 'MINUTES_3',
  MINUTES_5 = 'MINUTES_5',
  MINUTES_10 = 'MINUTES_10'
}

export interface D5Order {
  id: number
  createdAt?: number
  updatedAt?: number
  customerId: number
  orderNumber: string
  issueNumber: string
  addTime: number
  amount: number
  resultDigitA?: number
  resultDigitB?: number
  resultDigitC?: number
  resultDigitD?: number
  resultDigitE?: number
  resultSum?: number
  betCount: number
  fee: number
  realAmount: number
  selectType: D5OrderType
  position: D5Position
  selectValue: string
  serviceCharge: number
  state: WingoOrderState
  winAmount: number
  d5TimeConfig: D5TimeConfig
  d5GameRoundId: number
} 