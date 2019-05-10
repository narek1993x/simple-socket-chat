import * as types from './actionTypes';
import { updateObject } from '../../helpers/utility';

const initialState = {
  users: [],
  currentUser: {}
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case types.SET_USERS:
      return updateObject(state, { users: action.users });
    case types.SET_CURRENT_USER:
      return updateObject(state, { currentUser: action.currentUser });
    default: return state;
  }
}

export default reducer;