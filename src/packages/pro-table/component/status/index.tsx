import React, { CSSProperties, ReactNode } from 'react';
import { Badge } from 'antd';
import './index.less';

interface StatusProps {
  className?: string;
  style?: CSSProperties;
  title?: ReactNode;
  color?: string;
}

/**
 * 快捷操作，用于快速的展示一个状态
 */
const Status: {
  Success: React.FC<StatusProps>;
  Error: React.FC<StatusProps>;
  Processing: React.FC<StatusProps>;
  Default: React.FC<StatusProps>;
  Warning: React.FC<StatusProps>;
  Custom: React.FC<StatusProps>;
} = {
  Success: ({ children, title }) => <Badge status="success" title={title as string} text={children} />,
  Error: ({ children, title }) => <Badge status="error" title={title as string} text={children} />,
  Default: ({ children, title }) => <Badge status="default" title={title as string} text={children} />,
  Processing: ({ children, title }) => <Badge status="processing" title={title as string} text={children} />,
  Warning: ({ children, title }) => <Badge status="warning" title={title as string} text={children} />,
  Custom: ({ children, title, color }) => <Badge color={color as string} title={title as string} text={children} />,
};

export type StatusType = keyof typeof Status;

export default Status;
