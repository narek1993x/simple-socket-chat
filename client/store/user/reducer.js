import get from "lodash/get";
import * as types from "./actionTypes";
import { updateObject } from "../../helpers/utils";

const initialState = {
  users: [],
  currentUser: {},
  subscribedUser: null,
  isAuthenticated: false,
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case types.SET_USERS:
      return updateObject(state, { users: action.users });
    case types.SET_CURRENT_USER:
      const currentUser = get(action, "currentUser", null);
      return updateObject(state, { currentUser, isAuthenticated: !!currentUser });
    case types.SUBSCRIBE_TO_USER:
      return updateObject(state, { subscribedUser: action.subscribedUser });
    default:
      return state;
  }
};

export default reducer;
