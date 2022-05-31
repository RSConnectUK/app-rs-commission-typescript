import React, { useEffect, useState } from 'react';
import ValidationCellStatus from './ValidationCellStatus';
import ScreenModal from './ScreenModal';
import { IonButton } from '@ionic/react';
import { showAlert, createAmplitudeEvent, logError } from '../../utils/helpers';

const OrientationsReadings = (props: any) => {

  useEffect(() => {

    function handleEvent(event: any) {
      const { acceleration } = event;
      const { x, y, z } = acceleration;
      if (x === null) {
        props.setMotion({ x: 0, y: 0, z: 0 })
      } else props.setMotion({ x: x.toFixed(3), y: y.toFixed(3), z: z.toFixed(3) })
    }

    window.addEventListener('devicemotion', handleEvent)

    return () => {
      window.removeEventListener("devicemotion", handleEvent);
    }
    // eslint-disable-next-line
  }, [])

  return <React.Fragment>
    <div style={{ width: '100%' }}>
      <span style={{ wordBreak: 'break-all', textAlign: 'center', width: '100%', display: 'block', fontSize: 16 }}>{JSON.stringify({
        alpha: props.motion.x,
        beta: props.motion.y,
        gamma: props.motion.z
      })}</span>
    </div>
  </React.Fragment>
}

const Component = (props: any) => {
  const [isValid, setIsValid] = useState(false);
  const [opened, setOpened] = useState(false);
  const [orientations, setOrientations] = useState<any>({ box: null, car: null });
  const [motion, setMotion] = useState<any>({ x: 0, y: 0, z: 0 });

  const openModal = () => {
    if ((DeviceMotionEvent as any) !== undefined && (DeviceMotionEvent as any).requestPermission !== undefined) { // Safari Support
      (DeviceMotionEvent as any).requestPermission()
        .then((response: any) => {
          if (response === 'granted') {
            setOpened(true);
            setMotion({ x: 0, y: 0, z: 0 })
            setOrientations({ car: null, box: null });
          } else onOrientationError(`Permission not granted`);
        })
    } else { //Chrome
      setOpened(true);
      setMotion({ x: 0, y: 0, z: 0 })
      setOrientations({ car: null, box: null });
    }
  }

  const closeModal = () => {
    setOpened(false);
  }

  const onOrientationError = (err: any) => {
    logError(`ORIENTATION_ERROR`, err);
    showAlert({
      header: `Permission denied`,
      message: `You refused to give us permission to read your device motion. Restart the app and try again or contact our support team to solve this error.`
    })
    createAmplitudeEvent(`Having Difficulties`, { reason: `Refused to give permission to motion on iOS` })
    closeModal();
  }

  const setMotionAs = (key: string) => {
    setOrientations((currentState: any) => {
      let clonedState = { ...currentState };
      clonedState[key] = motion;
      return clonedState;
    })
  }

  const generateFinalOutput = () => {
    let car = { ...orientations.car }
    let box = { ...orientations.box }
    // x = alpha, y = beta, z = gamma 

    // Normalize Car Vector 
    const car_length = Math.sqrt((car.x * car.x) + (car.y * car.y) + (car.z * car.z))
    if (car_length !== 0.0) {
      car.x = car.x / car_length;
      car.y = car.y / car_length
      car.z = car.z / car_length
    }

    // Normalize Box Vector 
    const box_length = Math.sqrt((box.x * box.x) + (box.y * box.y) + (box.z * box.z))
    if (box_length !== 0.0) {
      box.x = box.x / box_length;
      box.y = box.y / box_length
      box.z = box.z / box_length
    }

    // Final
    const pi_val = 3.1415926535;

    const alpha = (((Math.acos(car.x) - Math.acos(box.x)) * 180) / pi_val)
    const beta = (((Math.acos(car.y) - Math.acos(box.y)) * 180) / pi_val)
    const gamma = (((Math.acos(car.z) - Math.acos(box.z)) * 180) / pi_val)

    let final_output = { alpha: parseFloat(alpha.toFixed(1)), beta: parseFloat(beta.toFixed(1)), gamma: parseFloat(gamma.toFixed(1)) };
    // console.log('Final orientations output', final_output);

    props.setMeta(props.identifier, final_output);
    closeModal();

  }

  return <React.Fragment>
    <div className="component-device-orientations">
      <div className="container">
        <div className="left-area">
          <ValidationCellStatus isValid={isValid} />
          <div className="label">Device Orientations</div>
        </div>
        <div className={`cta no-data`} onClick={openModal}>Touch here</div>
      </div>
    </div>
    {
      opened === true && <ScreenModal title={`Device Orientation`} onClose={closeModal} className="commission-modal orientations-modal">
        <div className="box">
          {
            <React.Fragment>
              <div className="status">Raw Data</div>
              <OrientationsReadings
                motion={motion}
                setMotion={setMotion}
                onError={onOrientationError}
              />
              <hr className="divider-hr" />
              <IonButton
                fill="solid"
                style={{ width: '100%' }}
                disabled={orientations['car'] !== null}
                onClick={() => setMotionAs('car')}>
                {
                  orientations[`car`] === null ? `Mark as car` : `Car orientation set - ${JSON.stringify(orientations[`car`])}`
                }
              </IonButton>
              <IonButton
                fill="solid"
                style={{ width: '100%' }}
                disabled={orientations[`box`] !== null}
                onClick={() => setMotionAs('box')}>
                {
                  orientations[`box`] === null ? `Mark as box` : `Box orientation set - ${JSON.stringify(orientations[`box`])}`
                }
              </IonButton>

              {
                ((orientations['car'] !== null) || (orientations['box'] !== null)) && <React.Fragment>
                  <hr className="divider-hr" />
                  <IonButton fill="outline" onClick={() => setOrientations({ box: null, car: null })} style={{ 'width': '100%' }}>Restart</IonButton>
                </React.Fragment>
              }
              {
                (orientations['car'] !== null && orientations['box'] !== null) && <IonButton disabled={!(orientations['car'] !== null && orientations['box'] !== null)} onClick={generateFinalOutput} style={{ 'width': '100%', marginTop: 8 }}>Save this orientation</IonButton>
              }
            </React.Fragment>
          }
        </div>
      </ScreenModal>
    }
  </React.Fragment>
}

export default Component;