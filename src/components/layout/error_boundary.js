import React from 'react';

function replaceErrors(key, value) {
  if (value instanceof Error) {
      var error = {};

      Object.getOwnPropertyNames(value).forEach(function (key) {
          error[key] = value[key];
      });

      return error;
  }

  return value;
}


class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    // console.log(error);
    return { hasError: true, message: JSON.stringify(error, replaceErrors) };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    // logErrorToMyService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <React.Fragment>
				<div style={{ padding: 16 }}>
          <h1>Oops.</h1>
          <p>We've got an error while trying to run the app.</p>
          <hr className="divider-hr" style={{ marginTop: 16, marginBottom: 16 }} />
          <code>
            { JSON.stringify(this.state, null, 4)}
          </code>
        </div>
			</React.Fragment>
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;