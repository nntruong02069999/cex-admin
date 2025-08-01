import React from "react";
import { router } from "dva";
import asyncComponent from "@src/util/asyncComponent";

const { Redirect, Route, Switch } = router;
const ErrorPages = ({ match }) => (
  <Switch>
    <Redirect exact from={`${match.url}/`} to={`${match.url}/error-404`} />
    <Route path={`${match.url}/error-404`} component={asyncComponent(() => import('./404'))} />
    <Route path={`${match.url}/error-500`} component={asyncComponent(() => import('./500'))} />
  </Switch>
);

export default ErrorPages;
