import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import { StompSessionProvider } from "react-stomp-hooks";
import { useTypedSelector } from "../hooks/useTypedSelector";
import { privateRoutes, publicRoutes, RouteNames } from "../router/index";

const AppRouter = () => {
  const { username } = useTypedSelector((state) => state.authReducer);

  return (
     <StompSessionProvider url={process.env.REACT_APP_WS_URL!!} onWebSocketError = {()=>console.error('websocket error')} onConnect = {()=>console.info('connected')}>
    {
    
      <Switch>
        {/* <Route
                exact
                path="/"
                render={() => {
                    return (
                      <Redirect to="/games/" /> 
                    )
                }}
              /> */}
        {privateRoutes.map((route) => (
          <Route {...route} key={route.path} />
        ))}
         <Redirect to={'/games/'}  /> 
      </Switch>
    }
     </StompSessionProvider>
  );
};

export default AppRouter;
