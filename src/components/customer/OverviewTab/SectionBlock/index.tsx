import React, { memo } from "react";
import { Skeleton } from "antd";
import "./SectionBlock.less";

export type SectionAccent = "primary" | "success" | "gold" | "purple";

export interface SectionBlockProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  accent?: SectionAccent;
  extra?: React.ReactNode;
  loading?: boolean;
  className?: string;
  children: React.ReactNode;
}

const SectionBlockComponent: React.FC<SectionBlockProps> = ({
  icon,
  title,
  subtitle,
  accent = "primary",
  extra,
  loading = false,
  className,
  children,
}) => {
  return (
    <section
      className={`section-block section-block--${accent}${
        className ? ` ${className}` : ""
      }`}
    >
      <header className="section-block__header">
        <div className="section-block__icon-wrap">{icon}</div>
        <div className="section-block__heading">
          <h3 className="section-block__title">{title}</h3>
          {subtitle && (
            <p className="section-block__subtitle">{subtitle}</p>
          )}
        </div>
        {extra && <div className="section-block__extra">{extra}</div>}
      </header>
      <div className="section-block__body">
        {loading ? <Skeleton active paragraph={{ rows: 3 }} /> : children}
      </div>
    </section>
  );
};

export const SectionBlock = memo(SectionBlockComponent);

export interface SectionSkeletonProps {
  title?: string;
  rows?: number;
}

export const SectionSkeleton: React.FC<SectionSkeletonProps> = ({
  title,
  rows = 4,
}) => (
  <section className="section-block section-block--primary section-block--skeleton">
    <header className="section-block__header">
      <div className="section-block__icon-wrap" />
      <div className="section-block__heading">
        <h3 className="section-block__title">{title || "\u00a0"}</h3>
      </div>
    </header>
    <div className="section-block__body">
      <Skeleton active paragraph={{ rows }} />
    </div>
  </section>
);

export default SectionBlock;
