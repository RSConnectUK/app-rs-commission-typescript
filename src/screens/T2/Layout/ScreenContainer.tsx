import React, { useState } from 'react';
import AppContainer from '../../../components/layout/container';
import { IonActionSheet, IonLoading, isPlatform } from '@ionic/react';
import { IonGrid, IonRow, IonCol, IonIcon, IonButtons, IonButton } from '@ionic/react';
import { downloadOutline, arrowBackOutline, chevronBack } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { getAssociated, showAlert } from '../../../utils/helpers';

const T2ScreenContainer = (props: any) => {
  const [menuOpened, setMenuOpened] = useState(false);
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState([])

  const history = useHistory();

  const goBack = () => {
    showAlert({
      header:`Confirm`,
      message: `Leaving this page will clear the form`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Confirm',
          handler: () => {history.goBack()}
        }
      ]
    })
  }

  const loadJobs = async () => {
    setLoading(true);
    const data = await getAssociated(`T2`);
    setJobs(data);
    setLoading(false);
    setMenuOpened(true);
  }

  const headerProps = {
    title: 'T2 Commissioning',
    content: <React.Fragment>
      <IonButtons slot="start">
        <IonButton onClick={goBack} style={{ height: 44, width: 44 }}>
          <IonIcon color="dark" style={{ fontSize: 30 }} slot="icon-only" icon={isPlatform('android') ? arrowBackOutline : chevronBack} />
        </IonButton>
      </IonButtons>
      <IonButtons slot="end" onClick={loadJobs}>
        Autofill
        <IonButton>
          <IonIcon color="dark" style={{ fontSize: 26 }} slot="icon-only" icon={downloadOutline}/>
        </IonButton>
      </IonButtons>
    </React.Fragment>
  }

  const getButtons = () => {
    let buttons: any = [
      { text: 'Cancel', role: 'cancel', handler: () => setMenuOpened(false) }
    ]
    Object.entries(jobs).map((job: any) => buttons.push({text: job[1].reg, handler: () => {
      let updatedForm = { ...props.jobData }
      updatedForm.voucher = job[1].voucher_num;
      updatedForm.reg = job[1].reg;
      props.updateJobData({...updatedForm});
      setMenuOpened(false);
    }}));
    return buttons;
  }

  return <React.Fragment>
    <AppContainer screen="form" headerProps={headerProps}>
      <IonGrid>
        <IonRow className="ion-justify-content-center">
          <IonCol size="12">
          {loading && <IonLoading isOpen={true} message={'Loading Autofill...'} />}
            {
              props.children
            }
          </IonCol>
        </IonRow>
      </IonGrid>
    </AppContainer>
    <IonActionSheet
      header={`Autofill from jobs`}
      isOpen={menuOpened}
      onDidDismiss={() => setMenuOpened(false)}
      buttons={getButtons()}
    />
  </React.Fragment>
}

export default T2ScreenContainer