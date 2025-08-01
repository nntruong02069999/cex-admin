import { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  Steps,
  Spin,
  Alert,
  Button,
  Typography,
  Space,
  message,
} from "antd";
import { CopyOutlined } from "@ant-design/icons";

const { Title, Paragraph, Text } = Typography;
const { Step } = Steps;

axios.defaults.baseURL = `${
  process.env.REACT_APP_URL ? process.env.REACT_APP_URL : window.location.origin
}/api`;

interface Setup2FAProps {
  onComplete: (secret: string) => void;
}

const Setup2FA = ({ onComplete }: Setup2FAProps) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [secret, setSecret] = useState<string>("");

  useEffect(() => {
    const fetchSetupData = async () => {
      try {
        setLoading(true);
        const tokenTemp2FA = localStorage.getItem("token_temp_2fa");

        if (!tokenTemp2FA) {
          setError("Authentication token not found. Please login again.");
          return;
        }

        const response = await axios.get("/admin/2fa/setup", {
          headers: {
            Authorization: `Bearer ${tokenTemp2FA}`,
          },
        });

        if (response.data.code === 0) {
          setQrCodeUrl(response.data.data.qrCodeUrl);
          setSecret(response.data.data.secret);
        } else {
          setError(
            response.data.message || "Failed to generate 2FA setup data"
          );
        }
      } catch (err: any) {
        setError(err.message || "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchSetupData();
  }, []);

  const handleContinue = () => {
    onComplete(secret);
  };

  const handleCopySecret = () => {
    navigator.clipboard.writeText(secret);
    message.success("Secret copied to clipboard!");
  };

  return (
    <Card
      className="auth-container"
      style={{
        maxWidth: 500,
        margin: "0 auto",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
        borderRadius: "8px",
      }}
    >
      <Title
        level={2}
        style={{
          textAlign: "center",
          marginBottom: 32,
          fontSize: "28px",
          fontWeight: 600,
        }}
      >
        Set up Two-Factor Authentication
      </Title>

      {loading ? (
        <div style={{ textAlign: "center", padding: "50px 0" }}>
          <Spin size="large" />
          <Paragraph style={{ marginTop: 20, opacity: 0.8 }}>
            Preparing your secure setup...
          </Paragraph>
        </div>
      ) : error ? (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: 24, borderRadius: "6px" }}
        />
      ) : (
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <Steps direction="vertical" current={-1} progressDot>
            <Step
              title={
                <span style={{ fontSize: "16px", fontWeight: 500 }}>
                  Scan QR Code
                </span>
              }
              description={
                <Space direction="vertical" style={{ marginTop: 16 }}>
                  <Paragraph style={{ color: "#666" }}>
                    Scan the QR code with your authenticator app
                  </Paragraph>
                  {qrCodeUrl && (
                    <div
                      style={{
                        textAlign: "center",
                        background: "#f7f9fc",
                        padding: 20,
                        borderRadius: 10,
                        border: "1px solid #e1e5ee",
                        marginTop: 8,
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.03)",
                      }}
                    >
                      <img
                        src={qrCodeUrl}
                        alt="QR Code for 2FA setup"
                        style={{
                          maxWidth: 200,
                          padding: 10,
                          background: "white",
                          borderRadius: 6,
                        }}
                      />
                    </div>
                  )}
                </Space>
              }
            />
            <Step
              title={
                <span style={{ fontSize: "16px", fontWeight: 500 }}>
                  Manual Setup
                </span>
              }
              description={
                <Space direction="vertical" style={{ marginTop: 16 }}>
                  <Paragraph style={{ color: "#666" }}>
                    Or manually enter this secret key in your app:
                  </Paragraph>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      background: "#f9fafb",
                      padding: "8px",
                      borderRadius: "6px",
                      border: "1px solid #eaecf0",
                    }}
                  >
                    <Text
                      code
                      style={{
                        padding: "10px 12px",
                        flex: 1,
                        fontSize: 16,
                        letterSpacing: "0.5px",
                        background: "white",
                        borderRadius: "4px",
                      }}
                    >
                      {secret}
                    </Text>
                    <Button
                      type="primary"
                      icon={<CopyOutlined />}
                      onClick={handleCopySecret}
                      size="middle"
                      style={{ marginLeft: 8 }}
                    >
                      Copy
                    </Button>
                  </div>
                </Space>
              }
            />
            <Step
              title={
                <span style={{ fontSize: "16px", fontWeight: 500 }}>
                  Verification
                </span>
              }
              description={
                <Paragraph style={{ marginTop: 16, color: "#666" }}>
                  After adding to your app, you'll need to verify by entering a
                  code
                </Paragraph>
              }
            />
          </Steps>

          <Button
            type="primary"
            size="large"
            block
            onClick={handleContinue}
            style={{
              height: "48px",
              fontSize: "16px",
              marginTop: 8,
              borderRadius: "6px",
            }}
          >
            Continue to Verification
          </Button>
        </Space>
      )}
    </Card>
  );
};

export default Setup2FA;
