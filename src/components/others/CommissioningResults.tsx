import React from 'react';

const ExportingComponent = (props: any) => {

  return <React.Fragment>
    <div className="results">
      {
        props.activation_status !== undefined && props.activation_attempt_date !== undefined && <React.Fragment>
          <div className="result-subheader">Last Activation Attempt</div>
          <div className="entry">
            <div className="text">Time</div>
            <div className="value">{props.activation_attempt_date}</div>
          </div>
        </React.Fragment>
      }
      {
        props.details.length > 0 && <React.Fragment>
          <div className="result-subheader">{props.association} - Server Response</div>
          {
            props.details.map((row: any, index: any) => <div key={index} className="entry">
              <div className="text">{row.text}</div>
              <div className="value">{row.value}</div>
            </div>)
          }
        </React.Fragment>
      }
    </div>
  </React.Fragment>
}

export default ExportingComponent;