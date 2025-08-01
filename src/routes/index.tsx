import React, { useEffect } from "react";
import { router } from "dva";
// import asyncComponent from '@src/util/asyncComponent'
import Main from "./main/index";
// import { routes } from '@src/routes'
import ListViewer from "./default/list/ListViewer";
import PageEditor from "./default/pageManager/PageEditor";
import FormViewer from "./default/form/FormViewer";
import WingoGame from "./game/wingo";
import TrxWingoGame from "./game/trxwingo";
import HomeIndex from "./home";
import FiveDGame from "./game/5d";
import Games from "./games";
import K3Game from "@src/components/games/K3Game";
import CustomerPage from "./customer";
import CommissionRate from "@src/components/ComissionRate";
import InvitationReward from "@src/components/InvitationReward";
import ManageRewardWheelSpin from "@src/components/WheelSpin/ManageRewardWheelSpin";
import Deposit from "@src/components/Deposit";
import Withdraw from "@src/components/Withdraw";
// import DashboardListing from './main/dashboard/Listing';
/* PLOP_INJECT_IMPORT */

interface AppProps {
  match: any;
}

const { Route, Switch } = router;
const App: React.FC<AppProps> = ({ match }) => {
  useEffect(() => {
    console.log("App routes/index.tsx rendered with match:", match);
  }, [match]);

  return (
    <div className="gx-main-content-wrapper">
      <Switch>
        {/* <Route
          path={`/dashboard`}
          component={asyncComponent(() => import('./home'))}
        /> */}
        <Route path={`/dashboard`} component={HomeIndex} />
        <Route path={`/customer/:customerId`} component={CustomerPage} />
        <Route path="/game/wingo" component={WingoGame} />
        <Route path="/game/5d" component={FiveDGame} />
        <Route path="/game/trxwingo" component={TrxWingoGame} />
        <Route path="/game/k3" component={K3Game} />
        <Route path="/agency/commission-rate" component={CommissionRate} />
        <Route path="/agency/invitation-reward" component={InvitationReward} />
        <Route path="/deposit/manage" component={Deposit} />
        <Route path="/withdraw/manage" component={Withdraw} />
        <Route path={`${match.url}main`} component={Main} />
        <Route path={`${match.url}game`} component={Games} />
        <Route
          path={`/wheel-spin/manage-reward`}
          component={ManageRewardWheelSpin}
        />
        {/* templates */}
        <Route
          path={`/pageEditor`}
          // component={asyncComponent(() => import('./default/pageManager/PageEditor'))}
          component={PageEditor}
        />
        <Route
          path={`/form`}
          // component={asyncComponent(() => import('./default/form/FormViewer'))}
          component={FormViewer}
        />
        <Route
          path={`/list`}
          // component={asyncComponent(() => import('./default/list/ListViewer'))}
          component={ListViewer}
        />
        {/* {routes.map((route: any, idx: number) => {
          return route.component ? (
            <Route
              key={idx}
              path={route.path}
              exact={route.exact}
              render={(props) => <route.component {...props} />}
            />
          ) : null
        })} */}
        {/* PLOP_INJECT_EXPORT */}
      </Switch>
    </div>
  );
};

export default App;
