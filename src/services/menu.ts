import request from '@src/util/request';
// import { menus } from '@src/nav';

export const getMenu = async () => {
  /* return Promise.resolve({
    status: 200,
    data: {
      code: 0,
      data: menus,
    },
  }) */
  return await request({
    url: `/admin/get-meta`,
  })
    .then((res) => res)
    .catch((error) => error)
}

