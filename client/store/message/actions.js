import * as types from "./actionTypes";
import * as socketActions from "../../socket/socketActions";
import { createSubscriptions } from "../../socket/socket";

export const setMessages = ({ messages }) => {
  return {
    type: types.SET_MESSAGES,
    messages,
  };
};

export const setPrivateMessages = ({ privateMessages }) => {
  return {
    type: types.SET_PRIVATE_MESSAGES,
    privateMessages,
  };
};

export const addNewMessageByKey = (message, key) => {
  return {
    type: types.ADD_NEWS_MESSAGE_BY_KEY,
    message,
    key,
  };
};

createSubscriptions([
  {
    query: socketActions.SUBSCRIBE_ROOM,
    reduxAction: setMessages,
  },
  {
    query: socketActions.SUBSCRIBE_USER,
    reduxAction: setPrivateMessages,
  },
  {
    query: socketActions.MESSAGE,
    reduxAction: addNewMessageByKey,
    params: ["messages"],
  },
  {
    query: socketActions.PRIVATE_MESSAGE,
    reduxAction: addNewMessageByKey,
    params: ["privateMessages"],
  },
]);
