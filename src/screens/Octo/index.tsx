import React, { useState } from 'react'
import { withRouter } from 'react-router-dom';
import { AppState } from '../../utils/state';

// Components

import ScreenContainer from './Layout/ScreenContainer';
import { IonList, IonItem, IonInput, IonLabel, IonSelect, IonSelectOption, IonButton } from '@ionic/react';
import ScreenModal from '../../components/others/ScreenModal';
import ComResults from '../../components/others/CommissioningResults';
import { createAmplitudeEvent, getUserLocation, logError, showAlert } from '../../utils/helpers';
import Axios from 'axios';
import moment from 'moment';

const ExportingComponent = (props: any) => {
  const { account } = AppState();
  // eslint-disable-next-line
  const [opened, setOpened] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [activationStatus, SetActivationStatus] = useState<string>();
  const [activationDate, SetActivationDate] = useState<string>();
  const [data, setData] = useState<any>({ voucher: null, imei: null, serial: null, position: null });
  const [extraDetails, setExtraDetails] = useState<any>([]);

  const install_locations = [`Dash, Passenger Side`, `Dash, Centre`, `Dash, Driver Side`, `Centre Console Front`, `Centre Console Rear`, `Boot, Passenger Side`, `Boot, Centre`, `Boot, Driver Side`, `Engine Bay`];

  const closeModal = () => {
    setOpened(false);
  }

  const getDetailsUpdated = (res: any) => {
    const rows: any = [];

    Object.keys(res).forEach((key: any) => {
      rows.push({
        text: key,
        value: JSON.stringify(res[key])
      })
    })
    setExtraDetails(rows);
  }

  const submit = async () => {

    if (navigator.onLine === false) {
      showAlert({
        header: 'Oops.',
        message: `It seems you're offline right now. You need internet to do this.`
      });
      return false;
    }

    let coords: any = { latitude: 0, longitude: 0 }

    try {
      const res: any = await getUserLocation();
      coords = {
        latitude: res.latitude,
        longitude: res.longitude
      }
    } catch (err: any) {
      showAlert({ header: `Permission denied`, message: err.toString()});
      //logError(`GET_USER_LOCATION`, err)
      //createAmplitudeEvent(`Having Difficulties`, { reason: `The user refused to give us permission to his device location.`, failed_info: err })
      return false;
    }

    let bodyRequest = {
      voucher: data.voucher,
      imei: data.imei,
      serial: data.serial,
      engineerId: account.engineer_id,
      sensorPosition: data.position,
      ...coords
    }

    setSubmitted(true);

    try {
      createAmplitudeEvent(`Tapped Activate Device`)
      const { data } = await Axios(`https://pfacwtzotj.execute-api.eu-west-2.amazonaws.com/live/commission`, {
        method: `POST`,
        headers: {
          'x-api-key': 'ChO0RgyV2x2PtPb3cHcPP7lfqd6JOTvL6XFZsKfd'
        },
        data: bodyRequest
      })
      logError(`OCTO_ACTIVATION_SUCCESS`, {}, { response_received: data, body_sent: bodyRequest })
      SetActivationStatus("Success")
      SetActivationDate(moment(new Date()).format(`HH:mm:ss`));
      setExtraDetails(data.message ? [{ text: `Message`, value: data.message }] : []);
      createAmplitudeEvent(`Device activated`);
    } catch (err: any) {
      logError(`OCTO_ACTIVATION_FAILURE`, err, bodyRequest)
      createAmplitudeEvent(`Having Difficulties`, { reason: `Failed to activate device`, failed_info: err })
      SetActivationStatus("Failure")
      SetActivationDate(moment(new Date()).format(`HH:mm:ss`));
      if (err.response && err.response.data && err.response.data.title !== undefined) {
        getDetailsUpdated(err.response.data);
      } else {
        setExtraDetails([
          {
            text: `Message`,
            value: err.message && !err.message.includes(`Network Error`) ? err.message : `Failed to reach the server`
          }
        ])
      }
    }
    setSubmitted(false);
  }
  const getActivationStatus = () => {
    const status = activationStatus;
    if (submitted) return `Loading..`;
    if (!status || submitted) return `Awaiting`;
    return status === "Success" ? "Success" : "Failed"
  }

  const onInputChange = (e: any) => {
    const id = e.srcElement.id;
    let updatedForm = { ...data }
    updatedForm[id] = e.detail.value;
    setData({ ...updatedForm })
  }

  const onInputPosChange = (e: any) => {
    let updatedForm = { ...data }
    updatedForm.position = e.detail.value;
    setData({ ...updatedForm })
  }

  return <React.Fragment>
    <ScreenContainer>
        <IonList>
          <IonItem>
            <IonLabel position="floating">Voucher</IonLabel>
            <IonInput id="voucher" value={data.voucher} onIonChange={onInputChange}></IonInput>
          </IonItem>
          <IonItem>
            <IonLabel position="floating">IMEI</IonLabel>
            <IonInput id="imei" value={data.imei} onIonChange={onInputChange}></IonInput>
          </IonItem>
          <IonItem>
            <IonLabel position="floating">Serial</IonLabel>
            <IonInput id="serial" value={data.serial} onIonChange={onInputChange}></IonInput>
          </IonItem>
          <IonItem>
            <IonLabel position="floating">Position</IonLabel>
            <IonSelect id="position" onIonChange={onInputPosChange}>
              {
                Object.entries(install_locations).map((location: any) =>
                <IonSelectOption>{location[1]}</IonSelectOption>)
              }
            </IonSelect>
          </IonItem>
          <IonButton expand='block' onClick={() => setOpened(true)}>Commission</IonButton>
        </IonList>
    </ScreenContainer>
    {
      opened === true && <ScreenModal title={`OCTO Commissioning`} disabledClose={submitted} onClose={closeModal} className="commission-modal">
        <div className="box">
          <div className="status">Activation status: <span className={getActivationStatus().toString().toLowerCase()}>{getActivationStatus()}</span></div>
          {
            activationStatus !== undefined ?
              <ComResults activation_status={activationStatus} activation_attempt_date={activationDate} association="OCTO" details={extraDetails} /> :
              <div className="hint-start">Tap 'Activate Device' to continue</div>
          }
          <IonButton className="cta-button" disabled={submitted} onClick={submit}>{submitted ? `Awaiting results..` : `Activate Device`}</IonButton>
          <div className="support-information">
            <span>If this does not work, please phone <a href="tel:01213321230">0121 332 1230</a>. </span>
            <span>You should be as close to the box as is possible.</span>
          </div>
        </div>

      </ScreenModal>
    }
  </React.Fragment>
}

export default withRouter(ExportingComponent);