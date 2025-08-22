import { useState, useCallback } from 'react';
import { message } from 'antd';
import {
  adminDeposit,
  adminWithdraw,
  changeVipLevel,
  toggleMarketingStatus,
  changeHierarchy
} from '@src/services/customer';


export const useCustomerActions = () => {
  const [loading, setLoading] = useState({
    addBalance: false,
    subtractBalance: false,
    updateVip: false,
    updateMarketing: false,
    changeInviter: false
  });

  const addBalance = useCallback(async (customerId: number, amount: number, tokenCapcha: string, note?: string) => {
    setLoading(prev => ({ ...prev, addBalance: true }));

    try {
      const response = await adminDeposit(customerId, amount, tokenCapcha);

      if ('errorCode' in response) {
        throw new Error(response.message || 'Cộng tiền thất bại');
      } else {
        message.success('Cộng tiền thành công');
        return response;
      }
    } catch (error: any) {
      message.error(error.message || 'Có lỗi xảy ra khi cộng tiền');
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, addBalance: false }));
    }
  }, []);

  const subtractBalance = useCallback(async (customerId: number, amount: number, tokenCapcha: string, note?: string) => {
    setLoading(prev => ({ ...prev, subtractBalance: true }));

    try {
      const response = await adminWithdraw(customerId, amount, tokenCapcha);

      if ('errorCode' in response) {
        throw new Error(response.message || 'Trừ tiền thất bại');
      } else {
        message.success('Trừ tiền thành công');
        return response;
      }
    } catch (error: any) {
      message.error(error.message || 'Có lỗi xảy ra khi trừ tiền');
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, subtractBalance: false }));
    }
  }, []);

  const updateVipLevel = useCallback(async (customerId: number, newLevel: number, tokenCapcha: string, note?: string) => {
    setLoading(prev => ({ ...prev, updateVip: true }));

    try {
      const response = await changeVipLevel(customerId, newLevel, tokenCapcha);

      if ('errorCode' in response) {
        throw new Error(response.message || 'Cập nhật cấp VIP thất bại');
      } else {
        message.success('Cập nhật cấp VIP thành công');
        return response;
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
      const action = isAccountMarketing ? 'active' : 'deactive';
      const response = await toggleMarketingStatus(customerId, action);

      if ('errorCode' in response) {
        throw new Error(response.message || 'Cập nhật trạng thái marketing thất bại');
      } else {
        message.success('Cập nhật trạng thái marketing thành công');
        return response;
      }
    } catch (error: any) {
      message.error(error.message || 'Có lỗi xảy ra khi cập nhật marketing');
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, updateMarketing: false }));
    }
  }, []);

  const changeInviter = useCallback(async (customerId: number, nickname: string) => {
    setLoading(prev => ({ ...prev, changeInviter: true }));

    try {
      const response = await changeHierarchy(customerId, nickname);

      if ('errorCode' in response) {
        throw new Error(response.message || 'Thay đổi người giới thiệu thất bại');
      } else {
        message.success('Thay đổi người giới thiệu thành công');
        return response;
      }
    } catch (error: any) {
      message.error(error.message || 'Có lỗi xảy ra khi thay đổi người giới thiệu');
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, changeInviter: false }));
    }
  }, []);

  // Bulk operations
  const performBulkAction = useCallback(async (
    customerId: number,
    actions: Array<{
      type: 'ADD_BALANCE' | 'SUBTRACT_BALANCE' | 'UPDATE_VIP' | 'UPDATE_MARKETING' | 'CHANGE_INVITER';
      payload: any;
    }>
  ) => {
    const results = [];

    for (const action of actions) {
      try {
        let result;

        switch (action.type) {
          case 'ADD_BALANCE':
            result = await addBalance(customerId, action.payload.amount, action.payload.tokenCapcha, action.payload.note);
            break;
          case 'SUBTRACT_BALANCE':
            result = await subtractBalance(customerId, action.payload.amount, action.payload.tokenCapcha, action.payload.note);
            break;
          case 'UPDATE_VIP':
            result = await updateVipLevel(customerId, action.payload.newLevel, action.payload.tokenCapcha, action.payload.note);
            break;
          case 'UPDATE_MARKETING':
            result = await updateMarketingStatus(customerId, action.payload.isAccountMarketing);
            break;
          case 'CHANGE_INVITER':
            result = await changeInviter(customerId, action.payload.nickname);
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
  }, [addBalance, subtractBalance, updateVipLevel, updateMarketingStatus, changeInviter]);

  return {
    addBalance,
    subtractBalance,
    updateVipLevel,
    updateMarketingStatus,
    changeInviter,
    performBulkAction,
    loading
  };
};