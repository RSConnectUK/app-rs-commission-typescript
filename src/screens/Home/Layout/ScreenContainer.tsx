import React, { useState } from 'react';
import AppContainer from '../../../components/layout/container';
import { IonLoading } from '@ionic/react';
import { menu} from 'ionicons/icons';
import { IonGrid, IonRow, IonCol, IonIcon, IonButtons, IonButton } from '@ionic/react';

import Menu from '../Components/Menu';
import { createAmplitudeEvent } from '../../../utils/helpers';

const HomepageScreenContainer = (props: any) => {
  const [menuToggled, setMenuToggled] = useState(false);

  const headerProps = {
    title: 'Home Menu',
    content: <React.Fragment>
      <IonButtons slot="start">
        <IonButton style={{ height: 44, width: 44 }} onClick={() => {
          createAmplitudeEvent(`Tapped Hamburger Menu`);
          setMenuToggled(true);
        }}>
          <IonIcon color="dark" style={{ fontSize: 25 }} slot="icon-only" icon={menu} />
        </IonButton>
      </IonButtons>
      <IonButtons slot="end">
      </IonButtons>
    </React.Fragment>
  }

  return <AppContainer screen="homepage" headerProps={headerProps}>
    <IonGrid>
      <IonRow className="ion-justify-content-center">
        <IonCol size="12">
        {props.loadingLocally && <IonLoading isOpen={true} message={'Loading...'} />}
          {
            props.children
          }
          <Menu
            menuToggled={menuToggled}
            closeMenu={() => {
              if(window.location.pathname === "/") return setMenuToggled(false);
            }}
          />
        </IonCol>
      </IonRow>
    </IonGrid>
  </AppContainer>
}

export default HomepageScreenContainer;