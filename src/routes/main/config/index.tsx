import React, { useEffect } from "react";
import { connect } from "dva";
import { Tabs, Card, Spin } from "antd";
import {
  ShoppingCartOutlined,
  WalletOutlined,
  MoneyCollectOutlined,
  IdcardOutlined,
} from "@ant-design/icons";
import ConfigTable from "@src/components/Config/ConfigTable";
import { ConfigState } from "@src/models/config";
import "./index.less";

const { TabPane } = Tabs;

interface ConfigPageProps {
  config: ConfigState;
  dispatch: any;
  loading: boolean;
}

const ConfigPage: React.FC<ConfigPageProps> = ({
  config,
  dispatch,
  loading,
}) => {
  const { order, deposit, withdraw, kyc } = config;

  useEffect(() => {
    dispatch({ type: "config/fetchAllConfig" });
  }, [dispatch]);

  if (loading) {
    return (
      <div className="config-page">
        <div className="loading-container">
          <Spin size="large" />
        </div>
      </div>
    );
  }

  return (
    <div className="config-page">
      <Card bordered={false}>
        <Tabs defaultActiveKey="order" size="large" type="card">
          <TabPane
            tab={
              <span>
                <ShoppingCartOutlined />
                Cài đặt cược
              </span>
            }
            key="order"
          >
            <ConfigTable dataSource={order} />
          </TabPane>

          <TabPane
            tab={
              <span>
                <WalletOutlined />
                Nạp tiền
              </span>
            }
            key="deposit"
          >
            <ConfigTable dataSource={deposit} />
          </TabPane>

          <TabPane
            tab={
              <span>
                <MoneyCollectOutlined />
                Rút tiền
              </span>
            }
            key="withdraw"
          >
            <ConfigTable dataSource={withdraw} />
          </TabPane>

          <TabPane
            tab={
              <span>
                <IdcardOutlined />
                KYC
              </span>
            }
            key="kyc"
          >
            <ConfigTable dataSource={kyc} />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

const mapStateToProps = ({ config, loading }: any) => ({
  config,
  loading: loading.effects["config/fetchAllConfig"],
});

export default connect(mapStateToProps)(ConfigPage);
