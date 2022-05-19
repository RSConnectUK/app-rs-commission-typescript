import React, { useState } from 'react'
import { withRouter } from 'react-router-dom';
import { IonList } from '@ionic/react';
import { AppState } from '../../utils/state'
// Components
import Card from './Components/Card';
import ScreenContainer from './Layout/ScreenContainer';

const ExportingComponent = (props: any) => {
  const { account } = AppState();
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
        <Card title="OCTO Creds" subtitle="Tap to test OCTO login">
        <div>User: {account.details.OctoUser}</div>
        <div>Pass: {account.details.OctoPass}</div>      
        </Card>
      </IonList>
    </div>
  </ScreenContainer>
}

export default withRouter(ExportingComponent);