import React, { useEffect, useRef } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import HeaderComponent from './header';
import { HeaderInterface } from './header';

interface ContainerInterface {
  headerProps: null | HeaderInterface,
  screen: string,
  children: any
}

declare global {
  interface Window {
    ionicScrollElement: any
  }
}


const ExportingComponent = (props: ContainerInterface) => {
  const contentEle = useRef<HTMLIonContentElement>(null);

  useEffect(() => {
    const exec = async () => {
      window.ionicScrollElement = contentEle.current;
    }
    exec();
  });

  return <React.Fragment>
    <IonPage id={`${props.screen}`} className={`screen-${props.screen}`}>
      { props.headerProps !== null && <HeaderComponent {...props.headerProps} /> }
      <IonContent fullscreen ref={contentEle}>
        {
          props.children
        }
      </IonContent>
    </IonPage>
  </React.Fragment>
}

export default ExportingComponent;