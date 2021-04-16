export const updateObject = (oldObject, updatedProperties) => {
  return {
    ...oldObject,
    ...updatedProperties,
  };
};

export const checkValidity = (fieldName, value, rules) => {
  const name = fieldName.substr(0, 1).toUpperCase() + fieldName.slice(1);
  let isValid = true;
  let errors = [];

  if (!rules) {
    isValid = true;
  }

  if (rules.required) {
    const check = value.trim() !== "";
    isValid = check && isValid;
    if (!check) {
      errors.push(`${name} is required.`);
    }
  }

  if (rules.minLength) {
    const check = value.length >= rules.minLength;
    isValid = value.length >= rules.minLength && isValid;
    if (!check) {
      errors.push(`${name} must have minimum ${rules.minLength} characters.`);
    }
  }

  if (rules.maxLength) {
    const check = value.length <= rules.maxLength;
    isValid = check && isValid;
    if (!check) {
      errors.push(`${name} must have maximum ${rules.maxLength} characters.`);
    }
  }

  if (rules.isEmail) {
    const pattern = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
    const check = pattern.test(value);
    isValid = check && isValid;
    if (!check) {
      errors.push(`Email is not valid.`);
    }
  }

  if (errors.length) {
    return errors;
  }

  return isValid;
};
