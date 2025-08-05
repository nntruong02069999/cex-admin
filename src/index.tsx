import React from 'react';
import ReactDOM from 'react-dom';
import dva, { DvaInstance } from 'dva';
import createLoading from 'dva-loading';
import reportWebVitals from './reportWebVitals';

import '@src/assets/vendors/style';
import '@src/styles/weland.less';
// model
import modelGlobal from './models/global';
import modelCommon from './models/common';
import modelSetting from './models/settings';
import modelModal from './models/modal';
import modelMenu from './models/menu';
import modelAuth from './models/auth';
import modelRole from './models/role';
import modelUser from './models/user';
import houseWalletModel from './models/houseWallet';
/* PLOP_INJECT_IMPORT */
import chatUser from './models/chat';
require('@src/packages/pro-icon/iconify/components/bundle');

interface CustomDvaIntance extends DvaInstance {
  _store?: any;
}

const app: CustomDvaIntance = dva({});

app.use(createLoading('loading'));

app.model(modelGlobal);
app.model(modelCommon);
app.model(modelSetting);
app.model(modelModal);
app.model(modelMenu);
app.model(modelAuth);
app.model(modelRole);
app.model(modelUser);
app.model(houseWalletModel);
/* PLOP_INJECT_EXPORT */
app.model(chatUser);

app.router(require('./NextApp').default);
// app.start('#root');
const App = app.start();
window._store = app?._store;

export const AppContext = React.createContext<
  | {
      value: {
        store?: any;
      };
    }
  | any
>(null);

ReactDOM.render(
  <AppContext.Provider value={{ store: app?._store }}>
    <App />
  </AppContext.Provider>,
  document.getElementById('root')
);

export default app;

reportWebVitals();
