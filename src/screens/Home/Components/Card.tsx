import { IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle } from '@ionic/react';
import React from 'react';

const ExportingComponent = (props: any) => {
    return <React.Fragment>
    <IonCard className="ion-no-padding" color="light" onClick={props.submit}>
    <IonCardHeader>
      <IonCardTitle>{props.title}</IonCardTitle>
      <IonCardSubtitle>{props.subtitle}</IonCardSubtitle>
    </IonCardHeader>
    <IonCardContent>
        {
            props.children
        }
    </IonCardContent>
  </IonCard>
  </React.Fragment>
}

export default ExportingComponent;