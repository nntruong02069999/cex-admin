import request from '@src/util/request';

export const signInUserWithUserPasswordRequest = async (
  username: string,
  password: string,
  captchaId: string,
  captchaText: string,
  accountKitToken: string,
  tokenCapcha: string
) =>
  await request({
    url: `/admin/user/login`,
    options: {
      method: 'post',
      data: {
        username,
        password,
        captchaId,
        captchaText,
        accountKitToken,
        tokenCapcha,
      },
    },
  })
    .then((authUser) => authUser)
    .catch((error) => error);

export const getCaptcha = async () =>
  await request({
    url: `user/create-captcha`,
    options: {
      method: 'post',
    },
  })
    .then((res) => res)
    .catch((error) => error);

export const signOutRequest = () => Promise.resolve();
