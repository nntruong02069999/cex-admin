import { useState, useCallback } from 'react';
import { message } from 'antd';
import { 
  AddBalanceRequest,
  AddBalanceResponse,
  SubtractBalanceRequest,
  SubtractBalanceResponse,
  UpdateVipLevelRequest,
  UpdateVipLevelResponse,
  UpdateMarketingStatusRequest,
  UpdateMarketingStatusResponse
} from '../types/api.types';

// Mock API service - replace with actual API calls
const customerActionApi = {
  async addBalance(customerId: number, request: AddBalanceRequest): Promise<AddBalanceResponse> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      data: {
        newBalance: 1500.50 + request.amount,
        transactionId: 'TXN_' + Date.now()
      },
      message: 'Cộng tiền thành công'
    };
  },

  async subtractBalance(customerId: number, request: SubtractBalanceRequest): Promise<SubtractBalanceResponse> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      data: {
        newBalance: 1500.50 - request.amount,
        transactionId: 'TXN_' + Date.now()
      },
      message: 'Trừ tiền thành công'
    };
  },

  async updateVipLevel(customerId: number, request: UpdateVipLevelRequest): Promise<UpdateVipLevelResponse> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      data: {
        oldLevel: 3,
        newLevel: request.newLevel,
        upgradeFee: request.newLevel > 3 ? (request.newLevel - 3) * 100 : 0
      },
      message: 'Cập nhật cấp VIP thành công'
    };
  },

  async updateMarketingStatus(customerId: number, request: UpdateMarketingStatusRequest): Promise<UpdateMarketingStatusResponse> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      data: {
        isAccountMarketing: request.isAccountMarketing
      },
      message: 'Cập nhật trạng thái marketing thành công'
    };
  }
};

export const useCustomerActions = () => {
  const [loading, setLoading] = useState({
    addBalance: false,
    subtractBalance: false,
    updateVip: false,
    updateMarketing: false
  });

  const addBalance = useCallback(async (customerId: number, amount: number, note?: string) => {
    setLoading(prev => ({ ...prev, addBalance: true }));
    
    try {
      const response = await customerActionApi.addBalance(customerId, { amount, note });
      
      if (response.success) {
        message.success(response.message || 'Cộng tiền thành công');
        return response.data;
      } else {
        throw new Error(response.message || 'Cộng tiền thất bại');
      }
    } catch (error: any) {
      message.error(error.message || 'Có lỗi xảy ra khi cộng tiền');
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, addBalance: false }));
    }
  }, []);

  const subtractBalance = useCallback(async (customerId: number, amount: number, note?: string) => {
    setLoading(prev => ({ ...prev, subtractBalance: true }));
    
    try {
      const response = await customerActionApi.subtractBalance(customerId, { amount, note });
      
      if (response.success) {
        message.success(response.message || 'Trừ tiền thành công');
        return response.data;
      } else {
        throw new Error(response.message || 'Trừ tiền thất bại');
      }
    } catch (error: any) {
      message.error(error.message || 'Có lỗi xảy ra khi trừ tiền');
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, subtractBalance: false }));
    }
  }, []);

  const updateVipLevel = useCallback(async (customerId: number, newLevel: number, note?: string) => {
    setLoading(prev => ({ ...prev, updateVip: true }));
    
    try {
      const response = await customerActionApi.updateVipLevel(customerId, { newLevel, note });
      
      if (response.success) {
        message.success(response.message || 'Cập nhật cấp VIP thành công');
        return response.data;
      } else {
        throw new Error(response.message || 'Cập nhật cấp VIP thất bại');
      }
    } catch (error: any) {
      message.error(error.message || 'Có lỗi xảy ra khi cập nhật VIP');
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, updateVip: false }));
    }
  }, []);

  const updateMarketingStatus = useCallback(async (customerId: number, isAccountMarketing: boolean) => {
    setLoading(prev => ({ ...prev, updateMarketing: true }));
    
    try {
      const response = await customerActionApi.updateMarketingStatus(customerId, { isAccountMarketing });
      
      if (response.success) {
        message.success(response.message || 'Cập nhật trạng thái marketing thành công');
        return response.data;
      } else {
        throw new Error(response.message || 'Cập nhật trạng thái marketing thất bại');
      }
    } catch (error: any) {
      message.error(error.message || 'Có lỗi xảy ra khi cập nhật marketing');
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, updateMarketing: false }));
    }
  }, []);

  // Bulk operations
  const performBulkAction = useCallback(async (
    customerId: number,
    actions: Array<{
      type: 'ADD_BALANCE' | 'SUBTRACT_BALANCE' | 'UPDATE_VIP' | 'UPDATE_MARKETING';
      payload: any;
    }>
  ) => {
    const results = [];
    
    for (const action of actions) {
      try {
        let result;
        
        switch (action.type) {
          case 'ADD_BALANCE':
            result = await addBalance(customerId, action.payload.amount, action.payload.note);
            break;
          case 'SUBTRACT_BALANCE':
            result = await subtractBalance(customerId, action.payload.amount, action.payload.note);
            break;
          case 'UPDATE_VIP':
            result = await updateVipLevel(customerId, action.payload.newLevel, action.payload.note);
            break;
          case 'UPDATE_MARKETING':
            result = await updateMarketingStatus(customerId, action.payload.isAccountMarketing);
            break;
          default:
            throw new Error('Loại thao tác không được hỗ trợ');
        }
        
        results.push({ success: true, result, action });
      } catch (error) {
        results.push({ success: false, error, action });
      }
    }
    
    return results;
  }, [addBalance, subtractBalance, updateVipLevel, updateMarketingStatus]);

  return {
    addBalance,
    subtractBalance,
    updateVipLevel,
    updateMarketingStatus,
    performBulkAction,
    loading
  };
};