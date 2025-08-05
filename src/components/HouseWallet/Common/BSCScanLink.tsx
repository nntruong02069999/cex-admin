import React from 'react';
import { Button, Tooltip } from 'antd';
import { LinkOutlined, CopyOutlined } from '@ant-design/icons';

interface BSCScanLinkProps {
  txHash?: string;
  address?: string;
  type?: 'tx' | 'address';
  showCopy?: boolean;
  truncate?: boolean;
}

const BSCScanLink: React.FC<BSCScanLinkProps> = ({ 
  txHash, 
  address, 
  type = 'tx',
  showCopy = true,
  truncate = true 
}) => {
  const hash = txHash || address;
  if (!hash) return <span>-</span>;

  const BSC_NETWORK = process.env.REACT_APP_BSC_NETWORK || 'mainnet';
  
  const getBSCScanUrl = (hash: string, type: string): string => {
    const baseUrl = type === 'tx' 
      ? (BSC_NETWORK === 'mainnet' ? 'https://bscscan.com/tx/' : 'https://testnet.bscscan.com/tx/')
      : (BSC_NETWORK === 'mainnet' ? 'https://bscscan.com/address/' : 'https://testnet.bscscan.com/address/');
    return `${baseUrl}${hash}`;
  };

  const truncateHash = (hash: string, length: number = 8): string => {
    if (!hash) return '';
    if (hash.length <= length * 2) return hash;
    return `${hash.slice(0, length)}...${hash.slice(-length)}`;
  };

  const truncateAddress = (address: string): string => {
    return truncateHash(address, 6);
  };

  const url = getBSCScanUrl(hash, type);
  const displayText = truncate 
    ? (type === 'tx' ? truncateHash(hash) : truncateAddress(hash))
    : hash;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(hash);
  };

  return (
    <div className="bscscan-link">
      <Tooltip title={`Xem trên BSCScan: ${hash}`}>
        <Button 
          type="link" 
          icon={<LinkOutlined />}
          onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
          className="link-button"
        >
          {displayText}
        </Button>
      </Tooltip>
      
      {showCopy && (
        <Tooltip title="Sao chép vào clipboard">
          <Button 
            type="text" 
            icon={<CopyOutlined />}
            onClick={handleCopy}
            size="small"
            className="copy-button"
          />
        </Tooltip>
      )}
    </div>
  );
};

export default BSCScanLink;