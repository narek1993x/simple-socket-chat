import * as types from "./actionTypes";
import { createSubscription } from "../../socket/socket";
import { MESSAGE, PRIVATE_MESSAGE } from "../../socket/socketActions";

export const setMessages = (messages) => {
  return {
    type: types.SET_MESSAGES,
    messages,
  };
};

export const setPrivateMessages = (privateMessages) => {
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

const subscribeActions = [
  {
    query: MESSAGE,
    reduxAction: addNewMessageByKey,
    params: ["messages"],
  },
  {
    query: PRIVATE_MESSAGE,
    reduxAction: addNewMessageByKey,
    params: ["privateMessages"],
  },
];

subscribeActions.forEach(createSubscription);
