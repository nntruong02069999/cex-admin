import React, { memo } from "react";
import { UserOutlined } from "@ant-design/icons";
import { SectionBlock } from "../SectionBlock";
import { Customer, Inviter } from "../../types/customer.types";
import { formatDate } from "../../utils/formatters";
import "./AccountInfoSection.less";

interface AccountInfoSectionProps {
  customer: Pick<Customer, "nickname" | "inviteCode" | "createdAt">;
  inviter?: Inviter;
}

const AccountInfoSectionComponent: React.FC<AccountInfoSectionProps> = ({
  customer,
  inviter,
}) => {
  const fields = [
    { label: "Nickname", value: customer.nickname, mono: false },
    { label: "Mã mời", value: customer.inviteCode, mono: true },
    { label: "Người mời", value: inviter?.nickname || "Chưa có", mono: false },
    {
      label: "Ngày tham gia",
      value: formatDate(customer.createdAt, "DISPLAY_DATE"),
      mono: false,
    },
  ];

  return (
    <SectionBlock
      icon={<UserOutlined />}
      title="Thông tin tài khoản"
      subtitle="Định danh khách hàng trong hệ thống"
      accent="primary"
    >
      <div className="account-info-grid">
        {fields.map((f) => (
          <div key={f.label} className="account-info-field">
            <span className="account-info-field__label">{f.label}</span>
            <span
              className={`account-info-field__value${
                f.mono ? " account-info-field__value--mono" : ""
              }`}
            >
              {f.value}
            </span>
          </div>
        ))}
      </div>
    </SectionBlock>
  );
};

export default memo(AccountInfoSectionComponent);
