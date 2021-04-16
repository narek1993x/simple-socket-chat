import * as types from "./actionTypes";
import { updateObject } from "../../helpers/utils";

const initialState = {
  messages: [],
  privateMessages: [],
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case types.SET_MESSAGES:
      return updateObject(state, { messages: action.messages });
    case types.SET_PRIVATE_MESSAGES:
      return updateObject(state, { privateMessages: action.privateMessages });
    case types.ADD_NEWS_MESSAGE_BY_KEY:
      return updateObject(state, { [action.key]: [...state[action.key], action.message] });
    default:
      return state;
  }
};

export default reducer;
