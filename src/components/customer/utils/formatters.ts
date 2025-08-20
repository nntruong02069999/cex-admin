// Formatter utility functions

import { CURRENCY_SETTINGS, DATE_FORMATS } from './constants';

/**
 * Format currency values with proper symbols and precision
 */
export const formatCurrency = (
  amount: number | string, 
  currency: 'USD' | 'USDT' | 'VND' = 'USD'
): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) return '0';
  
  const { symbol, precision } = CURRENCY_SETTINGS[currency];
  
  return new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: precision,
    maximumFractionDigits: precision
  }).format(numAmount) + ` ${symbol}`;
};

/**
 * Format currency for display (shorter format with K, M abbreviations)
 */
export const formatCurrencyShort = (
  amount: number | string,
  currency: 'USD' | 'USDT' | 'VND' = 'USD'
): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) return '0';
  
  const { symbol } = CURRENCY_SETTINGS[currency];
  let formattedAmount: string;
  
  if (numAmount >= 1000000) {
    formattedAmount = (numAmount / 1000000).toFixed(1) + 'M';
  } else if (numAmount >= 1000) {
    formattedAmount = (numAmount / 1000).toFixed(1) + 'K';
  } else {
    formattedAmount = numAmount.toFixed(2);
  }
  
  return `${formattedAmount} ${symbol}`;
};

/**
 * Format date from timestamp
 */
export const formatDate = (
  timestamp: number | string,
  format: keyof typeof DATE_FORMATS = 'DISPLAY'
): string => {
  const numTimestamp = typeof timestamp === 'string' ? parseInt(timestamp) : timestamp;
  
  if (!numTimestamp || isNaN(numTimestamp)) return '';
  
  // Convert to milliseconds if needed (assuming timestamp is in seconds)
  const date = new Date(numTimestamp > 1e10 ? numTimestamp : numTimestamp * 1000);
  
  switch (format) {
    case 'DISPLAY':
      return date.toLocaleString('en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    case 'DISPLAY_DATE':
      return date.toLocaleDateString('en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    case 'API':
      return date.toISOString().split('T')[0];
    case 'TIMESTAMP':
      return date.toLocaleString('en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    default:
      return date.toLocaleString('en-US');
  }
};

/**
 * Format percentage with proper precision
 */
export const formatPercentage = (value: number | string, precision: number = 2): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return '0%';
  
  return `${numValue.toFixed(precision)}%`;
};

/**
 * Format number with thousand separators
 */
export const formatNumber = (value: number | string, precision?: number): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return '0';
  
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision
  }).format(numValue);
};

/**
 * Truncate address or hash for display
 */
export const truncateAddress = (address: string, startLength: number = 6, endLength: number = 6): string => {
  if (!address || address.length <= startLength + endLength) return address || '';
  
  return `${address.substring(0, startLength)}...${address.substring(address.length - endLength)}`;
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number = 50): string => {
  if (!text || text.length <= maxLength) return text || '';
  
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Format file size
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Format win rate calculation
 */
export const calculateWinRate = (wins: number, total: number): number => {
  if (total === 0) return 0;
  return (wins / total) * 100;
};

/**
 * Format trading result with color
 */
export const formatTradingResult = (result: 'WIN' | 'LOSE' | 'DRAW') => {
  const resultMap = {
    WIN: { text: 'THẮNG', color: 'success' },
    LOSE: { text: 'THUA', color: 'error' },
    DRAW: { text: 'HÒA', color: 'warning' }
  };
  
  return resultMap[result] || { text: result, color: 'default' };
};

/**
 * Format profit/loss with color
 */
export const formatProfitLoss = (amount: number) => {
  const formattedAmount = formatCurrency(Math.abs(amount));
  
  if (amount > 0) {
    return { text: `+${formattedAmount}`, color: 'success' };
  } else if (amount < 0) {
    return { text: `-${formattedAmount}`, color: 'error' };
  } else {
    return { text: formattedAmount, color: 'default' };
  }
};

/**
 * Format time ago (relative time)
 */
export const formatTimeAgo = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - (timestamp > 1e10 ? timestamp : timestamp * 1000);
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(months / 12);
  
  if (years > 0) return `${years} năm trước`;
  if (months > 0) return `${months} tháng trước`;
  if (days > 0) return `${days} ngày trước`;
  if (hours > 0) return `${hours} giờ trước`;
  if (minutes > 0) return `${minutes} phút trước`;
  return `${seconds} giây trước`;
};

/**
 * Format VIP level display
 */
export const formatVipLevel = (level: number): string => {
  if (level === 0) return 'Thường';
  return `VIP ${level}`;
};