import { EffectsCommandMap, Model } from "dva";
import { Reducer } from "redux";
import { message } from "antd";
import {
  getAllConfig,
  editConfig,
  ConfigItem,
} from "@src/services/configService";

export interface ConfigState {
  order: ConfigItem[];
  deposit: ConfigItem[];
  withdraw: ConfigItem[];
  kyc: ConfigItem[];
  loading: boolean;
}

const configModel: Model = {
  namespace: "config",

  state: {
    order: [],
    deposit: [],
    withdraw: [],
    kyc: [],
    loading: false,
  } as ConfigState,

  effects: {
    *fetchAllConfig(_, { call, put }: EffectsCommandMap): any {
      yield put({ type: "setLoading", payload: true });
      try {
        const result = yield call(getAllConfig);
        if ("errorCode" in result) {
          message.error(result.message);
          return;
        }
        yield put({
          type: "setConfigData",
          payload: {
            order: result.configOrder || [],
            deposit: result.configDeposit || [],
            withdraw: result.configWithdraw || [],
            kyc: result.configKyc || [],
          },
        });
      } catch (error: any) {
        message.error(error.message || "Không thể tải cấu hình");
      } finally {
        yield put({ type: "setLoading", payload: false });
      }
    },

    *editConfig({ payload }, { call, put }: EffectsCommandMap): any {
      try {
        const { name, value } = payload;
        const result = yield call(editConfig, name, value);
        if ("errorCode" in result) {
          message.error(result.message);
          return;
        }
        message.success("Cập nhật cấu hình thành công");
        yield put({ type: "fetchAllConfig" });
      } catch (error: any) {
        message.error(error.message || "Không thể cập nhật cấu hình");
      }
    },
  },

  reducers: {
    setConfigData(state: ConfigState, action: { payload: any }) {
      return {
        ...state,
        order: action.payload.order,
        deposit: action.payload.deposit,
        withdraw: action.payload.withdraw,
        kyc: action.payload.kyc,
      };
    },
    setLoading(state: ConfigState, action: { payload: boolean }) {
      return { ...state, loading: action.payload };
    },
  } as Record<string, Reducer<any, any>>,
};

export default configModel;
