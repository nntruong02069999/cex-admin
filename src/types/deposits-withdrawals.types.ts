// TypeScript interfaces for Deposits & Withdrawals API integration

import { DepositTransaction, WithdrawTransaction } from '../components/customer/types/customer.types';

// Parameters for deposit list API
export interface DepositListParams {
    page?: number;
    limit?: number;
    status?: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
    asset?: string;
    chain?: string;
    fromDate?: number; // timestamp in milliseconds
    toDate?: number;   // timestamp in milliseconds
}

// Parameters for withdrawal list API  
export interface WithdrawListParams {
    page?: number;
    limit?: number;
    status?: 'PENDING' | 'SUCCESS' | 'REJECTED';
    type?: 'INTERNAL' | 'EXTERNAL';
    fromDate?: number; // timestamp in milliseconds
    toDate?: number;   // timestamp in milliseconds
}

// Response from deposits list API
export interface DepositsResponse {
    data: DepositTransaction[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// Response from withdrawals list API
export interface WithdrawalsResponse {
    data: WithdrawTransaction[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// Summary statistics for deposits and withdrawals
export interface DepositsWithdrawalsSummaryResponse {
    deposits: {
        successful: {
            amount: number;
            count: number;
        };
        pending: {
            amount: number;
            count: number;
        };
        failed: {
            amount: number;
            count: number;
        };
    };
    withdrawals: {
        successful: {
            amount: number;
            count: number;
        };
        pending: {
            amount: number;
            count: number;
        };
        rejected: {
            amount: number;
            count: number;
        };
    };
}