export const CONFIG_LABELS: Record<string, string> = {
  CONFIG_PROFIT: "Ngưỡng Lợi Nhuận (%)",
  MIN_DEPOSIT_AMOUNT: "Số Tiền Nạp Tối Thiểu",
  TELEGRAM_NOTIFICATION_DEPOSIT_BOT_API_KEY: "API Key Bot Telegram (Nạp Tiền)",
  TELEGRAM_NOTIFICATION_DEPOSIT_CHAT_ID: "Chat ID Telegram (Nạp Tiền)",
  WITHDRAW_FEE: "Phí Rút Tiền (%)",
  MAX_DAILY_WITHDRAW: "Hạn Mức Rút Tối Đa / Ngày",
  MAX_DAILY_INTERNAL_TRANSFER: "Hạn Mức Chuyển Khoản Nội Bộ Tối Đa / Ngày",
  TELEGRAM_NOTIFICATION_WITHDRAW_BOT_API_KEY: "API Key Bot Telegram (Rút Tiền)",
  TELEGRAM_NOTIFICATION_WITHDRAW_CHAT_ID: "Chat ID Telegram (Rút Tiền)",
  TELEGRAM_NOTIFICATION_KYC_BOT_API_KEY: "API Key Bot Telegram (KYC)",
  TELEGRAM_NOTIFICATION_KYC_CHAT_ID: "Chat ID Telegram (KYC)",
};

export const getConfigLabel = (
  name: string | null,
  description: string | null,
): string => {
  if (description) return description;
  if (name && CONFIG_LABELS[name]) return CONFIG_LABELS[name];
  return name || "-";
};

export const isApiKey = (name: string | null): boolean => {
  return name ? name.includes("API_KEY") : false;
};
