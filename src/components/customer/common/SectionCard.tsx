import React, { ReactNode } from 'react';
import { Card } from 'antd';

interface SectionCardProps {
  title: string;
  children: ReactNode;
  extra?: ReactNode;
}

const SectionCard: React.FC<SectionCardProps> = ({ title, children, extra }) => {
  return (
    <Card 
      className="gx-card" 
      title={title} 
      extra={extra}
      style={{ marginBottom: 16 }}
      bordered={true}
    >
      {children}
    </Card>
  );
};

export default SectionCard; 