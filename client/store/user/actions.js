import * as types from './actionTypes';
import { socketQuery } from '../../socket/socket';
import { setRooms } from '../room/actions';

export const authUser = (body, queryAction) => {
  return async dispatch => {
    try {
      const response = await socketQuery(body, queryAction);
      const { users, currentUser, rooms, token } = response;

      if (token) {
        localStorage.setItem('userToken', token);
      };
  
      dispatch(setUsers(users))
      dispatch(setCurrentUser(currentUser))
      dispatch(setRooms(rooms))
    } catch (error) {
      console.error('authUser: ', error);
    }
  }
}

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
