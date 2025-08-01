import React from 'react';
// import asyncComponent from "@src/util/asyncComponent";
import Dashboard from './dashboard';
import { router } from 'dva';
/* PLOP_INJECT_IMPORT */

const { Route, Switch } = router;
const Main = ({ match }) => (
  <Switch>
    <Route path={`${match.url}/dashboard`} component={Dashboard} />
  </Switch>
);

export default Main;
