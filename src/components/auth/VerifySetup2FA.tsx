import { useState } from "react";
import axios from "axios";
import {
  Form,
  Input,
  Button,
  Alert,
  Card,
  Typography,
  Space,
  Spin,
} from "antd";

axios.defaults.baseURL = `${
  process.env.REACT_APP_URL ? process.env.REACT_APP_URL : window.location.origin
}/api`;

interface VerifySetup2FAProps {
  secret: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const VerifySetup2FA = ({
  secret,
  onSuccess,
  onCancel,
}: VerifySetup2FAProps) => {
  const [code, setCode] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const { Title, Text, Paragraph } = Typography;

  const handleSubmit = async () => {
    if (!code.trim()) {
      setError("Please enter the verification code");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const tokenTemp2FA = localStorage.getItem("token_temp_2fa");

      if (!tokenTemp2FA) {
        setError("Authentication token not found. Please login again.");
        return;
      }

      const response = await axios.post(
        "/admin/2fa/verify-setup",
        {
          token: code,
          secret,
        },
        {
          headers: {
            Authorization: `Bearer ${tokenTemp2FA}`,
          },
        }
      );

      if (response.data.code === 0) {
        // Store the actual token and user data
        localStorage.setItem("token", response.data.data.token);
        localStorage.setItem(
          "user_id",
          JSON.stringify(response.data.data.userInfo)
        );

        // Clear temporary token
        localStorage.removeItem("token_temp_2fa");

        onSuccess();
      } else {
        setError(response.data.message || "Invalid verification code");
      }
    } catch (err: any) {
      setError(err.message || "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      className="verify-2fa-card"
      style={{
        maxWidth: 500,
        margin: "0 auto",
        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      <div style={{ padding: "32px 24px" }}>
        <Title
          level={2}
          style={{ textAlign: "center", marginBottom: 32, color: "#1a3353" }}
        >
          Verify 2FA Setup
        </Title>

        <Paragraph
          style={{ marginBottom: 32, fontSize: "16px", textAlign: "center" }}
        >
          Enter the 6-digit code from your Google Authenticator app to complete
          setup.
        </Paragraph>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            style={{ marginBottom: 24, borderRadius: "6px" }}
          />
        )}

        <Form layout="vertical" onFinish={handleSubmit}>
          <Form.Item style={{ marginBottom: 32 }}>
            <Input
              size="large"
              placeholder="000000"
              value={code}
              onChange={(e) =>
                setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              maxLength={6}
              autoFocus
              style={{
                textAlign: "center",
                fontSize: "24px",
                letterSpacing: "12px",
                padding: "12px",
                height: "60px",
                borderRadius: "8px",
                fontWeight: "600",
              }}
            />
          </Form.Item>

          <Form.Item>
            <Space
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <Button
                type="default"
                onClick={onCancel}
                disabled={loading}
                size="large"
                style={{ borderRadius: "6px", minWidth: "100px" }}
              >
                Back
              </Button>

              <Button
                type="primary"
                htmlType="submit"
                disabled={loading || code.length !== 6}
                size="large"
                style={{
                  borderRadius: "6px",
                  minWidth: "200px",
                  background: code.length === 6 ? "#1890ff" : undefined,
                  transition: "all 0.3s",
                }}
                icon={loading ? <Spin size="small" /> : null}
              >
                {loading ? "Verifying..." : "Verify and Complete"}
              </Button>
            </Space>
          </Form.Item>
        </Form>

        <div
          style={{
            marginTop: 32,
            padding: 16,
            background: "#f0f7ff",
            borderRadius: 8,
            border: "1px solid #d6e8fc",
          }}
        >
          <Text
            type="secondary"
            style={{ display: "block", textAlign: "center" }}
          >
            <span style={{ marginRight: 8 }}>⏱️</span>
            Make sure the time on your device is correct, as authentication
            codes are time-sensitive.
          </Text>
        </div>
      </div>
    </Card>
  );
};

export default VerifySetup2FA;
