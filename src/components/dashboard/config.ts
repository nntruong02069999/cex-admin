export const DASHBOARD_CONFIG = {
  currency: {
    symbol: "USDT",
    locale: "en-US",
  },
  dateFormat: "vi-VN",
  routes: {
    depositList: process.env.REACT_APP_ROUTE_DEPOSIT_LIST || "/list",
    withdrawalList: process.env.REACT_APP_ROUTE_WITHDRAWAL_LIST || "/list",
  },
  queryParams: {
    deposit: "?page=311",
    withdrawal: "?page=313",
  },
};
