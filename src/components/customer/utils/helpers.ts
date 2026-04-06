// Helper utility functions

import { STATUS_COLORS, STATUS_TEXT, VIP_LEVELS } from './constants';
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
 * Check if customer is VIP
 */
export const isVipCustomer = (customerVip: CustomerVip): boolean => {
  return customerVip?.currentVipLevel > 0;
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
 * Truncate address for display
 */
export function truncateAddress(address: string, start = 6, end = 4): string {
  if (!address || address.length <= start + end) {
    return address;
  }
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}