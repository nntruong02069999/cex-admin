import asyncComponent from '@src/util/asyncComponent'
export const routes = [
  // { path: '/', exact: true, name: 'Home' },
  // { path: '/dashboard', name: 'Dashboard', component: React.lazy(() => import('@src/routers/')) },
  {
    path: '/customer',
    name: 'Quản lý người dùng',
    component: asyncComponent(() => import('./routes/customer/index')),
  },
  {
    path: '/pageEditor',
    name: 'Quản lý trang',
    component: asyncComponent(
      () => import('./routes/default/pageManager/PageEditor')
    ),
  },
  {
    path: '/form',
    name: 'Trang',
    component: asyncComponent(() => import('./routes/default/form/FormViewer')),
  },
  {
    path: '/list',
    name: 'Trang',
    component: asyncComponent(() => import('./routes/default/list/ListViewer')),
  },
  // K3 game route has been moved to routes/index.tsx and routes/games/index.tsx

  /* PLOP_INJECT_LIST */

  /* PLOP_INJECT_CRUD */
]
