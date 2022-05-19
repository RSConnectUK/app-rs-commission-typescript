import React from 'react';
import ReactDOM from 'react-dom';
import State from './utils/state';
import Router from './utils/router';
import ErrorBoundary from './components/layout/error_boundary';

import './utils/css';

export const App = (props: any) => {

  return <React.Fragment>
    <ErrorBoundary>
      <State>
        <Router />
      </State>
    </ErrorBoundary>
  </React.Fragment>

}

ReactDOM.render(<App />, document.getElementById('root'));
