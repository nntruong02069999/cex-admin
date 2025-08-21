import { useState, useEffect, useCallback } from 'react';
import { CustomerDetailData } from '../types/customer.types';
import { CustomerDetailResponse } from '../types/api.types';
import { getCustomerInfo } from '@src/services/customer';

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
      
      const response = await getCustomerInfo(customerId);
      if ('errorCode' in response) {
        setError(response.message || 'Không thể tải dữ liệu khách hàng');
      } else {
        setData(response.data);
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