import React from 'react';
import AppContainer from '../../../components/layout/container';
import { IonLoading, isPlatform } from '@ionic/react';
import { IonGrid, IonRow, IonCol, IonIcon, IonButtons, IonButton } from '@ionic/react';
import { arrowBackOutline, chevronBack } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';

const OctoScreenContainer = (props: any) => {
  const history = useHistory();

  const goBack = () => history.goBack();

  const headerProps = {
    title: 'OCTO Commissioning',
    content: <React.Fragment>
      <IonButtons slot="start">
        <IonButton onClick={goBack} style={{ height: 44, width: 44 }}>
          <IonIcon color="dark" style={{ fontSize: 30 }} slot="icon-only" icon={isPlatform('android') ? arrowBackOutline : chevronBack} />
        </IonButton>
      </IonButtons>
    </React.Fragment>
  }

  return <AppContainer screen="form" headerProps={headerProps}>
    <IonGrid>
      <IonRow className="ion-justify-content-center">
        <IonCol size="12">
        {props.loadingLocally && <IonLoading isOpen={true} message={'Loading...'} />}
          {
            props.children
          }
        </IonCol>
      </IonRow>
    </IonGrid>
  </AppContainer>
}

export default OctoScreenContainer