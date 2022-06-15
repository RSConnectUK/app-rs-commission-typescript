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

const ExportingComponent = (props: any) => {
  // eslint-disable-next-line
  const [opened, setOpened] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [activationStatus, SetActivationStatus] = useState<string>();
  const [activationDate, SetActivationDate] = useState<string>();
  const [jobData, setJobData] = useState<any>({ voucher: null, sim: null, car_reg: null, colour: null, car_make: null, car_model: null, vin: null, car_mileage: null, install_index: null, alpha: null, beta: null, gamma: null });
  const [jobValid, setJobValid] = useState<any>({ voucher: false, sim: false, car_reg: false, colour: false, car_make: false, car_model: false, vin: false, car_mileage: false, install_index: false, orientation: false });
  const [allValid, setAllValid] = useState(false);
  const [extraDetails, setExtraDetails] = useState<any>([]);
  const assoc = `TRAK`;
  const { account } = AppState();
  const install_locations = [`Dash, Passenger Side`, `Dash, Centre`, `Dash, Driver Side`, `Centre Console Front`, `Centre Console Rear`, `Boot, Passenger Side`, `Boot, Centre`, `Boot, Driver Side`, `Engine Bay`];

  const updateJobData = (id: string, val: string) => {
    let updatedForm = { ...jobData }
    updatedForm[id] = val;
    setJobData({ ...updatedForm })
  }

  const updateJobValid = (id: string, state: boolean) => {
    let updatedValid = {...jobValid };
    updatedValid[id] = state;
    setJobValid({...updatedValid});
    setAllValid(checkAllValid(updatedValid));
  }

  const checkAllValid = (updatedValid: any) => {
    let valid = true;
    Object.values(updatedValid).forEach(val => {if (val===false) valid = false })
    return valid;
  }

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

  const openCommission = () => {
    if (!allValid) {
      console.log(jobValid);
      showAlert({
        header: 'Check Fields',
        message: `Please check all the fields before commissioning`
      });
      return false;
    }
    setOpened(true);
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
      car_reg: jobData.car_reg,
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

    let ampBody = { association: assoc, voucher: jobData.voucher, sim: jobData.sim, car_reg: jobData.reg, vin: jobData.vin, requestBody: JSON.stringify(bodyRequest) }

    try {
      createAmplitudeEvent(`Tapped Activate Device`,{...ampBody});
      console.log(bodyRequest);
      const data = await makeConnectedAPIRequest(`trak/associate`, `POST`, bodyRequest);
      logError(`TRAK_ACTIVATION_SUCCESS`, {}, { response_received: data, body_sent: bodyRequest })
      SetActivationStatus("Success")
      SetActivationDate(moment(new Date()).format(`HH:mm:ss`));
      setExtraDetails(data.message ? [{ text: `Message`, value: data.message }] : []);
      createAmplitudeEvent(`Device activated`,{...ampBody});
    } catch (err: any) {
      logError(`TRAK_ACTIVATION_FAILURE`, err, bodyRequest)
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

  const checkBox = async () => {
    const bodyRequest = {
      voucher_num: jobData.voucher,
      sim_number: jobData.sim,
      vin: jobData.vin
    }
    let ampBody = {association: assoc, voucher: jobData.voucher, sim: jobData.sim, vin: jobData.vin}
    setSubmitted(true);    try {
      createAmplitudeEvent(`Tapped Check Box`,{...ampBody});
      const data = await makeConnectedAPIRequest(`trak/check_sim`, `POST`, bodyRequest);
      logError(`CHECK_BOX_TRAK_SUCCESS`, {}, { response_received: data, body_sent: bodyRequest })
      createAmplitudeEvent(`Check Successful`,{...ampBody})
      getDetailsUpdated(data);
    } catch (err) {
      logError(`CHECK_BOX_TRAK_ERROR`, err);
      createAmplitudeEvent(`Having Difficulties`, {...ampBody, reason: `Failed to check box`, failed_info: err});
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

  //update any of the values of the user form (apart from the postition & colour) into memory
  const onInputChange = (e: any) => {
    const id = e.srcElement.id;
    const val = e.detail.value;
    
    updateJobData(id, val);
    updateJobValid(id,(val.length > 0) ? true : false);
  }

  //update the value of the box position variable.
  const onInputPosChange = (e: any) => {
    const id = e.srcElement.id;
    const val = e.detail.value;

    updateJobData(id, val);
    updateJobValid(id,true);
  }

  const GetVIN = async () => {
    setSubmitted(true);
    try {
      const searchString = jobData.car_reg;
      const data = await makeConnectedAPIRequest(`/getvin/${searchString}`)
      let updatedForm = { ...jobData }
      updatedForm['vin'] = data;
      setJobData({...updatedForm});
      showAlert({header: `VIN lookup success`, message: `The VIN was found`})
    } catch (err) {
      logError(`FIND_VIN`, err);
      createAmplitudeEvent(`Having Difficulties`, {associaton: assoc,reason: `Failed to find a vin number`, car_reg: jobData.car_reg, failed_info: err})
      showAlert({header: `VIN lookup failed`, message: `The reg number was not found`})
    }
    setSubmitted(false);
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
            <IonInput id="voucher" type="text" value={jobData.voucher} onIonChange={onInputChange}></IonInput>
          </IonItem>
          <IonItem>
            <Label valid={jobValid.sim}>SIM Number</Label>
            <IonInput id="sim" type="text" value={jobData.sim} onIonChange={onInputChange}></IonInput>
          </IonItem>
          <IonItem>
            <Label valid={jobValid.car_reg}>Car Reg</Label>
            <IonInput id="car_reg" type="text" value={jobData.car_reg} onIonChange={onInputChange}></IonInput>
          </IonItem>
          <IonItem>
            <Label valid={jobValid.car_make}>Make</Label>
            <IonInput id="car_make" type="text" value={jobData.car_make} onIonChange={onInputChange}></IonInput>
          </IonItem>
          <IonItem>
            <Label valid={jobValid.car_model}>Model</Label>
            <IonInput id="car_model" type="text" value={jobData.car_model} onIonChange={onInputChange}></IonInput>
          </IonItem>
          <IonButton expand='block' disabled={submitted} onClick={GetVIN}>Get VIN</IonButton>
          <IonItem>
            <Label valid={jobValid.vin}>VIN</Label>
            <IonInput id="vin" type="text" value={jobData.vin} onIonChange={onInputChange}></IonInput>
          </IonItem>
          <IonItem>
            <Label valid={jobValid.car_mileage}>Car Mileage</Label>
            <IonInput id="car_mileage" type="number" value={jobData.car_mileage} onIonChange={onInputChange}></IonInput>
          </IonItem>
          <IonItem>
            <Label valid={jobValid.colour}>Colour</Label>
            <IonSelect interface="action-sheet" id="colour" value={jobData.colour} onIonChange={onInputPosChange}>
              {
                Object.entries(colours).map((colour: any) =>
                <IonSelectOption>{colour[1]}</IonSelectOption>)
              }
            </IonSelect>
          </IonItem>
          <IonItem>
            <Label valid={jobValid.install_index}>Position</Label>
            <IonSelect interface="action-sheet" id="install_index" onIonChange={onInputPosChange}>
              {
                Object.entries(install_locations).map((location: any) =>
                <IonSelectOption style={{"width":"100px"}} value={parseInt(location[0])+1}>{location[1]}</IonSelectOption>)
              }
            </IonSelect>
          </IonItem>
          <DeviceOrientations data={jobData} meta={{alpha: jobData.alpha, beta: jobData.beta, gamma: jobData.gamma}} setMeta={setJobData} jobValid={jobValid} updateJobValid={updateJobValid}/>
          <IonButton expand='block' onClick={openCommission}>Commission</IonButton>
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