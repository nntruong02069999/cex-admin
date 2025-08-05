import { EffectsCommandMap, Model } from 'dva';
import { ReducersMapObject } from 'redux';
import { message } from 'antd';
import HouseWalletService, {
  WalletConfig,
  WalletRule,
  WithdrawTransaction,
  PayoutTransaction,
  DashboardStats,
  QueryParams
} from '@src/services/houseWalletService';

export interface HouseWalletState {
  // Dashboard
  stats: DashboardStats | null;
  statsLoading: boolean;

  // Wallet Configs
  walletConfigs: WalletConfig[];
  walletConfigsTotal: number;
  walletConfigsLoading: boolean;
  walletConfigModal: {
    visible: boolean;
    editingRecord: WalletConfig | null;
  };

  // Wallet Rules
  walletRules: WalletRule[];
  walletRulesTotal: number;
  walletRulesLoading: boolean;
  walletRuleModal: {
    visible: boolean;
    editingRecord: WalletRule | null;
  };

  // Withdraw Transactions
  withdrawTransactions: WithdrawTransaction[];
  withdrawTransactionsTotal: number;
  withdrawTransactionsLoading: boolean;
  withdrawDetailModal: {
    visible: boolean;
    record: WithdrawTransaction | null;
  };

  // Payout Transactions
  payoutTransactions: PayoutTransaction[];
  payoutTransactionsTotal: number;
  payoutTransactionsLoading: boolean;
  payoutDetailModal: {
    visible: boolean;
    record: PayoutTransaction | null;
  };
  payoutRetryModal: {
    visible: boolean;
    record: PayoutTransaction | null;
  };

  // UI State
  activeTab: string;
  queryParams: {
    walletConfigs: QueryParams;
    walletRules: QueryParams;
    withdrawTransactions: QueryParams;
    payoutTransactions: QueryParams;
  };
}

