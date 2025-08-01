import memoizeOne from 'memoize-one';
import isEqual from 'lodash/isEqual';
import get from 'lodash/get';
import union from 'lodash/union';
import includes from 'lodash/includes';
import * as menuServices from '@src/services/menu';
import { EffectsCommandMap, Model } from 'dva';
import { ReducersMapObject } from 'redux';
import local from '@src/util/local';

// Conversion router to menu.
function formatter(data: Array<Record<string, any>>, parentAuthority?: any) {
  const dataWithRole = data.filter(
    (item) =>
      !item.roles ||
      item.roles.length === 0 ||
      includes(item.roles, parentAuthority)
  );
  const parents = dataWithRole.filter((m) => !m.parent);
  const childs = dataWithRole.filter((m) => m.parent);
  return parents
    .map((item) => {
      const findChild = childs.filter((m) => item.id === m.parent);
      if (findChild.length > 0) {
        if (!item.children) item.children = [];
        item.children = union(item.children, findChild);
      }

      const result: any = {
        ...item,
      };
      if (item.children && item.children.length <= 0) {
        delete item.children;
      }
      /* if (item.children) {
        const children = formatter(item.children, parentAuthority)
        result.children = children
      } */
      return result;
    })
    .filter((item) => item);
}

const memoizeOneFormatter = memoizeOne(formatter, isEqual);

/**
 * get SubMenu or Item
 */
const getSubMenu = (item: Record<string, any>) => {
  // doc: add hideChildrenInMenu
  if (
    item.children &&
    !item.hideChildrenInMenu &&
    item.children.some((child: Record<string, any>) => child.name)
  ) {
    return {
      ...item,
      children: filterMenuData(item.children), // eslint-disable-line
    };
  }
  return item;
};

/**
 * filter menuData
 */
const filterMenuData = (menuData?: Array<Record<string, any>>): any => {
  if (!menuData) {
    return [];
  }
  return menuData
    .filter((item) => item.name && !item.hideInMenu)
    .map((item) => getSubMenu(item))
    .filter((item) => item);
};
/**
 *
 * @param {Object} menuData
 */
const getBreadcrumbNameMap = (menuData: Array<Record<string, any>>) => {
  const routerMap: any = {};

  const flattenMenuData = (data: Array<Record<string, any>>) => {
    data.forEach((menuItem) => {
      if (menuItem.children) {
        flattenMenuData(menuItem.children);
      }
      // Reduce memory usage
      routerMap[menuItem.key] = menuItem;
    });
  };
  flattenMenuData(menuData);
  return routerMap;
};

const memoizeOneGetBreadcrumbNameMap = memoizeOne(
  getBreadcrumbNameMap,
  isEqual
);

const menuModel: Model = {
  namespace: 'menu',

  state: {
    menus: [],
    pages: local.get('pages') || [],
    breadcrumbNameMap: {},
  },

  effects: {
    *getMenuData({ payload }, { put, call }: EffectsCommandMap): any {
      try {
        const resMenu = yield call(menuServices.getMenu);
        let menuData = [];
        let routes = [];
        let pages = [];
        if (resMenu.status == 200) {
          routes = get(resMenu, 'data.menus', []) || [];
          pages = get(resMenu, 'data.pages', []) || [];
        }
        pages.forEach((page: any) => {
          if (!Array.isArray(page.buttons)) page.buttons = [];
          // if (page.form && page.form.schema && page.form.schema.properties) {
          //   for (var i in page.form.schema.properties) {
          //     page.form.schema.properties[i].pageId = page.id;
          //   }
          //   for (i in page.schema) {
          //     page.schema[i].pageId = page.id;
          //   }
          // }
          for (const i in page.schema) {
            page.schema[i].pageId = page.id;
          }
          return null;
        });
        // const { routes, authority } = payload;
        const menuFormatered = memoizeOneFormatter(routes, payload.role);
        menuData = filterMenuData(menuFormatered);
        const breadcrumbNameMap = memoizeOneGetBreadcrumbNameMap(routes);
        local.set('meta', JSON.stringify(resMenu?.data));
        yield put({
          type: 'save',
          payload: { menus: menuData, breadcrumbNameMap, pages },
        });
      } catch (error) {
        console.error(
          `🚀 ~ file: menu.js ~ line 111 ~ *getMenuData ~ error`,
          error
        );
      }
    },
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
  } as ReducersMapObject<any, any>,
};

export default menuModel;
