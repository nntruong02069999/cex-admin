export interface Customer {
    createdAt: number;
    updatedAt: number;
    id: number;
    name: string;
    userLoginDate: number;
    phone: string;
    email: string | null;
    password: string;
    passwordOld: string | null;
    isAllowWithdraw: boolean;
    isAllowUserAddUSDT: boolean;
    avatarId: number;
    isVerifyEmail: boolean;
    isUserFromThirdParty: boolean;
    uuid: string;
    inviteCode: string;
    inviterCustomerId: number | null;
    isFrom91Club: boolean;
    usernameGamePartner: string | null;
    passwordGamePartner: string | null;
    isInitWallet: boolean;
    unreadNotificationCount: number;
    isBlocked: boolean;
}

export interface CustomerMoney {
    createdAt: number;
    updatedAt: number;
    id: number;
    customerId: number;
    balance: number;
    frozen: number;
    total: number;
    totalDeposit: number;
    totalDepositMarketing: number;
    totalWithdraw: number;
    totalWithdrawMarketing: number;
    totalMoneyFromOld: number;

    // Statistics bet
    totalBetAmount: number;
    totalWinAmount: number;
    totalVolumnBet: number; // Total volumn bet to can withdraw ( when reach 0, can withdraw )

    // Statistics transaction
    totalAdminDepositInRevenue: number;
    totalAdminDepositNotInRevenue: number;
    totalAdminWithdrawInRevenue: number;
    totalAdminWithdrawNotInRevenue: number;
    totalCommission: number;
    totalEventMission: number;
    totalRewardFirstDeposit: number;
    totalRewardMembersFirstDeposit: number;
    totalRefundBetAmount: number;
    totalDailyQuestRewards: number;

}

export interface CustomerLogin {
    createdAt: number;
    updatedAt: number;
    id: number;
    customerId: number;
    ipLogin: string;
}

export interface BankAccount {
    createdAt: number;
    updatedAt: number;
    id: number;
    bankId: number;
    name: string;
    customerId: number;
    bankName: string;
    bankType: string;
    bankAccountNumber: string | null;
    phoneNumber: string | null;
    IFSCCode: string | null;
    usdtAddress: string | null;
    isPinned: boolean;
}

export interface AgencyCustomer {
    createdAt: number;
    updatedAt: number;
    id: number;
    customerId: number;
    currentLevelId: number;
    currentLevel: string;
    currentLevelNumber: number;
    currentTeamMembers: number;
    currentTeamBetting: number;
    currentTeamDeposit: number;
    currentOwnBetting: number;
    currentTeamMembersLevel1: number;
}

export interface FirstDeposit {
    createdAt: number;
    updatedAt: number;
    id: number;
    customerId: number;
    paymentTransactionId: number;
    amount: number;
    paymentAt: number;
}

export interface CustomerInfoResponse {
    customerInfo: Customer;
    customerMoney: CustomerMoney;
    firstLogin: CustomerLogin;
    lastLogin: CustomerLogin;
    bankInfo: BankAccount[];
    usdtBankInfo: BankAccount[];
    inviteCustomer?: Customer;
    agencyCustomer?: AgencyCustomer;
    firstDeposit?: FirstDeposit;
    wheelSpinUserBalance?: WheelUserBalance;
}

export interface AgencyLevel {
    createdAt: number;
    updatedAt: number;
    id: number;
    level: string;
    levelNumber: number;
    minTeamDeposit: number;
    minTeamMemberLevel1: number;
    minOwnBetting: number;
    isActive: boolean;
}

export interface WheelUserBalance {
    currentSpins: number;
    totalEarned: number;
    totalUsed: number;
    expiryDate: number;
}

export type TopF1Deposit = {
    name: string;
    phone: string;
    uuid: string;
    total: number;
}[]