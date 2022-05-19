import { useState, useLayoutEffect } from 'react';
import Axios from 'axios';
import axiosRetry from 'axios-retry';
import amplitude from 'amplitude-js';
import packageJSON from '../../package.json';

let retriesCount = 0;

axiosRetry(Axios, {
  retryDelay: () => 1750,
  retryCondition: function (err) {
    retriesCount++;
    if (err.response && err.response.status === 500 && retriesCount < 5) {
      return true;
    } else {
      retriesCount = 0;
      return false;
    }
  }
});

export function useWindowSize() {
  let [size, setSize] = useState([0, 0]);

  useLayoutEffect(() => {
    function updateSize() {
      setSize([window.innerWidth, window.innerHeight]);
    }
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);
  return size;
}

export const getLocalAccount = async () => localStorage.account !== undefined ? JSON.parse(localStorage.account) : null;

export const isRunningPWA = () => {
  let is_running_pwa = false;

  if (window.matchMedia('(display-mode: standalone)').matches) {  
    is_running_pwa = true;
  }  
  return is_running_pwa;
}

const ampPatcher: any  = { event: { evenType: null, data: null }, time: new Date() }

export async function createAmplitudeEvent(eventType: string, data: any = {}) {
  if(
    JSON.stringify(ampPatcher.event) === JSON.stringify({ eventType, data })
  ) return false; // Prevent trigger happy bugs.

  ampPatcher.event = { eventType, data: data };
  ampPatcher.time = new Date();
  try {
    const project = amplitude.getInstance();
    const account = await getLocalAccount();
    const key = process.env.REACT_APP_AMPLITUDE_KEY || 'Not found Amplitude Key';
    project.init(key)

    // Setting user properties
    amplitude.setUserId(account ? account.username : `Guest`);
    amplitude.setUserProperties({
      'Engineer ID': account ? account.engineer_id : `Guest`
    });

    // Adding Additional Data

    let propsInStorage: any = localStorage.getItem(`amplitudeProperties`);
    let amplitudeData = propsInStorage ? { ...JSON.parse(propsInStorage), ...data } : { ...data }
    amplitudeData.app_version = packageJSON.version;
    amplitudeData.running_app_as_pwa = isRunningPWA() ? `Yes` : `No`;

    console.log(`AMP EVENT: ${eventType}`, amplitudeData)

    if (window.location.hostname !== "localhost") {
      project.logEvent(eventType, amplitudeData)
    }
    
  } catch (err) {
    console.log(`Failed to create amplitude event`, err)
    // logError(`FAILED_TO_CREATE_AMPLITUDE`, err)
  }
}


export const logError = async (eventName: String, errorObject: any, extraJSON = {}, priority_level: Number = 0) => {
  try {
    const local_version = packageJSON.version;
    const key = process.env.REACT_APP_LOGZ_IO_KEY;
    const app_name = process.env.REACT_APP_LOGZ_IO_APP_NAME;
    const account = await getLocalAccount();

    const endpoint = `https://listener.logz.io:8071/?token=${key}&type=${app_name}`

    const body = {
      user_agent: navigator.userAgent,
      username: account ? account.username : `Guest`,
      account: account ? localStorage.account : '{}',
      eventName,
      message: `${eventName} - ${errorObject.message || 'No message'}`,
      body: (errorObject.response !== undefined || errorObject.stack !== undefined) ?
        JSON.stringify({ response: errorObject.response || `N/A`, stack: errorObject.stack || `N/A`, message: errorObject.message || `N/A` }) :
        JSON.stringify({ raw_error: true, log: JSON.stringify(errorObject) }),
      priority_level,
      json_attached: JSON.stringify(extraJSON),
      version_running: local_version,
      running_pwa: isRunningPWA() ? `Yes` : `No`
    }

    console.error(`Error occurred`, body)

    if (window.location.hostname !== "localhost") {
      await Axios.post(`${endpoint}`, `${JSON.stringify(body)}`);
    }

  } catch (err) {
    console.log('Failed to create debugging event', err);
  }
}

export const showAlert = async (props: any) => {
  let event = new CustomEvent("emitAlertDialog", { detail: props });
  window.document.dispatchEvent(event);
}


export const generateBlobFromResource = async (resource: any, options: any = { isFile: false }) => {
  if (options.isFile === false) {
    const file = await resource.blob()
    const url = URL.createObjectURL(file);
    return url;
  } else {
    return URL.createObjectURL(resource);
  }
}

const CONNECTED_API_TESTING = false;

const endpointMapping: any = {
  "dev": {
    "link": "https://a63vbm640k.execute-api.eu-west-2.amazonaws.com/dev",
    "secret": "EFmY3Lp6FZ1lIz8v3TeG4811Ukh5bpCD1g7ZKdCq"
  },
  "live": {
    "link": "https://w5rfr7dqt4.execute-api.eu-west-2.amazonaws.com/live",
    "secret": "a7uO7h1CWf6R5DUQTP4bJ46lBnJzuSH6agIVVxDO"
  },
  "local": {
    "link": "http://localhost:3031/dev",
    "secret": "d41d8cd98f00b204e9800998ecf8427e"
  }
}

export const makeConnectedAPIRequest = async (path: string, method: any = 'GET', body?: any) => {
  try {
    const isLive = process.env.REACT_APP_LIVE_ENVIRONMENT === "true" ? "live" : "dev";
    const api = endpointMapping[CONNECTED_API_TESTING ? `local` :  isLive];
    const { data } = await Axios(`${api.link}/${path}`, {
      method: method.toString().toUpperCase(),
      headers: {
        'x-api-key': api.secret
      },
      data: body ? body : {}
    });
    return data;
  } catch (err) {
    throw err;
  }
}

export const getUserLocation = async () => {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition((successData: any) => {
      resolve(successData.coords)
    }, (err: any) => reject(err), {});
  })
}

