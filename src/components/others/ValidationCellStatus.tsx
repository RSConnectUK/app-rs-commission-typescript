
import React from 'react';
import { IonIcon } from '@ionic/react';
import { checkmarkCircleOutline, closeCircleOutline } from 'ionicons/icons';

const ValidIcon = () => <React.Fragment>
  <IonIcon style={{color:"green"}} icon={checkmarkCircleOutline} />
</React.Fragment>

const InvalidIcon = () => <React.Fragment>
  <IonIcon style={{color:"grey"}} icon={closeCircleOutline} />
</React.Fragment>

const ExportingComponent = (props: any) => {
  return <React.Fragment>
    <div className={`validation-status ${props.isValid === true ? `valid` : `not-valid`}`}>
      {props.isValid === false ? <InvalidIcon /> : <ValidIcon />}
    </div>
  </React.Fragment>
}

export default ExportingComponent;