import React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from "react-router-dom";
import { AppState } from '../utils/state';

import Home from '../screens/Home/index';
import Authenticate from '../screens/Authenticate/index';
import Profile from '../screens/Profile';
import Octo from '../screens/Octo';
import T2 from '../screens/T2';
import Trak from '../screens/Trak';

const Private = ({ acc, ...props }: any) => acc !== null ? <Route {...props} /> : <Redirect to="/screens/authentication" />;
const Guest = ({ acc, ...props }: any) => acc === null ? <Route {...props} /> : <Redirect to="/" />;

const ExportingComponent = () => {
  const { account } = AppState();

  return <React.Fragment>
    <Router>
      <Switch>
        <Guest acc={account} exact path="/screens/authentication" component={Authenticate} />
        <Private acc={account} exact path="/" component={Home} />
        <Private acc={account} exact path="/profile" component={Profile} />
        <Private acc={account} exact path="/octo" component={Octo} />
        <Private acc={account} exact path="/t2" component={T2} />
        <Private acc={account} exact path="/trak" component={Trak} />
      </Switch>
    </Router>
  </React.Fragment>
}

export default ExportingComponent;
