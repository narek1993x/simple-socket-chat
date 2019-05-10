import * as types from './actionTypes';

export const setUsers = (users) => {
  return {
    type: types.SET_USERS,
    users
  }
};

export const setCurrentUser = (currentUser) => {
  return {
    type: types.SET_CURRENT_USER,
    currentUser
  }
};
