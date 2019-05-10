import * as types from './actionTypes';

export const setMessages = (messages) => {
  return {
    type: types.SET_MESSAGES,
    messages
  }
};

export const setPrivateMessages = (privateMessages) => {
  return {
    type: types.SET_PRIVATE_MESSAGES,
    privateMessages
  }
};

export const addNewMessageByKey = (message, key) => {
  return {
    type: types.ADD_NEWS_MESSAGE_BY_KEY,
    message,
    key
  }
}