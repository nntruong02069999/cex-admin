import React, { useState, useEffect } from "react";
import { Modal, Button, message } from "antd";
import { CopyOutlined } from "@ant-design/icons";
import { QRCodeSVG } from "qrcode.react";

interface TwoFADisplayProps {
  twoFASecret: string;
  customerEmail: string;
  visible?: boolean;
  onClose?: () => void;
}

const TwoFADisplay: React.FC<TwoFADisplayProps> = ({
  twoFASecret,
  customerEmail,
  visible = false,
  onClose,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(visible);

  useEffect(() => {
    setIsModalVisible(visible);
  }, [visible]);

  const generateTotpUrl = (secret: string, email: string): string => {
    const issuer = "CEX Admin";
    const label = `${issuer}:${email}`;
    return `otpauth://totp/${encodeURIComponent(label)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}`;
  };

  const totpUrl = generateTotpUrl(twoFASecret, customerEmail);

  const handleCopySecret = () => {
    navigator.clipboard.writeText(twoFASecret);
    message.success("Đã sao chép mã 2FA!");
  };

  const handleClose = () => {
    setIsModalVisible(false);
    onClose?.();
  };

  return (
    <Modal
      title="Mã 2FA"
      visible={isModalVisible}
      onCancel={handleClose}
      footer={null}
      width={300}
      centered
    >
      <div style={{ textAlign: "center", padding: "20px 0" }}>
        <QRCodeSVG
          value={totpUrl}
          size={200}
          level="M"
          marginSize={4}
        />
        <div style={{ marginTop: "16px" }}>
          <Button
            type="primary"
            icon={<CopyOutlined />}
            onClick={handleCopySecret}
          >
            Sao chép
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default TwoFADisplay;