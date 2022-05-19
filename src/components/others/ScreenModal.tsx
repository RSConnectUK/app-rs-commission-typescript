import React, { useEffect } from "react";
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonButton } from '@ionic/react';

const Component = (props: any) => {
  useEffect(() => {
    document.body.classList.add(`screen-modal-opened`);

    return () => {
      document.body.classList.remove(`screen-modal-opened`);
    }
  }, []);

  const closeModal = () => {
    document.body.classList.remove(`screen-modal-opened`);
    const doc: any = document.getElementById(`screen-modal`);
    doc.classList.add(`closing`);
    setTimeout(() => {
      doc.classList.remove(`closing`);
      props.onClose();
    }, 220)
  }


  return <React.Fragment>
    <div id="screen-modal" className={`screen-modal ${props.className ? props.className : ``}`}>
      <IonHeader>
        <IonToolbar className="app-toolbar">
          <IonTitle>{props.title}</IonTitle>
          <IonButtons slot="end">
            <IonButton disabled={props.disabledClose || false} onClick={closeModal}>
              Close
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <div className="content-area">
        {
          props.children
        }
      </div>
    </div>
  </React.Fragment>
}

export default Component;
