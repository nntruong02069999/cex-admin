import React from "react";
import { router } from 'dva';
import asyncComponent from "util/asyncComponent";
/* PLOP_INJECT_IMPORT */


const { Route, Switch } = router;
const Account = ({ match }) => {
  return (
    <Switch>
      {/* PLOP_INJECT_EXPORT */}
      <Route path={`${match.url}/userinfo`} component={asyncComponent(() => import('./BaseView'))} exact={true} />
      <Route path={`${match.url}/security`} component={asyncComponent(() => import('./SecurityView'))} exact={true} />
    </Switch>
  );
};

export default Account;
