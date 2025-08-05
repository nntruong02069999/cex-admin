import React from 'react';

interface AmountDisplayProps {
  amount: number;
  currency?: string;
  precision?: number;
  showSign?: boolean;
  colorful?: boolean;
}

const AmountDisplay: React.FC<AmountDisplayProps> = ({ 
  amount, 
  currency = 'USDT',
  precision = 2,
  showSign = false,
  colorful = true
}) => {
  const formatNumber = (num: number, precision: number = 2): string => {
    if (num === null || num === undefined) return '0';
    
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: precision,
      maximumFractionDigits: precision,
    }).format(num);
  };

  const formattedAmount = formatNumber(amount, precision);
  const sign = showSign && amount > 0 ? '+' : '';
  
  let className = 'amount-display';
  if (colorful) {
    if (amount > 0) className += ' positive';
    else if (amount < 0) className += ' negative';
    else className += ' zero';
  }

  return (
    <span className={className}>
      {sign}{formattedAmount} {currency}
    </span>
  );
};

export default AmountDisplay;