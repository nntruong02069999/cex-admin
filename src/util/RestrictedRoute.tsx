import { router } from "dva";

const { Redirect, Route } = router;
const RestrictedRoute = ({ component: Component, authUser, ...rest } : {
  component?: any
  authUser?: any
  [x: string]: any
}) =>
  <Route
    {...rest}
    render={props =>
      authUser
        ? <Component {...props} />
        : <Redirect
          to={{
            pathname: '/signin',
            state: { from: props.location }
          }}
        />}
  />;

export default RestrictedRoute;
