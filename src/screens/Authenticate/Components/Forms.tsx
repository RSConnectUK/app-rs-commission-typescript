import React, { useState, useEffect } from 'react';
import { IonButton, IonList, IonItem, IonLabel, IonInput, isPlatform } from '@ionic/react';
import { IonIcon } from '@ionic/react';
import { eyeOutline, eyeOffOutline } from 'ionicons/icons';
import * as yup from 'yup';

const ExportingComponent = (props: any) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isValid, setIsValid] = useState(false);

  let login_schema = yup.object().shape({
    username: yup.string().required().label('Username'),
    password: yup.number().required().label('Password')
  });

  useEffect(() => {
    const checkIsValid = async () => {
      const result = await login_schema.isValid(props.data);
      setIsValid(result);
    }
    checkIsValid();
    // eslint-disable-next-line
  }, [props.data])

  const onInputChange = (e: any) => {
    const id = e.srcElement.id;
    let updatedForm = { ...props.data }
    updatedForm[id] = e.detail.value;
    props.setData({ ...updatedForm })
  }

  return <React.Fragment>
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="headline">Welcome</div>
      <div className="subtext">Sign in to continue</div>
      <IonList >
        <IonItem className={isPlatform('ios') ? `ion-no-padding` : ``}>
          <IonLabel position="stacked" color="primary" style={{ fontWeight: 600 }}>Username</IonLabel>
          <IonInput
            id="username"
            value={props.data.username}
            placeholder="Username (Enter as firstnamelastname)"
            onIonChange={onInputChange}
          />
        </IonItem>
        <IonItem className={isPlatform('ios') ? `ion-no-padding` : ``} style={{ marginTop: 24 }}>
          <IonLabel position="stacked" color="primary" style={{ fontWeight: 600 }}>Password</IonLabel>
          <IonInput
            id="password"
            value={props.data.password}
            onIonChange={onInputChange}
            placeholder="Engineer ID (Your 4-Digit PIN)"
            type={showPassword ? `text` : `password`}
          >
            <IonIcon
              size="large"
              className="suffix-icon"
              color="medium"
              icon={!showPassword ? eyeOffOutline : eyeOutline}
              onClick={() => setShowPassword(!showPassword)}
            />
          </IonInput>
        </IonItem>
      </IonList>
      <IonButton 
        style={{ marginTop: 40 }} 
        disabled={!isValid || props.submitted }
        onClick={props.onFormSubmitted}>Log in</IonButton>
    </div>
  </React.Fragment>
}

export default ExportingComponent;