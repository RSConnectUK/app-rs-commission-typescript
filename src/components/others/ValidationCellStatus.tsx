import React from 'react';
import { IonIcon } from '@ionic/react';
import { checkmarkCircleOutline, closeCircleOutline } from 'ionicons/icons';

const ValidIcon = () => <React.Fragment>
  <IonIcon icon={checkmarkCircleOutline} />
</React.Fragment>

const InvalidIcon = () => <React.Fragment>
  <IonIcon icon={closeCircleOutline} />
</React.Fragment>

const ExportingComponent = (props: any) => {
  return <React.Fragment>
    <div className={`validation-status ${props.isValid === true ? `valid` : `not-valid`}`}>
      {props.isValid === false ? <InvalidIcon /> : <ValidIcon />}
    </div>
  </React.Fragment>
}

export default ExportingComponent;