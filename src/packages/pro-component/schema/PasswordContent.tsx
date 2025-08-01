import React, { useState } from "react";
import { Button, Tooltip, message } from "antd";
import { EyeOutlined, EyeInvisibleOutlined, CopyOutlined } from "@ant-design/icons";

interface PasswordContentProps {
  content: string;
}

const PasswordContent: React.FC<PasswordContentProps> = ({ content }) => {
  const [visible, setVisible] = useState(false);
  
  const isEmpty = !content || content.trim() === '';
  
  const toggleVisibility = () => {
    setVisible(!visible);
  };
  
  const copyToClipboard = () => {
    if (isEmpty) return;
    
    navigator.clipboard.writeText(content)
      .then(() => {
        message.success("Password copied to clipboard");
      })
      .catch(() => {
        message.error("Failed to copy password");
      });
  };
  
  return (
    <div className="password-content-container">
      <div 
        className="password-content-wrapper"
        style={{
          display: "flex",
          alignItems: "center",
          maxWidth: "100%",
          overflow: "hidden",
          fontSize: "14px",
        }}
      >
        <div
          className="password-content"
          style={{
            flex: 1,
            padding: "4px 8px",
            border: "1px solid #d9d9d9",
            borderRadius: "4px",
            backgroundColor: "#fff",
            fontFamily: "monospace",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {isEmpty ? 
            <span style={{ color: "#bfbfbf" }}>Empty</span> : 
            (visible ? content : content.replace(/./g, "•"))
          }
        </div>
        
        <div style={{ display: "flex", marginLeft: "8px" }}>
          {!isEmpty && (
            <>
              <Tooltip title={visible ? "Hide password" : "Show password"}>
                <Button
                  type="text"
                  icon={visible ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                  onClick={toggleVisibility}
                  size="small"
                  style={{ marginRight: "4px" }}
                />
              </Tooltip>
              
              <Tooltip title="Copy password">
                <Button
                  type="text"
                  icon={<CopyOutlined />}
                  onClick={copyToClipboard}
                  size="small"
                />
              </Tooltip>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PasswordContent; 