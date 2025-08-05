import React from 'react';
import { Card } from 'antd';

const HouseWalletHeader: React.FC = () => {
  return (
    <Card className="page-header" bordered={false}>
      <h2>Quản lý ví nhà cái</h2>
      <p>Quản lý ví nhà cái, quy tắc và theo dõi giao dịch</p>
    </Card>
  );
};

export default HouseWalletHeader;