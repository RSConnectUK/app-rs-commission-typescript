import React, { useState } from 'react'
import { withRouter } from 'react-router-dom';

// Components
import { AppState } from '../../utils/state';
import ScreenContainer from './Layout/ScreenContainer';
import { IonList, IonItem, IonInput, IonLabel, IonSelect, IonSelectOption, IonButton } from '@ionic/react';
import ScreenModal from '../../components/others/ScreenModal';
import ComResults from '../../components/others/CommissioningResults';
import { createAmplitudeEvent, logError, makeConnectedAPIRequest, showAlert } from '../../utils/helpers';
import moment from 'moment';
import DeviceOrientations from '../../components/others/DeviceOrientations';
import ValidationCellStatus from '../../components/others/ValidationCellStatus';

const ExportingComponent = (props: any) => {
  // eslint-disable-next-line
  const [opened, setOpened] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [activationStatus, SetActivationStatus] = useState<string>();
  const [activationDate, SetActivationDate] = useState<string>();
  const [jobData, setJobData] = useState<any>({ voucher: null, sim: null, car_reg: null, colour: null, car_make: null, car_model: null, vin: null, car_mileage: null, install_index: null, alpha: null, beta: null, gamma: null });
  const [extraDetails, setExtraDetails] = useState<any>([]);

  const { account } = AppState();
  const install_locations = [`Dash, Passenger Side`, `Dash, Centre`, `Dash, Driver Side`, `Centre Console Front`, `Centre Console Rear`, `Boot, Passenger Side`, `Boot, Centre`, `Boot, Driver Side`, `Engine Bay`];

  const healthChecks = [
    {
      "code": "secured_to_specification",
      "label": "Unit is secured to specification"
    },
    {
      "code": "leds_illuminated",
      "label": "LEDs on unit are illuminated"
    },
    {
      "code": "details_double_checked",
      "label": "Double check SIM, VIN and VRN are correct"
    }
  ]

  const colours = [
    "Aluminium or Silver",
    "Beige",
    "Black",
    "Blue",
    "Brown",
    "Gold",
    "Green",
    "Grey",
    "Orange",
    "Pink",
    "Purple",
    "Red",
    "White",
    "Yellow"
  ]

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

    let bodyRequest = {
      voucher_num: jobData.voucher,
      sim_number: jobData.sim,
      car_reg: jobData.reg,
      colour: jobData.colour,
      car_make: jobData.car_make,
      car_model: jobData.car_model,
      vin: jobData.vin,
      car_mileage: parseInt(jobData.car_mileage),
      engineer_id: parseInt(account.engineer_id),
      install_index: parseInt(jobData.install_index),
      date_time: moment().format(`YYYY-MM-DDTHH:mm:ss`),
      alpha: parseFloat(jobData.alpha),
      beta: parseFloat(jobData.beta),
      gamma: parseFloat(jobData.gamma)
    }

    setSubmitted(true);

    try {
      createAmplitudeEvent(`Tapped Activate Device`)
      const data = await makeConnectedAPIRequest(`trak/associate`, `POST`, bodyRequest);
      logError(`TRAK_ACTIVATION_SUCCESS`, {}, { response_received: data, body_sent: bodyRequest })
      SetActivationStatus("Success")
      SetActivationDate(moment(new Date()).format(`HH:mm:ss`));
      setExtraDetails(data.message ? [{ text: `Message`, value: data.message }] : []);
      createAmplitudeEvent(`Device activated`);
    } catch (err: any) {
      logError(`TRAK_ACTIVATION_FAILURE`, err, bodyRequest)
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

  const checkBox = async () => {
    setSubmitted(true);
    try {
      const bodyRequest = {
        voucher_num: jobData.voucher,
        sim_number: jobData.sim,
        vin: jobData.vin
      }
      createAmplitudeEvent(`Tapped Check Box`)
      const data = await makeConnectedAPIRequest(`trak/check_sim`, `POST`, bodyRequest);
      logError(`CHECK_BOX_TRAK_SUCCESS`, {}, { response_received: data, body_sent: bodyRequest })
      createAmplitudeEvent(`Check Successful`)
      getDetailsUpdated(data);
    } catch (err) {
      logError(`CHECK_BOX_TRAK_ERROR`, err);
      createAmplitudeEvent(`Having Difficulties`, { reason: `Failed to check box`, failed_info:err });
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
    updatedForm.install_index = install_locations.indexOf(e.detail.value) + 1;
    setJobData({ ...updatedForm })

  }

  const GetVIN = async () => {
    try {
      const searchString = jobData.car_reg;
      const data = await makeConnectedAPIRequest(`/getvin/${searchString}`)
      let updatedForm = { ...jobData }
      updatedForm['vin'] = data;
      setJobData({...updatedForm});
      showAlert({header: `VIN lookup success`, message: `The VIN was found`})
    } catch (err) {
      logError(`FIND_VIN`, err);
      createAmplitudeEvent(`Having Difficulties`, {reason: `Failed to find a vin number`, failed_info: err})
      showAlert({header: `VIN lookup failed`, message: `The reg number was not found`})
    }
  }

  return <React.Fragment>
    <ScreenContainer>
        <IonList>
          <IonItem>
            <IonLabel position="floating">Voucher</IonLabel>
            <IonInput id="voucher" type="text" value={jobData.voucher} onIonChange={onInputChange}></IonInput>
          </IonItem>
          <IonItem>
            <IonLabel position="floating">SIM Number</IonLabel>
            <IonInput id="sim" type="text" value={jobData.sim} onIonChange={onInputChange}></IonInput>
          </IonItem>
          <IonItem>
            <IonLabel position="floating">Car Reg</IonLabel>
            <IonInput id="car_reg" type="text" value={jobData.car_reg} onIonChange={onInputChange}></IonInput>
          </IonItem>
          <IonItem>
            <IonLabel position="floating">Make</IonLabel>
            <IonInput id="car_make" type="text" value={jobData.car_make} onIonChange={onInputChange}></IonInput>
          </IonItem>
          <IonItem>
            <IonLabel position="floating">Model</IonLabel>
            <IonInput id="car_model" type="text" value={jobData.car_model} onIonChange={onInputChange}></IonInput>
          </IonItem>
          <IonButton expand='block' onClick={GetVIN}>Get VIN</IonButton>
          <IonItem>
            <IonLabel position="floating">VIN</IonLabel>
            <IonInput id="vin" type="text" value={jobData.vin} onIonChange={onInputChange}></IonInput>
          </IonItem>
          <IonItem>
            <IonLabel position="floating">Car Mileage</IonLabel>
            <IonInput id="car_mileage" type="number" value={jobData.car_mileage} onIonChange={onInputChange}></IonInput>
          </IonItem>
          <IonItem>
            <IonLabel position="floating">Colour</IonLabel>
            <IonSelect id="colour" value={jobData.colour} onIonChange={onInputChange}>
              {
                Object.entries(colours).map((colour: any) =>
                <IonSelectOption>{colour[1]}</IonSelectOption>)
              }
            </IonSelect>
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
          <IonItem>
            <div className="component-layout component-cta">
              <DeviceOrientations meta={jobData}/>
            </div>
          </IonItem>
          <IonButton expand='block' onClick={() => setOpened(true)}>Commission</IonButton>
        </IonList>
    </ScreenContainer>
    {
      opened === true && <ScreenModal title={`TRAK Commissioning`} disabledClose={submitted} onClose={closeModal} className="commission-modal">
        <div className="box">
          <div className="status">Activation status: <span className={getActivationStatus().toString().toLowerCase()}>{getActivationStatus()}</span></div>
          {
            activationStatus !== undefined ?
              <ComResults activation_status={activationStatus} activation_attempt_date={activationDate} association="TRAK" details={extraDetails} /> :
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