// Trading History API Interfaces
export interface TradingHistoryParams {
    page?: number;
    limit?: number;
    fromDate?: number; // timestamp in milliseconds
    toDate?: number;   // timestamp in milliseconds
    side?: string;     // BUY or SELL
    status?: string;   // PENDING, SUCCESS, FAILED, etc.
    issueNumber?: string;
    result?: string;   // WIN, LOSS, DRAW
}

export interface TradingHistoryResponse {
    data: any[]; // Order array
    total: number;
    page: number;
    limit: number;
}

export interface TradingPnLSummaryParams {
    days?: number; // Default 7 days
    fromDate?: number; // timestamp in milliseconds
    toDate?: number;   // timestamp in milliseconds
}

export interface TradingSummaryResponse {
    totalTradeCount: number;
    totalTradeWinCount: number;
    totalTradeLoseCount: number;
    totalTradeDrawCount: number;
    totalTradeAmount: number;
    totalTradeAmountWin: number;
    totalTradeAmountLose: number;
    totalTradeAmountDraw: number;
    winRate: number;
    netPnL: number;
}