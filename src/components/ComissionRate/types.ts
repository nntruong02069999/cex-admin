export type CommissionMatrix = Record<string, Record<string, Record<string, number>>>;

export interface GameCategory {
  id: number;
  name: string;
  gameTypeCode: string;
}

export interface CommissionRateListResponse {
  code: number;
  message: string;
  data: {
    gameCategories: GameCategory[];
    commissionMatrix: CommissionMatrix;
  };
}

export interface CommissionRateUpdateRequest {
  gameTypeCode: string;
  commissionMatrix: Record<string, Record<string, number>>;
}

export interface CommissionRateUpdateResponse {
  code: number;
  message: string;
  data?: any;
}

export interface CommissionEditCell {
  gameTypeCode: string;
  agencyLevel: string;
  subordinateLevel: string;
  value: number;
}

export interface ApiError {
  errorCode: number;
  message: string;
} 