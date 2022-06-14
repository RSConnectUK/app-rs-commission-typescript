import React, { useState } from 'react'
import { withRouter } from 'react-router-dom';

// Components
import { AppState } from '../../utils/state';
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
  const [jobData, setJobData] = useState<any>({ voucher: null, imei: null, serial: null, position: null });
  const [jobValid, setJobValid] = useState<any>({ voucher: false, imei: false, serial: false, position: false });
  const [allValid, setAllValid] = useState(false);
  const [extraDetails, setExtraDetails] = useState<any>([]);
  const assoc = `OCTO`;
  const { account } = AppState();
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
      engineerId: account.engineer_id,
      sensorPosition: jobData.position,
      ...coords
    }

    setSubmitted(true);

    let ampBody = { association: assoc, voucher: bodyRequest.voucher, imei: bodyRequest.imei, serial: bodyRequest.serial, requestBody: bodyRequest };

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
      createAmplitudeEvent(`Device activated`,{...ampBody});
    } catch (err: any) {
      logError(`OCTO_ACTIVATION_FAILURE`, err, bodyRequest)
      createAmplitudeEvent(`Having Difficulties`, { ...ampBody, reason: `Failed to activate device`, failed_info: err })
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

  //update any of the values of the user form (apart from the position) into memory
  const onInputChange = (e: any) => {
    const id = e.srcElement.id;
    const val = e.detail.value;
    
    let updatedForm = { ...jobData }
    updatedForm[id] = val;
    setJobData({ ...updatedForm })

    let updatedValid = {...jobValid };
    updatedValid[id] = (val.length > 0) ? true : false
    setJobValid({...updatedValid});
    checkAllValid(updatedValid);
  }

  //update the value of the box position variable.
  const onInputPosChange = (e: any) => {
    const id = e.srcElement.id;
    let updatedForm = { ...jobData };
    updatedForm.position = e.detail.value;
    setJobData({ ...updatedForm });

    let updatedValid = {...jobValid };
    updatedValid[id] = true;
    setJobValid({...updatedValid});
    checkAllValid(updatedValid);
  }

  const checkAllValid = (updatedValid: any) => {
    let valid = true;
    Object.values(updatedValid).forEach(val => {if (val===false) valid = false })
    return valid;
  }

  const screenProps = {  
    jobData,
    updateJobData : (data: any) => setJobData(data)
  }

  const Label = (props: any) => {return <React.Fragment><IonLabel color={props.valid ? "success" : "default"} position="floating"><b>{props.children}</b></IonLabel></React.Fragment>}

  return <React.Fragment>
    <ScreenContainer  {...screenProps}>
        <IonList>
          <IonItem>
            <Label valid={jobValid.voucher}>Voucher</Label>
            <IonInput id="voucher" value={jobData.voucher} onIonChange={onInputChange}></IonInput>
          </IonItem>
          <IonItem>
            <Label valid={jobValid.imei}>IMEI</Label>
            <IonInput id="imei" value={jobData.imei} onIonChange={onInputChange}></IonInput>
          </IonItem>
          <IonItem>
            <Label valid={jobValid.serial}>Serial</Label>
            <IonInput id="serial" value={jobData.serial} onIonChange={onInputChange}></IonInput>
          </IonItem>
          <IonItem>
            <Label valid={jobValid.position}>Position</Label>
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