import React, { useEffect, useState } from 'react';
import ValidationCellStatus from './ValidationCellStatus';

const Component = (props: any) => {
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    if (props.meta === null && props.defaultValue !== undefined) {
      props.setMeta(props.identifier, props.defaultValue)
    }
    if (props.validationMethod !== undefined) validateComponent(props.meta);
    return () => {
      if(props.updateValidation) props.updateValidation(props.identifier, true);
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (props.validationMethod !== undefined) validateComponent(props.meta);
    // eslint-disable-next-line
  }, [props.meta])

  const validateComponent = (value: any | null) => {
    if (props.validationMethod === undefined) return false;
    const isValid = props.validationMethod(value !== undefined ? value : props.meta);
    props.updateValidation(props.identifier, isValid);
    setIsValid(isValid);
  }

  const onInputChange = (e: any) => {
    if (e.target.value === props.meta) return false;
    let value = e.target.value;
    if (props.maxLength) {
      value = value.substr(0, props.maxLength);
    }

    if(props.identifier === "vin") {
      value = value.toString().toUpperCase();
    }

    props.setMeta(props.identifier, value);
    validateComponent(value);
    if (props.onDataChanged) {
      props.onDataChanged(value);
    }
    
  };

  return <React.Fragment>
    <div className="component-layout component-input">
      <div className="container">
        <div className="left-area">
          <ValidationCellStatus isValid={isValid} />
          <div className="label">{props.label}</div>
        </div>
        <div className="right-area">
          <input
            value={props.meta || ''}
            onChange={onInputChange}
            placeholder={props.placeholder ? props.placeholder : `Enter text`}
            disabled={props.disabled ? props.disabled : false}
          />
        </div>
      </div>
    </div>
  </React.Fragment>
}

export default Component;