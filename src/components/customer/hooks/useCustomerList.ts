import { useState, useEffect, useCallback } from 'react';
import { CustomerListParams, CustomerListItem, DEFAULT_FILTERS } from '../CustomerList/types';
import { getCustomerListV2 } from '@src/services/customer';

interface UseCustomerListReturn {
  data: CustomerListItem[];
  total: number;
  loading: boolean;
  error: string | null;
  filters: CustomerListParams;
  setFilters: (filters: CustomerListParams) => void;
  updateFilter: (key: keyof CustomerListParams, value: any) => void;
  resetFilters: () => void;
  refetch: () => void;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize?: number) => void;
  };
}

export const useCustomerList = (): UseCustomerListReturn => {
  const [data, setData] = useState<CustomerListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<CustomerListParams>(DEFAULT_FILTERS);

  const fetchData = useCallback(async (currentFilters: CustomerListParams) => {
    try {
      setLoading(true);
      setError(null);

      // Build clean params (remove undefined/null/empty)
      const cleanParams: Record<string, any> = {};
      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          cleanParams[key] = value;
        }
      });

      const response = await getCustomerListV2(cleanParams);

      if ('errorCode' in response) {
        setError(response.message || 'Không thể tải danh sách khách hàng');
      } else {
        setData(response.data || []);
        setTotal(response.total || 0);
      }
    } catch (err: any) {
      console.error('Error fetching customer list:', err);
      setError(err.message || 'Đã xảy ra lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on filter change
  useEffect(() => {
    fetchData(filters);
  }, [filters, fetchData]);

  const setFilters = useCallback((newFilters: CustomerListParams) => {
    setFiltersState(newFilters);
  }, []);

  const updateFilter = useCallback((key: keyof CustomerListParams, value: any) => {
    setFiltersState(prev => {
      const updated = { ...prev, [key]: value };

      // Reset pagination when non-pagination filter changes
      if (key !== 'skip' && key !== 'limit') {
        updated.skip = 0;
      }

      return updated;
    });
  }, []);

  const resetFilters = useCallback(() => {
    setFiltersState(DEFAULT_FILTERS);
  }, []);

  const refetch = useCallback(() => {
    fetchData(filters);
  }, [filters, fetchData]);

  // Pagination helper
  const pagination = {
    current: Math.floor((filters.skip || 0) / (filters.limit || 20)) + 1,
    pageSize: filters.limit || 20,
    total,
    onChange: (page: number, pageSize?: number) => {
      const newLimit = pageSize || filters.limit || 20;
      setFiltersState(prev => ({
        ...prev,
        skip: (page - 1) * newLimit,
        limit: newLimit,
      }));
    },
  };

  return {
    data,
    total,
    loading,
    error,
    filters,
    setFilters,
    updateFilter,
    resetFilters,
    refetch,
    pagination,
  };
};
