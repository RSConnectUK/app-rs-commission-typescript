import React, { useState, createContext, useContext, useEffect } from 'react';
import { useWindowSize, getLocalAccount } from './helpers';

// Components
import Alerts from '../components/layout/alerts';

const Context = createContext<any>({});
export const AppState = () => useContext(Context);

const ExportingComponent = (props: any) => {
	const [account, setAccount] = useState(null);
	const [width, height] = useWindowSize();

	useEffect(() => {
		// Functions to run at start
		const checkForAccount = async() => {
			const res = await getLocalAccount();
			setAccount(res);
		}
		checkForAccount();
	}, [])

	const passedVariables = {
		account,
		setAccount,
		resolution: { width, height }
	}

	return (<Context.Provider value={passedVariables}>
		<Alerts />
		{props.children}
	</Context.Provider>)
}

export default ExportingComponent;