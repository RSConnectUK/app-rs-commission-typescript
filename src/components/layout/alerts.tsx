import React, { useEffect, useState } from 'react';
import { IonAlert } from '@ionic/react';

const ExportingComponent = (props: any) => {
  const [currentProps, setCurrentProps] = useState({ isOpen: false})

  useEffect(() => {
    
    const onAlertEventReceived = async (event: any) => {
      const data = event.detail;

      const newProps = {
        isOpen: true,
        buttons: ["Dismiss"],
        ...data,
        onDidDismiss: () => {
          if(data.onDidDismiss) {
            data.onDidDismiss();
          }
          setCurrentProps({ isOpen: false })
        }
      }
      setCurrentProps({ ...newProps });
    }

    window.document.addEventListener("emitAlertDialog", onAlertEventReceived);
    
    return () => {
      window.document.removeEventListener("emitAlertDialog", onAlertEventReceived)
    }

  }, [])
  return <React.Fragment>
    <IonAlert { ...currentProps } />
  </React.Fragment>
}

export default ExportingComponent;