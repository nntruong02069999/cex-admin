import { routerRedux, router } from 'dva';
import { AppContext } from './index';

import App from './containers/App/index';

const { Router, Route, Switch } = router;
const { ConnectedRouter } = routerRedux;

export default ({ history }: { history: any; app?: any }) => {
  return (
    <>
      <ConnectedRouter history={history} context={AppContext}>
        <Router history={history}>
          <Switch>
            <Route path='/' render={(props) => <App {...props} />} />
          </Switch>
        </Router>
      </ConnectedRouter>
    </>
  );
};
