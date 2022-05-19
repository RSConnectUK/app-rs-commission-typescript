import React, { useState } from 'react'
import { withRouter } from 'react-router-dom';
import { IonList } from '@ionic/react';


// Components
import Card from './Components/Card';
import ScreenContainer from './Layout/ScreenContainer';

const ExportingComponent = (props: any) => {
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [screenMounted, setScreenMounted] = useState(true);
  // eslint-disable-next-line
  const [inBackground, setInBackground] = useState(false);

  const screenProps = {
    screenMounted,
    submitted,
    loadingLocally: loading,
  };

  return <ScreenContainer {...screenProps}>
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <IonList className="list-contacts" lines="none">
        <Card title="OCTO Commissioning" subtitle="Click to Commission an OCTO Unit" submit={() => props.history.push("/octo")}/>
      </IonList>
    </div>
  </ScreenContainer>
}

export default withRouter(ExportingComponent);