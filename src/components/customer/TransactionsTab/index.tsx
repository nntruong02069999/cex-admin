import React, { useState, useEffect } from "react";
import { Tabs, message } from "antd";
import { WalletOutlined, DollarOutlined } from "@ant-design/icons";
import { USDTTransaction, WalletTransaction } from "../types/customer.types";
import {
  getCustomerUSDTTransactions,
  getCustomerWalletTransactions,
} from "../../../services/customer";
import USDTTransactions from "./USDTTransactions";
import WalletTransactions from "./WalletTransactions";
import "./styles.less";

const { TabPane } = Tabs;

interface TransactionsTabProps {
  customerId: number;
}

const TransactionsTab: React.FC<TransactionsTabProps> = ({ customerId }) => {
  const [activeSubTab, setActiveSubTab] = useState("usdt");

  // API State Management
  const [usdtTransactions, setUsdtTransactions] = useState<USDTTransaction[]>(
    []
  );
  const [walletTransactions, setWalletTransactions] = useState<
    WalletTransaction[]
  >([]);
  const [usdtLoading, setUsdtLoading] = useState(false);
  const [walletLoading, setWalletLoading] = useState(false);

  // Load data on component mount
  useEffect(() => {
    loadUSDTTransactions();
    loadWalletTransactions();
  }, [customerId]);

  // Load USDT Transactions
  const loadUSDTTransactions = async (params: any = {}) => {
    setUsdtLoading(true);
    try {
      const response = await getCustomerUSDTTransactions(customerId, {
        page: 1,
        limit: 10,
        ...params,
      });

      if (response.errorCode) {
        message.error(
          response.message || "Có lỗi xảy ra khi tải giao dịch USDT"
        );
        return;
      }

      setUsdtTransactions(response.data || []);
    } catch (error) {
      message.error("Có lỗi xảy ra khi tải giao dịch USDT");
      console.error("Error loading USDT transactions:", error);
    } finally {
      setUsdtLoading(false);
    }
  };

  // Load Wallet Transactions
  const loadWalletTransactions = async (params: any = {}) => {
    setWalletLoading(true);
    try {
      const response = await getCustomerWalletTransactions(customerId, {
        page: 1,
        limit: 10,
        ...params,
      });

      if (response.errorCode) {
        message.error(response.message || "Có lỗi xảy ra khi tải giao dịch ví");
        return;
      }

      setWalletTransactions(response.data || []);
    } catch (error) {
      message.error("Có lỗi xảy ra khi tải giao dịch ví");
      console.error("Error loading wallet transactions:", error);
    } finally {
      setWalletLoading(false);
    }
  };

  return (
    <div className="transactions-tab">
      <Tabs
        activeKey={activeSubTab}
        onChange={setActiveSubTab}
        type="card"
        className="transactions-sub-tabs"
      >
        <TabPane key="usdt" tab={<span><WalletOutlined /> Giao dịch USDT</span>}>
          <USDTTransactions
            transactions={usdtTransactions}
            loading={usdtLoading}
            onFilter={loadUSDTTransactions}
          />
        </TabPane>

        <TabPane key="wallet" tab={<span><DollarOutlined /> Giao dịch Ví</span>}>
          <WalletTransactions
            transactions={walletTransactions}
            loading={walletLoading}
            onFilter={loadWalletTransactions}
          />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default TransactionsTab;
