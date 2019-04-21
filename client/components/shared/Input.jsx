import React, { Fragment, memo } from 'react';

const Input = memo(
  ({ isValid, shouldValidate, touched, value, onChange, elementConfig, submited }) => {
    let inputClasses = ['input-element'];
    let validationError = null;

    if (
      (!isValid || Array.isArray(isValid)) &&
      shouldValidate &&
      touched &&
      (value || submited)
    ) {
      inputClasses.push('inValid');
      validationError = (
        <Fragment>
          {Array.isArray(isValid) &&
            isValid.map((err, i) => (
              <p key={i} className="error-message">
                {err}
              </p>
            ))}
        </Fragment>
      );
    }

    return (
      <Fragment>
        <input
          value={value}
          onChange={onChange}
          className={inputClasses.join(' ')}
          {...elementConfig}
        />
        {validationError}
      </Fragment>
    );
  }
);

export default Input;
