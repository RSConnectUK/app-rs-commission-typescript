import React from 'react';
import { IonActionSheet } from '@ionic/react';
import { createAmplitudeEvent, showAlert} from '../../../utils/helpers';
import { AppState } from '../../../utils/state';
import PackageJson from '../../../../package.json';

const ExportingComponent = (props: any) => {
  const { account, setAccount } = AppState();

  const logOut = async () => {
    showAlert({
      header: 'Confirm',
      message: `Are you sure you want to log out?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Confirm',
          handler: async () => {
            createAmplitudeEvent(`Logged out`)
            localStorage.removeItem('account');
            setAccount(null);
          }
        }
      ]
    });
  }

  const buttonMenu = [
    {
      text: 'Cancel',
      role: 'cancel',
      handler: props.closeMenu
    },
    {
      text: 'Log Out',
      role: 'destructive',
      handler: logOut
    },
    {
      text: `Restart Application`,
      handler: async () => {
        window.location.reload();
      }
    },
    {
      text: `Check Version`,
      handler: async () => {
        await createAmplitudeEvent(`Tapped Check app version`, { version_shown: PackageJson.version })
        showAlert({
          header: `Version ${PackageJson.version}`,
          message: `This is your current version.`
        })
      }
    }   
  ]

  return <React.Fragment>
    <IonActionSheet
      header={`${account.username}`}
      isOpen={props.menuToggled}
      onDidDismiss={props.closeMenu}
      buttons={buttonMenu}
    />
  </React.Fragment>
}

export default ExportingComponent;