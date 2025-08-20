import { useState, useEffect, useCallback } from 'react';
import { CustomerDetailData } from '../types/customer.types';
import { CustomerDetailResponse } from '../types/api.types';

// Mock API service - replace with actual API calls
const customerApi = {
  async getCustomerDetail(customerId: number): Promise<CustomerDetailResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock data based on the specification
    const mockData: CustomerDetailData = {
      customer: {
        id: customerId,
        nickname: 'vip_user_123',
        firstName: 'Nguyễn Văn',
        lastName: 'A',
        email: 'user@email.com',
        avatar: undefined,
        isVerifyEmail: true,
        isBlocked: false,
        isVip: true,
        twoFAEnabled: true,
        statusDocument: 'approved',
        isAccountMarketing: true,
        inviteCode: 'ABC123456',
        inviterCustomerId: 1,
        totalMember: 32,
        totalMemberVip: 8,
        totalMemberVip1: 12,
        currentVipLevel: 3,
        createdAt: 1701360000, // Dec 1, 2023
        userLoginDate: 1705660200 // Jan 20, 2024 14:30
      },
      customerMoney: {
        balance: 1250.50,
        frozen: 100.00,
        total: 1350.50,
        balanceDemo: 850.00,
        balanceUSDT: 500.75,
        usdtAddress: '0x1234567890123456789012345678901234567890',
        totalDeposit: 5000,
        totalWithdraw: 750,
        totalTradeCount: 245,
        totalTradeAmount: 12500,
        totalTradeAmountWin: 8500,
        totalTradeAmountLose: 3500,
        totalTradeAmountDraw: 500,
        totalTradeWinCount: 208,
        totalTradeLoseCount: 32,
        totalTradeDrawCount: 5,
        totalVolumnTrade: 12500,
        totalOrderTradeSell: 120,
        totalOrderTradeBuy: 125,
        totalCommission: 1245.50,
        totalRewardFirstDeposit: 50.00,
        totalRewardMembersFirstDeposit: 125.00,
        totalRefundTradeAmount: 25.50,
        totalDailyQuestRewards: 75.00
      },
      hierarchy: {
        level1: { count: 12, vipCount: 8 },
        level2: { count: 8, vipCount: 3 },
        level3: { count: 5, vipCount: 2 },
        level4: { count: 3, vipCount: 1 },
        level5: { count: 2, vipCount: 0 },
        level6: { count: 1, vipCount: 0 },
        level7: { count: 1, vipCount: 0 }
      },
      networkSummary: {
        totalMembers: 32,
        totalVip: 14,
        monthlyGrowth: 5,
        totalCommission: 1245.50
      },
      inviter: {
        email: 'mentor@email.com',
        nickname: 'mentor_vip'
      }
    };

    return {
      success: true,
      data: mockData,
      message: 'Success'
    };
  }
};

export const useCustomerData = (customerId: number) => {
  const [data, setData] = useState<CustomerDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!customerId) {
      setError('ID khách hàng không hợp lệ');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await customerApi.getCustomerDetail(customerId);
      
      if (response.success && response.data) {
        setData(response.data);
      } else {
        setError(response.message || 'Không thể tải dữ liệu khách hàng');
      }
    } catch (err: any) {
      console.error('Error fetching customer data:', err);
      setError(err.message || 'Đã xảy ra lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch
  };
};