import React, { useState } from 'react'
import { withRouter } from 'react-router-dom';

// Components

import ScreenContainer from './Layout/ScreenContainer';
import { IonList, IonItem, IonInput, IonLabel, IonSelect, IonSelectOption, IonButton } from '@ionic/react';
import ScreenModal from '../../components/others/ScreenModal';
import ComResults from '../../components/others/CommissioningResults';
import { createAmplitudeEvent, getUserLocation, logError, showAlert } from '../../utils/helpers';
import Axios from 'axios';
import moment from 'moment';

const ExportingComponent = (props: any) => {
  // eslint-disable-next-line
  const [opened, setOpened] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [activationStatus, SetActivationStatus] = useState<string>();
  const [activationDate, SetActivationDate] = useState<string>();
  const [jobData, setJobData] = useState<any>({ voucher: null, imei: null, serial: null, reg: null, position: null });
  const [extraDetails, setExtraDetails] = useState<any>([]);
  const assoc = `T2`;
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
      logError(`GET_USER_LOCATION`, err)
      createAmplitudeEvent(`Having Difficulties`, { reason: `The user refused to give us permission to his device location.`, failed_info: err })
      return false;
    }

    let bodyRequest = {
      voucher: jobData.voucher,
      imei: jobData.imei,
      serial: jobData.serial,
      reg: jobData.reg,
      sensorPosition: jobData.position,
      ...coords
    }

    setSubmitted(true);

    let ampBody = {association: assoc, voucher: jobData.voucher, imei: jobData.imei, serial: jobData.serial, car_reg: jobData.reg, requestBody: JSON.stringify(bodyRequest)};

    try {
      createAmplitudeEvent(`Tapped Activate Device`,{...ampBody});
      const { data } = await Axios(`https://6chkcoll6c.execute-api.eu-west-2.amazonaws.com/live/commission/ttwo`, {
        method: `POST`,
        headers: {
          'x-api-key': 'ChO0RgyV2x2PtPb3cHcPP7lfqd6JOTvL6XFZsKfd'
        },
        data: bodyRequest
      })
      logError(`T2_ACTIVATION_SUCCESS`, {}, { response_received: data, body_sent: bodyRequest })
      SetActivationStatus("Success")
      SetActivationDate(moment(new Date()).format(`HH:mm:ss`));
      setExtraDetails(data.message ? [{ text: `Message`, value: data.message }] : []);
      createAmplitudeEvent(`Device activated`,{...ampBody});
    } catch (err: any) {
      logError(`T2_ACTIVATION_FAILURE`, err, bodyRequest)
      createAmplitudeEvent(`Having Difficulties`, {...ampBody, reason: `Failed to activate device`, failed_info: err })
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

  const checkBox = async () => {
    setSubmitted(true);
    try {
      createAmplitudeEvent(`Tapped Check Box`)
      const { data } = await Axios(`https://6chkcoll6c.execute-api.eu-west-2.amazonaws.com/live/commission/ttwo/check/${jobData.imei}}`, {
        method: `GET`,
        headers: {
          'x-api-key': 'ChO0RgyV2x2PtPb3cHcPP7lfqd6JOTvL6XFZsKfd'
        }
      })
      logError(`CHECK_BOX_T2_SUCCESS`, {}, { response_received: data, body_sent: { imei: data.imei } })
      createAmplitudeEvent(`Check Successful`)
      getDetailsUpdated(data);
    } catch (err) {
      logError(`CHECK_BOX_T2_ERROR`, err);
      createAmplitudeEvent(`Having Difficulties`, { reason: `Failed to check box`, failed_info: err });
      showAlert({
        header: `Failure`,
        message: `Failed to check box due to an unknown server error. Please try again or contact our support team.`
      })
    }
    setSubmitted(false);
  }

  const getActivationStatus = () => {
    const status = activationStatus;
    if (submitted) return `Loading..`;
    if (!status || submitted) return `Awaiting`;
    return status === "Success" ? "Success" : "Failed"
  }

  //update any of the values of the user form (apart from the postition) into memory
  const onInputChange = (e: any) => {
    const id = e.srcElement.id;
    let updatedForm = { ...jobData }
    updatedForm[id] = e.detail.value;
    setJobData({ ...updatedForm })
  }

  //update the value of the box position variable.
  const onInputPosChange = (e: any) => {
    let updatedForm = { ...jobData }
    updatedForm.position = e.detail.value;
    setJobData({ ...updatedForm })
  }

  const screenProps = {  
    jobData,
    updateJobData : (data: any) => setJobData(data)
  }

  return <React.Fragment>
  
    <ScreenContainer {...screenProps}>
        <IonList>
          <IonItem>
            <IonLabel position="floating">Voucher</IonLabel>
            <IonInput id="voucher" value={jobData.voucher} onIonChange={onInputChange}></IonInput>
          </IonItem>
          <IonItem>
            <IonLabel position="floating">IMEI</IonLabel>
            <IonInput id="imei" value={jobData.imei} onIonChange={onInputChange}></IonInput>
          </IonItem>
          <IonItem>
            <IonLabel position="floating">Serial</IonLabel>
            <IonInput id="serial" value={jobData.serial} onIonChange={onInputChange}></IonInput>
          </IonItem>
          <IonItem>
            <IonLabel position="floating">Car Reg</IonLabel>
            <IonInput id="reg" value={jobData.reg} onIonChange={onInputChange}></IonInput>
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
      opened === true && <ScreenModal title={`T2 Commissioning`} disabledClose={submitted} onClose={closeModal} className="commission-modal">
        <div className="box">
          <div className="status">Activation status: <span className={getActivationStatus().toString().toLowerCase()}>{getActivationStatus()}</span></div>
          {
            activationStatus !== undefined ?
              <ComResults activation_status={activationStatus} activation_attempt_date={activationDate} association="T2" details={extraDetails} /> :
              <div className="hint-start">Tap 'Activate Device' to continue</div>
          }
          <IonButton className="cta-button" disabled={submitted} onClick={submit}>{submitted ? `Awaiting results..` : `Activate Device`}</IonButton>
          <IonButton className="cta-button" disabled={submitted} onClick={checkBox}>Check Box</IonButton>
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