const houseWalletModel: Model = {
  namespace: 'houseWallet',

  state: {
    // Dashboard
    stats: null,
    statsLoading: false,

    // Wallet Configs
    walletConfigs: [],
    walletConfigsTotal: 0,
    walletConfigsLoading: false,
    walletConfigModal: {
      visible: false,
      editingRecord: null,
    },

    // Wallet Rules
    walletRules: [],
    walletRulesTotal: 0,
    walletRulesLoading: false,
    walletRuleModal: {
      visible: false,
      editingRecord: null,
    },

    // Withdraw Transactions
    withdrawTransactions: [],
    withdrawTransactionsTotal: 0,
    withdrawTransactionsLoading: false,
    withdrawDetailModal: {
      visible: false,
      record: null,
    },

    // Payout Transactions
    payoutTransactions: [],
    payoutTransactionsTotal: 0,
    payoutTransactionsLoading: false,
    payoutDetailModal: {
      visible: false,
      record: null,
    },
    payoutRetryModal: {
      visible: false,
      record: null,
    },

    // UI State
    activeTab: 'configs',
    queryParams: {
      walletConfigs: { page: 1, limit: 10 },
      walletRules: { page: 1, limit: 10 },
      withdrawTransactions: { page: 1, limit: 10 },
      payoutTransactions: { page: 1, limit: 10 },
    },
  } as HouseWalletState,

  effects: {
    // Dashboard Stats Effects
    *fetchDashboardStats(_, { call, put }: EffectsCommandMap): any {
      yield put({ type: 'setStatsLoading', payload: true });
      try {
        const stats = yield call(HouseWalletService.getDashboardStats);
        yield put({ type: 'setStats', payload: stats });
      } catch (error: any) {
        message.error(error.message || 'Failed to load dashboard stats');
      } finally {
        yield put({ type: 'setStatsLoading', payload: false });
      }
    },

    // Wallet Config Effects
    *fetchWalletConfigs({ payload = {} }, { call, put, select }: EffectsCommandMap): any {
      yield put({ type: 'setWalletConfigsLoading', payload: true });
      try {
        const currentParams = yield select((state: any) => state.houseWallet.queryParams.walletConfigs);
        const params = { ...currentParams, ...payload };

        const result = yield call(HouseWalletService.getWalletConfigs, params);
        yield put({ type: 'setWalletConfigs', payload: result });
        yield put({ type: 'setWalletConfigsQueryParams', payload: params });
      } catch (error: any) {
        message.error(error.message || 'Failed to load wallet configurations');
      } finally {
        yield put({ type: 'setWalletConfigsLoading', payload: false });
      }
    },

    *createWalletConfig({ payload }, { call, put }: EffectsCommandMap): any {
      try {
        yield call(HouseWalletService.createWalletConfig, payload);
        message.success('Wallet configuration created successfully');
        yield put({ type: 'closeWalletConfigModal' });
        yield put({ type: 'fetchWalletConfigs' });
        yield put({ type: 'fetchDashboardStats' });
      } catch (error: any) {
        message.error(error.message || 'Failed to create wallet configuration');
        throw error;
      }
    },

    *updateWalletConfig({ payload }, { call, put }: EffectsCommandMap): any {
      try {
        const { id, ...data } = payload;
        yield call(HouseWalletService.updateWalletConfig, id, data);
        message.success('Wallet configuration updated successfully');
        yield put({ type: 'closeWalletConfigModal' });
        yield put({ type: 'fetchWalletConfigs' });
        yield put({ type: 'fetchDashboardStats' });
      } catch (error: any) {
        message.error(error.message || 'Failed to update wallet configuration');
        throw error;
      }
    },

    *deleteWalletConfig({ payload }, { call, put }: EffectsCommandMap): any {
      try {
        yield call(HouseWalletService.deleteWalletConfig, payload);
        message.success('Wallet configuration deleted successfully');
        yield put({ type: 'fetchWalletConfigs' });
        yield put({ type: 'fetchDashboardStats' });
      } catch (error: any) {
        message.error(error.message || 'Failed to delete wallet configuration');
      }
    },

    *syncWalletBalance({ payload }, { call, put }: EffectsCommandMap): any {
      try {
        yield call(HouseWalletService.syncWalletBalance, payload);
        message.success('Balance synchronized successfully');
        yield put({ type: 'fetchWalletConfigs' });
        yield put({ type: 'fetchDashboardStats' });
      } catch (error: any) {
        message.error(error.message || 'Failed to synchronize balance');
      }
    },

    // Wallet Rule Effects
    *fetchWalletRules({ payload = {} }, { call, put, select }: EffectsCommandMap): any {
      yield put({ type: 'setWalletRulesLoading', payload: true });
      try {
        const currentParams = yield select((state: any) => state.houseWallet.queryParams.walletRules);
        const params = { ...currentParams, ...payload };

        const result = yield call(HouseWalletService.getWalletRules, params);
        yield put({ type: 'setWalletRules', payload: result });
        yield put({ type: 'setWalletRulesQueryParams', payload: params });
      } catch (error: any) {
        message.error(error.message || 'Failed to load wallet rules');
      } finally {
        yield put({ type: 'setWalletRulesLoading', payload: false });
      }
    },

    *createWalletRule({ payload }, { call, put }: EffectsCommandMap): any {
      try {
        yield call(HouseWalletService.createWalletRule, payload);
        message.success('Wallet rule created successfully');
        yield put({ type: 'closeWalletRuleModal' });
        yield put({ type: 'fetchWalletRules' });
        yield put({ type: 'fetchDashboardStats' });
      } catch (error: any) {
        message.error(error.message || 'Failed to create wallet rule');
        throw error;
      }
    },

    *updateWalletRule({ payload }, { call, put }: EffectsCommandMap): any {
      try {
        const { id, ...data } = payload;
        yield call(HouseWalletService.updateWalletRule, id, data);
        message.success('Wallet rule updated successfully');
        yield put({ type: 'closeWalletRuleModal' });
        yield put({ type: 'fetchWalletRules' });
        yield put({ type: 'fetchDashboardStats' });
      } catch (error: any) {
        message.error(error.message || 'Failed to update wallet rule');
        throw error;
      }
    },

    *deleteWalletRule({ payload }, { call, put }: EffectsCommandMap): any {
      try {
        yield call(HouseWalletService.deleteWalletRule, payload);
        message.success('Wallet rule deleted successfully');
        yield put({ type: 'fetchWalletRules' });
        yield put({ type: 'fetchDashboardStats' });
      } catch (error: any) {
        message.error(error.message || 'Failed to delete wallet rule');
      }
    },

    // Withdraw Transaction Effects
    *fetchWithdrawTransactions({ payload = {} }, { call, put, select }: EffectsCommandMap): any {
      yield put({ type: 'setWithdrawTransactionsLoading', payload: true });
      try {
        const currentParams = yield select((state: any) => state.houseWallet.queryParams.withdrawTransactions);
        const params = { ...currentParams, ...payload };

        const result = yield call(HouseWalletService.getWithdrawTransactions, params);
        yield put({ type: 'setWithdrawTransactions', payload: result });
        yield put({ type: 'setWithdrawTransactionsQueryParams', payload: params });
      } catch (error: any) {
        message.error(error.message || 'Failed to load withdraw transactions');
      } finally {
        yield put({ type: 'setWithdrawTransactionsLoading', payload: false });
      }
    },

    *fetchWithdrawTransactionDetails({ payload }, { call, put }: EffectsCommandMap): any {
      try {
        const record = yield call(HouseWalletService.getWithdrawTransactionDetails, payload);
        yield put({ type: 'showWithdrawDetailModal', payload: record });
      } catch (error: any) {
        message.error(error.message || 'Failed to load transaction details');
      }
    },

    // Payout Transaction Effects
    *fetchPayoutTransactions({ payload = {} }, { call, put, select }: EffectsCommandMap): any {
      yield put({ type: 'setPayoutTransactionsLoading', payload: true });
      try {
        const currentParams = yield select((state: any) => state.houseWallet.queryParams.payoutTransactions);
        const params = { ...currentParams, ...payload };

        const result = yield call(HouseWalletService.getPayoutTransactions, params);
        yield put({ type: 'setPayoutTransactions', payload: result });
        yield put({ type: 'setPayoutTransactionsQueryParams', payload: params });
      } catch (error: any) {
        message.error(error.message || 'Failed to load payout transactions');
      } finally {
        yield put({ type: 'setPayoutTransactionsLoading', payload: false });
      }
    },

    *fetchPayoutTransactionDetails({ payload }, { call, put }: EffectsCommandMap): any {
      try {
        const record = yield call(HouseWalletService.getPayoutTransactionDetails, payload);
        yield put({ type: 'showPayoutDetailModal', payload: record });
      } catch (error: any) {
        message.error(error.message || 'Failed to load payout details');
      }
    },

    *retryFailedPayout({ payload }, { call, put }: EffectsCommandMap): any {
      try {
        yield call(HouseWalletService.retryFailedPayout, payload);
        message.success('Payout retry initiated successfully');
        yield put({ type: 'closePayoutRetryModal' });
        yield put({ type: 'fetchPayoutTransactions' });
        yield put({ type: 'fetchDashboardStats' });
      } catch (error: any) {
        message.error(error.message || 'Failed to retry payout');
      }
    },
  },

  reducers: {
    // Dashboard Reducers
    setStats(state: HouseWalletState, action: { payload: any }) {
      return { ...state, stats: action.payload };
    },
    setStatsLoading(state: HouseWalletState, action: { payload: any }) {
      return { ...state, statsLoading: action.payload };
    },

    // Wallet Config Reducers
    setWalletConfigs(state: HouseWalletState, action: { payload: any }) {
      return {
        ...state,
        walletConfigs: action.payload.data,
        walletConfigsTotal: action.payload.total,
      };
    },
    setWalletConfigsLoading(state: HouseWalletState, action: { payload: any }) {
      return { ...state, walletConfigsLoading: action.payload };
    },
    setWalletConfigsQueryParams(state: HouseWalletState, action: { payload: any }) {
      return {
        ...state,
        queryParams: {
          ...state.queryParams,
          walletConfigs: action.payload,
        },
      };
    },
    showWalletConfigModal(state: HouseWalletState, action: { payload: any }) {
      return {
        ...state,
        walletConfigModal: {
          visible: true,
          editingRecord: action.payload || null,
        },
      };
    },
    closeWalletConfigModal(state: HouseWalletState) {
      return {
        ...state,
        walletConfigModal: {
          visible: false,
          editingRecord: null,
        },
      };
    },

    // Wallet Rule Reducers
    setWalletRules(state: HouseWalletState, action: { payload: any }) {
      return {
        ...state,
        walletRules: action.payload.data,
        walletRulesTotal: action.payload.total,
      };
    },
    setWalletRulesLoading(state: HouseWalletState, action: { payload: any }) {
      return { ...state, walletRulesLoading: action.payload };
    },
    setWalletRulesQueryParams(state: HouseWalletState, action: { payload: any }) {
      return {
        ...state,
        queryParams: {
          ...state.queryParams,
          walletRules: action.payload,
        },
      };
    },
    showWalletRuleModal(state: HouseWalletState, action: { payload: any }) {
      return {
        ...state,
        walletRuleModal: {
          visible: true,
          editingRecord: action.payload || null,
        },
      };
    },
    closeWalletRuleModal(state: HouseWalletState) {
      return {
        ...state,
        walletRuleModal: {
          visible: false,
          editingRecord: null,
        },
      };
    },

    // Withdraw Transaction Reducers
    setWithdrawTransactions(state: HouseWalletState, action: { payload: any }) {
      return {
        ...state,
        withdrawTransactions: action.payload.data,
        withdrawTransactionsTotal: action.payload.total,
      };
    },
    setWithdrawTransactionsLoading(state: HouseWalletState, action: { payload: any }) {
      return { ...state, withdrawTransactionsLoading: action.payload };
    },
    setWithdrawTransactionsQueryParams(state: HouseWalletState, action: { payload: any }) {
      return {
        ...state,
        queryParams: {
          ...state.queryParams,
          withdrawTransactions: action.payload,
        },
      };
    },
    showWithdrawDetailModal(state: HouseWalletState, action: { payload: any }) {
      return {
        ...state,
        withdrawDetailModal: {
          visible: true,
          record: action.payload,
        },
      };
    },
    closeWithdrawDetailModal(state: HouseWalletState) {
      return {
        ...state,
        withdrawDetailModal: {
          visible: false,
          record: null,
        },
      };
    },

    // Payout Transaction Reducers
    setPayoutTransactions(state: HouseWalletState, action: { payload: any }) {
      return {
        ...state,
        payoutTransactions: action.payload.data,
        payoutTransactionsTotal: action.payload.total,
      };
    },
    setPayoutTransactionsLoading(state: HouseWalletState, action: { payload: any }) {
      return { ...state, payoutTransactionsLoading: action.payload };
    },
    setPayoutTransactionsQueryParams(state: HouseWalletState, action: { payload: any }) {
      return {
        ...state,
        queryParams: {
          ...state.queryParams,
          payoutTransactions: action.payload,
        },
      };
    },
    showPayoutDetailModal(state: HouseWalletState, action: { payload: any }) {
      return {
        ...state,
        payoutDetailModal: {
          visible: true,
          record: action.payload,
        },
      };
    },
    closePayoutDetailModal(state: HouseWalletState) {
      return {
        ...state,
        payoutDetailModal: {
          visible: false,
          record: null,
        },
      };
    },
    showPayoutRetryModal(state: HouseWalletState, action: { payload: any }) {
      return {
        ...state,
        payoutRetryModal: {
          visible: true,
          record: action.payload,
        },
      };
    },
    closePayoutRetryModal(state: HouseWalletState) {
      return {
        ...state,
        payoutRetryModal: {
          visible: false,
          record: null,
        },
      };
    },

    // UI State Reducers
    setActiveTab(state: HouseWalletState, action: { payload: any }) {
      return { ...state, activeTab: action.payload };
    },
  } as ReducersMapObject<any, any>,
};

export default houseWalletModel;