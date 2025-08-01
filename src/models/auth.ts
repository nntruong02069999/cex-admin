import local from "@src/util/local";
import {
  signInUserWithUserPasswordRequest,
  signOutRequest,
} from "../services/auth";
import { Model } from "dva";
import { Action, Reducer, ReducersMapObject } from "redux";

const authModel: Model = {
  namespace: "auth",

  state: {
    loader: false,
    alertMessage: "",
    showMessage: false,
    initURL: "",
    authUser: local.get("user_id"),
    token: local.get("token"),
    twoFARedirect: {
      shouldRedirect: false,
      nextStep: null,
    },
  },

  effects: {
    *userSignIn({ payload }, { put, call }) {
      const {
        username,
        password,
        captchaId,
        captchaText,
        accountKitToken,
        tokenCapcha,
      } = payload;
      try {
        const res = yield call(
          signInUserWithUserPasswordRequest,
          username,
          password,
          captchaId,
          captchaText,
          accountKitToken,
          tokenCapcha
        );
        if (res instanceof Error) {
          yield put({
            type: "showAuthMessage",
            payload: res.message || "Hệ thống bận, vui lòng quay lại sau!",
          });
        } else {
          const signInUser = res.data;
          if (signInUser && signInUser.code === 0) {
            const tokenTemp2FA = signInUser.data.token;
            // set token temp 2FA
            localStorage.setItem("token_temp_2fa", tokenTemp2FA);
            const nextStep = signInUser.data.nextStep; // '2fa' : 'setup-2fa'

            // Hide auth loader before redirecting to 2FA flow
            yield put({
              type: "hideAuthLoader",
            });

            // Handle 2FA flow redirection
            yield put({
              type: "set2FARedirect",
              payload: {
                shouldRedirect: true,
                nextStep: nextStep,
              },
            });

            // Keep commented code for reference
            // yield put({
            //   type: "menu/getMenuData",
            //   payload: {
            //     role: signInUser.data.userInfo.role,
            //   },
            // });
            // localStorage.setItem(
            //   "user_id",
            //   JSON.stringify(signInUser.data.userInfo)
            // );
            // localStorage.setItem("token", signInUser.data.token);
            // yield put({
            //   type: "userSignInSuccess",
            //   payload: signInUser.data,
            // });
          } else {
            yield put({
              type: "showAuthMessage",
              payload:
                (signInUser || {}).message ||
                "Hệ thống bận, vui lòng quay lại sau!",
            });
          }
        }
      } catch (error: any) {
        console.error(
          `🚀 ~ file: auth.js ~ line 45 ~ *userSignIn ~ error`,
          error
        );
        yield put({
          type: "showAuthMessage",
          payload: error.message || "Hệ thống bận, vui lòng quay lại sau!",
        });
      } finally {
        // Make sure loader is hidden in all cases
        yield put({
          type: "hideAuthLoader",
        });
      }
    },
    *userSignOut({ }, { call, put }) {
      try {
        const signOutUser = yield call(signOutRequest);
        if (signOutUser === undefined) {
          localStorage.removeItem("user_id");
          localStorage.removeItem("token");
          yield put({
            type: "userSignOutSuccess",
            payload: signOutUser,
          });
        } else {
          yield put({
            type: "showAuthMessage",
            payload: signOutUser.message,
          });
        }
      } catch (error) {
        yield put({
          type: "showAuthMessage",
          payload: error,
        });
      }
    },
  },

  reducers: {
    setInitUrl(
      state,
      action: {
        payload: any;
      }
    ) {
      return {
        ...state,
        initURL: action.payload,
      } as Reducer<any, Action<any>>;
    },
    userSignOutSuccess(state) {
      return {
        ...state,
        authUser: null,
        token: null,
        initURL: "/",
        loader: false,
      } as Reducer<any, Action<any>>;
    },
    showMessage(
      state,
      action: {
        payload: any;
      }
    ) {
      return {
        ...state,
        alertMessage: action.payload,
        showMessage: true,
        loader: false,
      } as Reducer<any, Action<any>>;
    },
    hideMessage(state) {
      return {
        ...state,
        alertMessage: "",
        showMessage: false,
        loader: false,
      } as Reducer<any, Action<any>>;
    },
    hideLoader(
      state,
      action: {
        payload: any;
      }
    ) {
      return {
        ...state,
        alertMessage: action.payload,
        showMessage: true,
        loader: false,
      } as Reducer<any, Action<any>>;
    },
    showAuthLoader(state) {
      return {
        ...state,
        loader: true,
      } as Reducer<any, Action<any>>;
    },
    hideAuthLoader(state) {
      return {
        ...state,
        loader: false,
      } as Reducer<any, Action<any>>;
    },
    showAuthMessage(
      state,
      action: {
        payload: any;
      }
    ) {
      return {
        ...state,
        alertMessage: action.payload,
        showMessage: true,
        loader: false,
      } as Reducer<any, Action<any>>;
    },
    userSignInSuccess(
      state,
      action: {
        payload: any;
      }
    ) {
      return {
        ...state,
        loader: false,
        authUser: action.payload.userInfo,
        token: action.payload.token,
      } as Reducer<any, Action<any>>;
    },
    set2FARedirect(
      state,
      action: {
        payload: {
          shouldRedirect: boolean;
          nextStep: string | null;
        };
      }
    ) {
      return {
        ...state,
        twoFARedirect: action.payload,
      } as Reducer<any, Action<any>>;
    },
    clear2FARedirect(state) {
      return {
        ...state,
        twoFARedirect: {
          shouldRedirect: false,
          nextStep: null,
        },
      } as Reducer<any, Action<any>>;
    },
  } as ReducersMapObject<any, any>,
};

export default authModel;
