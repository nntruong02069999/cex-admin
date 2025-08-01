import React, { useState, useMemo, useRef, useEffect } from "react";
import { Button, Typography } from "antd";
import { DownOutlined, UpOutlined } from "@ant-design/icons";
import {
  IntroType,
  normalizeIntro,
  shouldTruncateIntro,
} from "./types/IntroConfig";
import "@src/styles/introDisplay/IntroDisplay.less";

const { Text } = Typography;

export interface IntroDisplayProps {
  intro: IntroType;
  className?: string;
  style?: React.CSSProperties;
}

const IntroDisplay: React.FC<IntroDisplayProps> = ({
  intro,
  className = "",
  style,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const config = useMemo(() => normalizeIntro(intro), [intro]);

  useEffect(() => {
    if (config?.defaultExpanded) {
      setIsExpanded(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config?.defaultExpanded]);

  // Move all useMemo hooks before early return
  const {
    content = "",
    type,
    collapsible,
    maxLines,
    showToggle,
  } = config || {};

  // Simple HTML sanitization without external library
  const sanitizeHTML = (html: string): string => {
    // Remove script tags and dangerous content but keep more styling
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/on\w+\s*=\s*"[^"]*"/gi, "")
      .replace(/on\w+\s*=\s*'[^']*'/gi, "")
      .replace(/javascript:/gi, "")
      .trim();
  };

  // Sanitize HTML content for security
  const sanitizedContent = useMemo(() => {
    if (!config || type !== "html") return content;
    return sanitizeHTML(content);
  }, [content, type, config]);

  // Check if content should be truncated
  const shouldTruncate = useMemo(() => {
    if (!config || !content || content.trim() === "") return false;
    return collapsible && shouldTruncateIntro(content, maxLines);
  }, [content, maxLines, collapsible, config]);

  // Calculate truncated content for text type
  const truncatedTextContent = useMemo(() => {
    if (
      !config ||
      type !== "text" ||
      !shouldTruncate ||
      isExpanded ||
      !content
    ) {
      return content;
    }

    const lines = content.split("\n");
    if (lines.length > maxLines!) {
      return lines.slice(0, maxLines).join("\n") + "...";
    }

    // Handle long single line
    const averageLineLength = 80;
    const maxChars = maxLines! * averageLineLength;
    if (content.length > maxChars) {
      return content.substring(0, maxChars) + "...";
    }

    return content;
  }, [content, type, shouldTruncate, isExpanded, maxLines, config]);

  if (!config || !content || content.trim() === "") return null;

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const renderContent = () => {
    if (type === "html") {
      // Debug: Log HTML content
      console.log("🔍 IntroDisplay HTML Debug:", {
        original: content,
        sanitized: sanitizedContent,
        type: type,
      });

      // Calculate more accurate max height based on line-height and content
      const lineHeight = 1.5; // from CSS
      const fontSize = 13; // from CSS
      const actualLineHeight = fontSize * lineHeight;
      const calculatedMaxHeight =
        !isExpanded && shouldTruncate
          ? `${maxLines! * actualLineHeight + 8}px` // +8px for margin/padding
          : "none";

      return (
        <div
          className={`intro-display-html ${
            !isExpanded && shouldTruncate ? "intro-display-html-collapsed" : ""
          }`}
          style={{
            maxHeight: calculatedMaxHeight,
            overflow: "hidden",
            lineHeight: lineHeight,
          }}
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          ref={contentRef}
        />
      );
    }

    return (
      <Text className="intro-display-text">
        {isExpanded ? content : truncatedTextContent}
      </Text>
    );
  };

  const showToggleButton = showToggle && shouldTruncate;

  return (
    <div className={`intro-display ${className}`} style={style}>
      <div className="intro-display-content">{renderContent()}</div>

      {showToggleButton && (
        <div className="intro-display-toggle">
          <Button
            type="link"
            size="small"
            onClick={handleToggle}
            icon={isExpanded ? <UpOutlined /> : <DownOutlined />}
            className="intro-display-toggle-btn"
          >
            {isExpanded ? "Thu gọn" : "Xem thêm"}
          </Button>
        </div>
      )}
    </div>
  );
};
export default React.memo(IntroDisplay);
