import React, { useState } from 'react'
import AppContainer from '../../components/layout/container';
import { IonGrid, IonRow, IonCol } from '@ionic/react';
import { createAmplitudeEvent, logError, showAlert, makeConnectedAPIRequest } from '../../utils/helpers';
import { AppState } from '../../utils/state';
import FormsComponent from './Components/Forms';
import { withRouter } from 'react-router-dom';

const AuthComponent = (props: any) => {
  const [form, setForm] = useState({ username: null, password: null });
  const [submitted, setSubmitted] = useState(false);
  const { setAccount } = AppState();

  const submit = async () => {
    setSubmitted(true);
    try {
      const data: any = await makeConnectedAPIRequest(`login?user=${form.username}&pass=${form.password}`, `GET`);
      if (data.includes(`RS Front Log in failed`)) throw new Error("Login failed");

      let details: any = {
        name: `RS Connect`,
        telephone: `01675-624-000`,
        email: `enquiries@rsconnect.com`
      }

      try {
        const d = await makeConnectedAPIRequest(`engineers/${form.password}`, `GET`);
        details = {
          name: d.engineerName || details.name,
          email: d.email ? d.email.split(";")[0] : details.email,
          telephone: d.telephone && d.telephone.length > 3 ? d.telephone : details.telephone,
          OctoUser: d.rsOctoUsername,
          OctoPass: d.rsOctoPassword
        }
      } catch(err) {
        logError(`MISSING_ENGINEER_DETAILS_WEDNESDAY`, err);
        // logz io error and send a warning to IT Department.
      }

      const accountObject = {
        username: form.username,
        engineer_id: form.password,
        authentication_date: new Date(),
        details
      }
      setSubmitted(false);
      await localStorage.setItem(`account`, JSON.stringify(accountObject))
      createAmplitudeEvent('Logged in');
      setAccount(accountObject);
    } catch (err: any) {
      setSubmitted(false);
      const err_msg = err.message && err.message.includes(`Login failed`) ? `Username or password is wrong. Please check and try again.` : `Something went wrong, please try again later.`;

      showAlert({
        header: 'Authentication failed',
        message: err_msg
      });

      if (err.message && !err.message.includes(`Login failed`)) {
        createAmplitudeEvent(`Having Difficulties`, { reason: `Login endpoint failure` })
        logError(`SIGN_IN`, err)
      }
    }
  }

  return <AppContainer screen="login" headerProps={null}>
    <IonGrid>
      <IonRow className="ion-justify-content-center" >
        <IonCol size="11" sizeLg="10" sizeXl="5">
          <div className="rs-connect-logo" />
          <FormsComponent
            onFormSubmitted={submit}
            data={form}
            setData={setForm}
            submitted={submitted}
          />
        </IonCol>
      </IonRow>
    </IonGrid>
  </AppContainer>
}

export default withRouter(AuthComponent);