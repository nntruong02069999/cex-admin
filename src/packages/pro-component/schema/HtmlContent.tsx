import React from "react";

interface HtmlContentProps {
  content: string;
}

const HtmlContent: React.FC<HtmlContentProps> = ({ content }) => {
  if (!content) return null;

  return (
    <div className="html-content-container">
      <div
        className="html-content-wrapper"
        style={{
          maxWidth: "100%",
          overflow: "auto",
          wordBreak: "break-word",
          fontSize: "14px",
        }}
      >
        <div
          dangerouslySetInnerHTML={{ __html: content }}
          className="html-content"
          style={{
            padding: "8px",
            backgroundColor: "#fff",
            borderRadius: "4px",
          }}
        />
      </div>
    </div>
  );
};

export default HtmlContent;
