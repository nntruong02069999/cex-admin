import { useState } from "react";
import axios from "axios";
import {
  Form,
  Input,
  Button,
  Typography,
  Alert,
  Card,
  Space,
  Divider,
} from "antd";
import {
  SafetyOutlined,
  ArrowLeftOutlined,
  LoginOutlined,
} from "@ant-design/icons";

const { Title, Paragraph } = Typography;

axios.defaults.baseURL = `${
  process.env.REACT_APP_URL ? process.env.REACT_APP_URL : window.location.origin
}/api`;

interface Verify2FAProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const Verify2FA = ({ onSuccess, onCancel }: Verify2FAProps) => {
  const [code, setCode] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
        "/admin/2fa/verify",
        {
          token: code,
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
      style={{
        maxWidth: 450,
        margin: "0 auto",
        boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
        borderRadius: "12px",
        overflow: "hidden",
      }}
      bordered={false}
      className="verification-card"
    >
      <div
        style={{
          background: "linear-gradient(120deg, #1890ff, #722ed1)",
          padding: "16px 0",
          marginTop: -24,
          marginLeft: -24,
          marginRight: -24,
          marginBottom: 24,
          textAlign: "center",
        }}
      >
        <SafetyOutlined style={{ fontSize: 36, color: "white" }} />
      </div>

      <Space
        direction="vertical"
        size="large"
        style={{ width: "100%", padding: "0 12px" }}
      >
        <div style={{ textAlign: "center" }}>
          <Title level={2} style={{ marginBottom: 8 }}>
            Two-Factor Authentication
          </Title>
          <Paragraph type="secondary" style={{ fontSize: 16 }}>
            Enter the 6-digit code from your Google Authenticator app to login.
          </Paragraph>
        </div>

        <Divider style={{ margin: "8px 0" }} />

        {error && (
          <Alert
            message="Verification Error"
            description={error}
            type="error"
            showIcon
            style={{ borderRadius: 8 }}
          />
        )}

        <Form
          onSubmitCapture={handleSubmit}
          layout="vertical"
          style={{ width: "100%" }}
        >
          <Form.Item>
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
                letterSpacing: "0.8em",
                fontSize: "1.5em",
                height: "60px",
                borderRadius: "8px",
                boxShadow: error ? "0 0 0 2px #ff4d4f" : "none",
                transition: "all 0.3s",
              }}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
            <Space style={{ width: "100%", justifyContent: "space-between" }}>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={onCancel}
                disabled={loading}
                size="large"
                style={{ borderRadius: "6px", paddingLeft: 12 }}
              >
                Back
              </Button>

              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                disabled={code.length !== 6}
                size="large"
                icon={<LoginOutlined />}
                style={{
                  borderRadius: "6px",
                  paddingRight: 16,
                  background:
                    code.length === 6
                      ? "linear-gradient(to right, #1890ff, #52c41a)"
                      : undefined,
                  border: code.length === 6 ? "none" : undefined,
                }}
              >
                Verify and Log In
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Space>
    </Card>
  );
};

export default Verify2FA;
