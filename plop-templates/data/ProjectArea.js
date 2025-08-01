[
  {
    title: "ID",
    dataIndex: "id",
    width: 60,
    fixed: "left",
    hideInTable: false,
    hideInSearch: true,
    hideInForm: true
  },
  {
    title: "Tên",
    dataIndex: "name",
    width: 200,
    hasFilter: true,
    formPattern: {
      card: "Thông tin cơ bản",
      row: 1,
      col: 1
    }
  },

  {
    title: "Trạng thái",
    dataIndex: "isActive",
    width: 200,
    filters: true,
    valueEnum: {
      true: {
        text: "Hoạt động",
        status: "Processing",
        color: "#ec3b3b",
        isText: true
      },
      false: {
        text: "Dừng",
        status: "Default",
        color: "#ec3b3b",
        isText: true
      }
    },
    hasFilter: true,
    formPattern: {
      card: "Thông tin khác",
      row: 2,
      col: 1
    }
  },
  {
    title: "Ngày tạo",
    dataIndex: "createdAt",
    width: 150,
    valueType: "dateTime",
    hideInTable: false,
    hideInSearch: false,
    hideInForm: true
  },
  {
    title: "Ngày sửa",
    dataIndex: "updatedAt",
    width: 150,
    valueType: "dateTime",
    hideInTable: false,
    hideInSearch: false,
    hideInForm: true
  },
  {
    title: "Thứ tự sắp xếp",
    dataIndex: "sequence",
    width: 150,
    hideInTable: false,
    hideInSearch: false,
    hideInForm: false
  }
];
