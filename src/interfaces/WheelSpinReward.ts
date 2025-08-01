export interface WheelSpinReward {
  id: number
  name: string
  rewardType: string
  moneyValue?: number
  itemDescription?: string
  probabilityWeight: number
  position: number
  color?: string
  icon?: string
  isDefault: boolean
  displayOrder: number
  isActive: boolean
  createdAt?: number
  updatedAt?: number
}

export interface CreateWheelSpinRewardRequest {
  name: string
  rewardType: string
  moneyValue?: number
  itemDescription?: string
  probabilityWeight?: number
  position: number
  color?: string
  icon?: string
  isDefault?: boolean
  displayOrder?: number
  isActive?: boolean
}

export interface UpdateWheelSpinRewardRequest {
  id: number
  name: string
  rewardType: string
  moneyValue?: number
  itemDescription?: string
  probabilityWeight?: number
  position?: number
  color?: string
  icon?: string
  isDefault?: boolean
  displayOrder?: number
  isActive?: boolean
}

export interface WheelSpinRewardResponse {
  code: number
  message: string
  data: WheelSpinReward[]
}

export enum WheelSpinRewardType {
  MONEY = 'MONEY',
  ITEM = 'ITEM'
} 