/* import React from 'react';
import {
  QuestionOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { Icon, InlineIcon } from '@iconify/react'; */

export const status3Enum = {
  true: { text: 'Hoạt động', status: 'Processing' },
  false: { text: 'Dừng', status: 'Default' },

};
export const statusEnum = {
  "-1": { text: 'Tất cả', status: 'Default' },
  "1": { text: 'Hoạt động', status: 'Processing' },
  "0": { text: 'Dừng', status: 'Default' },
  "2": { text: 'Ẩn', status: 'Error' },
};

export const status1Enum = {
  all: { text: 'Tất cả', status: 'Default' },
  off: { text: 'Dừng', status: 'Default' },
  active: { text: 'Hoạt động', status: 'Processing' },
  hidden: { text: 'Ẩn', status: 'Error' },
};

export const educationPrimary = {
  "nghiep_vu_le_tan": { "text": "Nghiệp vụ lễ tân", "status": "Custom", "color": "#33e081", "isText": true },
  "tin_hoc_van_phong": { "text": "Tin học văn phòng", "status": "Custom", "color": "#0c7785", "isText": true }
};

export const genderEnum = {
  "male": { "text": "Nam", "status": "Success", "isText": true },
  "female": { "text": "Nữ", "status": "Processing", "isText": true }
};

export const notificationTypeEnum = {
  "all": { "text": "Tất cả", "status": "Success", "isText": true },
  "personal": { "text": "Cá nhân", "status": "Processing", "isText": true }
};


export const actionBannerEnums = {
  "class": { "text": "Lớp học", "isText": true },
  "project": { "text": "Dự án", "isText": true },
  "openUrl": { "text": "Link mở", "isText": true }
};


export const colorsApartmentEnum = {
  "BÁN 4_Đã ký HĐMB": { color: "yellow", text: "BÁN 4_Đã ký HĐMB" },
  "BÁN 1_Đủ cọc và thủ tục": { color: 'green', text: "BÁN 1_Đủ cọc và thủ tục" },
  "BÁN 2_Đủ cọc": { color: '#B003F2', text: "BÁN 2_Đủ cọc" },
  "CHƯA BÁN 1_Chưa cọc": { color: '#f7fcfc', text: "CHƯA BÁN 1_Chưa cọc" },
  "CHƯA BÁN 2_Chưa đủ cọc": { color: '#FCA947', text: "CHƯA BÁN 2_Chưa đủ cọc" },
  "CHƯA BÁN 3_Hủy HDV/HĐMB": { color: '#AFA9A1', text: "CHƯA BÁN 3_Hủy HDV/HĐMB" },
  "CHƯA BÁN 4_Lock": { color: "red", text: "CHƯA BÁN 4_Lock" },
  "HIDE": { color: "#000000", text: "HIDE" }
}
