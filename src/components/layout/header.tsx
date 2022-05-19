import React from 'react';
import { IonHeader,IonToolbar,IonTitle, isPlatform } from '@ionic/react'

export interface HeaderInterface {
  title?: string,
  content?: any,
  removeTitle?: boolean
}

const ExportingComponent = (props: HeaderInterface) => {
  return <React.Fragment>
    <IonHeader translucent={isPlatform(`ios`) ? true : false}>
      <IonToolbar className="app-toolbar">
        { props.content && props.content }
        { props.removeTitle !== true && <IonTitle>{ props.title }</IonTitle> }
      </IonToolbar>
    </IonHeader>
  </React.Fragment>
}

export default ExportingComponent;