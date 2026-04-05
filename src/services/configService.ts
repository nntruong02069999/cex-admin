import { DEFAULT_ERROR_MESSAGE } from "@src/constants/constants";
import HttpStatusCode from "@src/constants/HttpStatusCode";
import request from "@src/util/request";

export interface ConfigItem {
  id: number;
  name: string | null;
  val: string | null;
  type: string | null;
  description: string | null;
  createdAt: number | null;
  updatedAt: number | null;
}

export interface GetAllConfigResponse {
  configOrder: ConfigItem[];
  configDeposit: ConfigItem[];
  configWithdraw: ConfigItem[];
  configKyc: ConfigItem[];
}

export const getAllConfig = async () => {
  const token = localStorage.getItem("token");
  const res: any = await request({
    url: "/admin/config/get-all-config",
    options: {
      method: "get",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });

  if (res && res.status === HttpStatusCode.OK && res.data?.code === 0) {
    return res.data.data as GetAllConfigResponse;
  } else {
    return {
      errorCode: res.data?.code || HttpStatusCode.UNKNOW_ERROR,
      message: res.data?.message || DEFAULT_ERROR_MESSAGE,
    };
  }
};

export const editConfig = async (name: string, value: string) => {
  const token = localStorage.getItem("token");
  const res: any = await request({
    url: "/admin/config/edit-config",
    options: {
      method: "post",
      data: { name, value },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });

  if (res && res.status === HttpStatusCode.OK && res.data?.code === 0) {
    return res.data;
  } else {
    return {
      errorCode: res.data?.code || HttpStatusCode.UNKNOW_ERROR,
      message: res.data?.message || DEFAULT_ERROR_MESSAGE,
    };
  }
};
