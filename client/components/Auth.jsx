import React, { Component, Fragment } from 'react';
import Input from './shared/Input';
import { checkValidity } from '../helpers/utility';

class Auth extends Component {
  state = {
    isSignin: true,
    error: '',
    fields: [
      {
        id: 'username',
        elementConfig: {
          type: 'text',
          placeholder: 'Username'
        },
        value: '',
        validation: {
          required: true,
          minLength: 2
        },
        valid: false,
        touched: false
      },
      {
        id: 'email',
        elementConfig: {
          type: 'text',
          placeholder: 'Mail Address'
        },
        value: '',
        validation: {
          required: true,
          isEmail: true
        },
        valid: false,
        touched: false
      },
      {
        id: 'password',
        elementConfig: {
          type: 'password',
          placeholder: 'Password'
        },
        value: '',
        validation: {
          required: true,
          minLength: 6,
          maxLength: 14
        },
        valid: false,
        touched: false
      }
    ],
    isSubmit: false
  };

  componentWillReceiveProps(nextProps) {
    if (this.state.error !== nextProps.error) {
      this.setState({ error: nextProps.error });
    }
  }

  handleSwitch = () => {
    this.setState((prevState) => ({ isSignin: !prevState.isSignin, error: '' }), this.handleResetFields);
  };

  handleUserLogin = (e) => {
    e.preventDefault();
    this.setState({ isSubmit: true });

    const { isSignin, fields } = this.state;

    if (!this.handleInputsValidation()) return;

    const params = {
      isSignin
    };

    for (let f of fields) {
      params[f.id] = f.value;
    }

    if (isSignin) {
      delete params.email;
    }

    this.props.onHandleUserAuth(params);
  };

  handleInputsValidation = () => {
    const fields = [...this.state.fields].filter((f) => (this.state.isSignin ? f.id !== 'email' : f));

    const updatedFields = fields.map((item) => ({
      ...item,
      valid: checkValidity(item.id, item.value, item.validation),
      touched: true
    }));

    let formIsValid = true;

    for (let inputIdentifier of updatedFields) {
      const { valid } = inputIdentifier;
      formIsValid = typeof valid === 'boolean' && valid && formIsValid;
    }

    this.setState({ fields: updatedFields });

    return formIsValid;
  };

  handleInputChange = (e, id) => {
    const fields = [...this.state.fields];
    const updatedFields = fields.map((field) => {
      if (field.id === id) {
        return {
          ...field,
          value: e.target.value,
          valid: this.state.isSubmit ? checkValidity(id, e.target.value, field.validation) : null
        };
      }
      return field;
    });

    this.setState({ fields: updatedFields });
  };

  handleResetFields = () => {
    const fields = [...this.state.fields];
    const resetedFields = fields.map((field) => ({
      ...field,
      value: '',
      valid: false,
      touched: false
    }));

    this.setState({ fields: resetedFields });
  };

  render() {
    let { isSignin, fields, error } = this.state;

    let form = fields
      .filter((f) => (isSignin ? f.id !== 'email' : f))
      .map((field) => (
        <Input
          key={field.id}
          elementConfig={field.elementConfig}
          value={field.value}
          isValid={field.valid}
          shouldValidate={field.validation}
          touched={field.touched}
          onChange={(e) => this.handleInputChange(e, field.id)}
        />
      ));

    return (
      <Fragment>
        <form className="username-input" onSubmit={this.handleUserLogin}>
          <h2>{isSignin ? 'Sign In' : 'Sign Up'}</h2>
          {form}
          {error && <p className="error-message">{error}</p>}
          <button type="submit">{isSignin ? 'Signin' : 'Signup'}</button>
          <button className="switch-button" type="button" onClick={this.handleSwitch}>
            Switch to {isSignin ? 'Signup' : 'Signin'}
          </button>
        </form>
      </Fragment>
    );
  }
}

export default Auth;
