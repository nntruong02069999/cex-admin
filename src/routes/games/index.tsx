import React from 'react';
import { router } from 'dva';
import K3 from './K3';

const { Route, Switch, Redirect } = router;

const Games = ({ match }: { match: any }) => {
  console.log('Games component rendered, match:', match);
  
  return (
    <Switch>
      <Redirect exact from={`${match.url}`} to={`${match.url}/k3`} />
      <Route path={`${match.url}/k3`} component={K3} />
    </Switch>
  );
};

export default Games; 