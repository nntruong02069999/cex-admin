// Helper utility functions

import { STATUS_COLORS, STATUS_TEXT, VIP_LEVELS, TRADING_RESULTS } from './constants';
import { Customer, CustomerVip, NetworkHierarchy } from '../types/customer.types';

/**
 * Get status color for Ant Design components
 */
export const getStatusColor = (status: string): string => {
  return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || 'default';
};

/**
 * Get status text in Vietnamese
 */
export const getStatusText = (status: string): string => {
  return STATUS_TEXT[status as keyof typeof STATUS_TEXT] || status;
};

/**
 * Get VIP level information
 */
export const getVipLevelInfo = (level: number) => {
  return VIP_LEVELS.find(vip => vip.value === level) || VIP_LEVELS[0];
};

/**
 * Get trading result styling
 */
export const getTradingResultStyle = (result: 'WIN' | 'LOSE' | 'DRAW') => {
  return TRADING_RESULTS[result] || { text: result, color: 'default', icon: '❓' };
};

/**
 * Check if customer is VIP
 */
export const isVipCustomer = (customerVip: CustomerVip): boolean => {
  return customerVip?.currentVipLevel > 0;
};

/**
 * Check if customer is verified
 */
export const isVerifiedCustomer = (customer: Customer): boolean => {
  return customer.isVerifyEmail && customer.statusDocument === 'approved';
};

/**
 * Check if customer account is active
 */
export const isActiveCustomer = (customer: Customer): boolean => {
  return !customer.isBlocked;
};

/**
 * Calculate total network members from hierarchy
 */
export const calculateTotalNetworkMembers = (hierarchy: NetworkHierarchy): number => {
  return Object.values(hierarchy).reduce((total, level) => total + level.count, 0);
};

/**
 * Calculate total VIP members from hierarchy
 */
export const calculateTotalVipMembers = (hierarchy: NetworkHierarchy): number => {
  return Object.values(hierarchy).reduce((total, level) => total + level.vipCount, 0);
};

/**
 * Generate customer display name
 */
export const getCustomerDisplayName = (customer: Customer): string => {
  return `${customer.email}`.trim() || customer.nickname;
};

/**
 * Generate avatar URL or fallback
 */
export const getCustomerAvatar = (customer: Customer): string | undefined => {
  return customer.avatar || undefined;
};

/**
 * Calculate win rate percentage
 */
export const calculateWinRate = (wins: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((wins / total) * 100 * 100) / 100; // Round to 2 decimal places
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate amount input
 */
export const isValidAmount = (amount: string | number): boolean => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return !isNaN(numAmount) && numAmount > 0;
};

/**
 * Generate invite code (for reference)
 */
export const generateInviteCode = (length: number = 8): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    } catch (err) {
      document.body.removeChild(textArea);
      return false;
    }
  }
};

/**
 * Download data as CSV
 */
export const downloadCSV = (data: any[], filename: string, headers?: string[]): void => {
  if (!data.length) return;

  const csvHeaders = headers || Object.keys(data[0]);
  const csvContent = [
    csvHeaders.join(','),
    ...data.map(row =>
      csvHeaders.map(header => {
        const value = row[header];
        // Escape commas and quotes in values
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Format search params for API requests
 */
export const formatSearchParams = (params: Record<string, any>): Record<string, string> => {
  const formatted: Record<string, string> = {};

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      formatted[key] = String(value);
    }
  });

  return formatted;
};

/**
 * Debounce function for search inputs
 */
export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void => {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Check if object is empty
 */
export const isEmpty = (obj: any): boolean => {
  if (obj == null) return true;
  if (Array.isArray(obj) || typeof obj === 'string') return obj.length === 0;
  if (typeof obj === 'object') return Object.keys(obj).length === 0;
  return false;
};

/**
 * Deep clone object
 */
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
  if (Array.isArray(obj)) return obj.map(item => deepClone(item)) as unknown as T;

  const clonedObj = {} as T;
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      clonedObj[key] = deepClone(obj[key]);
    }
  }

  return clonedObj;
};

/**
 * Truncate address for display
 */
export function truncateAddress(address: string, start = 6, end = 4): string {
  if (!address || address.length <= start + end) {
    return address;
  }
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}


/**
 * Generate unique ID
 */
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Safe JSON parse
 */
export const safeJsonParse = <T>(jsonString: string, fallback: T): T => {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    return fallback;
  }
};