export const makeAFTWORequest = async (queryParameters: any, parserFunction: any) => {
  try {
    const { data } = await Axios(`https://aftwords.hasura.app/v1/graphql`, {
      method: 'POST',
      headers: {
        'x-hasura-admin-secret': `3FL8EuBftEPrZ5p2nrBylxnC5JDWZ3lxt9PL9rwYGgg5CfnWkhHDsy2Lgq1UalST`
      },
      data: queryParameters
    })
    if (data.errors) throw new Error(JSON.stringify(data.errors));
    return parserFunction ? parserFunction(data.data) : data.data;
  } catch (err) {
    throw err;
  }
}

export const makeContractsRequest = async (queryParameters: any, parserFunction: any) => {
  try {
    const { data } = await Axios(`https://rscontracts.herokuapp.com/v1/graphql`, {
      method: 'POST',
      headers: {
        'x-hasura-admin-secret': `3UXS&QnJ&a3#E71WQvwK0K&EZh#3%sYd`
      },
      data: queryParameters
    })
    if (data.errors) throw new Error(JSON.stringify(data.errors));
    return parserFunction ? parserFunction(data.data) : data.data;
  } catch (err) {
    throw err;
  }
}

export function getRandomNumber(length: any) {
  return Math.floor(Math.pow(10, length - 1) + Math.random() * 9 * Math.pow(10, length - 1));
}

export const getFormTemplates = async (contract_type: any, classification: any, association: any) => {
  try {
    const { data } = await Axios(`https://zlx7ivf1q9.execute-api.eu-west-2.amazonaws.com/live/formTemplates`, {
      method: `POST`,
      headers: {
        'x-api-key': `9VSiG8BR2q8xfseFt4phG7qbgI3x5N49d1hyTsH6`
      }, 
      data: {
        job_classification: classification,
        contract_association: association,
        contract_type: contract_type
      }
    });
    return data;
  } catch (err) {
    throw err;
  }
}

export const getUnitType = async (_box_id: string) => {
    const mess = await Axios(`http://217.8.255.14/Database/RSStockControl/connected/GetUnitType.php`,{
      method: `POST`,
      headers: {'content-type':`application/json`},
      data: {
        box_id: _box_id
      }
    });
    return mess
}