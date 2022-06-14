import React, { useState } from 'react'
import { withRouter } from 'react-router-dom';
import { IonList } from '@ionic/react';


// Components
import Card from './Components/Card';
import ScreenContainer from './Layout/ScreenContainer';
import { AppState } from '../../utils/state';

const ExportingComponent = (props: any) => {
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [screenMounted, setScreenMounted] = useState(true);
  // eslint-disable-next-line
  const [inBackground, setInBackground] = useState(false);


  const { account } = AppState();
  const screenProps = {
    screenMounted,
    submitted,
    loadingLocally: loading,
  };

  return <ScreenContainer {...screenProps}>
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <IonList className="list-contacts" lines="none">
        <Card title="OCTO Commissioning" submit={() => props.history.push(`/octo`)}>
          <div>User: {account.details.OctoUser}</div>
          <div>Pass: {account.details.OctoPass}</div>
        </Card>
        <Card title="T2 Commissioning" submit={() => props.history.push(`/t2`)}/>
        <Card title="Trak Commissioning" submit={() => props.history.push(`/trak`)}/>
      </IonList>
    </div>
  </ScreenContainer>
}

export default withRouter(ExportingComponent);