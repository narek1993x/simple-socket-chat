import * as types from "./actionTypes";
import * as socketActions from "../../socket/socketActions";
import { createSubscriptions } from "../../socket/socket";

export const setTyping = ({ username, direct = false, roomName = null }, stopTyping = false) => {
  return (dispatch, getState) => {
    let typingRoomId = null;
    if (roomName) {
      typingRoomId = getState().room.rooms.find((r) => r.name === roomName)._id;
    }

    dispatch({
      type: types.SET_TYPING,
      payload: {
        isTyping: true,
        typingUsername: stopTyping ? null : username,
        typingRoomId: stopTyping ? null : typingRoomId,
        isDirectTyping: direct,
      },
    });
  };
};

export const breakTyping = () => {
  return {
    type: types.BREAK_TYPING,
  };
};

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

export const addNewMessageByKey = (message, key, fromSubscribe = false) => {
  return (dispatch, getState) => {
    if (key === "privateMessages" && fromSubscribe) {
      const subscribedUser = getState().user.subscribedUser;

      if (subscribedUser && subscribedUser._id !== message.to && subscribedUser._id !== message.createdBy._id) return;
    }

    dispatch({
      type: types.ADD_NEWS_MESSAGE_BY_KEY,
      message,
      key,
    });
  };
};

createSubscriptions([
  {
    query: socketActions.TYPING,
    reduxAction: setTyping,
  },
  {
    query: socketActions.STOP_TYPING,
    reduxAction: setTyping,
    params: [true],
  },
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
    reduxAction: [addNewMessageByKey, breakTyping],
    params: ["messages", true],
  },
  {
    query: socketActions.PRIVATE_MESSAGE,
    reduxAction: [addNewMessageByKey, breakTyping],
    params: ["privateMessages", true],
  },
]);
