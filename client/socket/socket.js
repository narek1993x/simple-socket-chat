import io from "socket.io-client";
import store from "../store";
import { guid, createQueryData } from "./utils";
import { SET_ERROR } from "../store/global/actionTypes";

const wsUri = "ws://simple-socket-chat-backend.herokuapp.com";
const socket = io.connect(wsUri, { secure: true });

const callbacks = {};
const subscribeCallbacks = {};

export const createSubscriptions = (subscriptions) => {
  subscriptions.forEach(createSubscription);
};

export const createSubscription = ({ query, reduxAction, params = [] }) => {
  subscribeCallbacks[query] = (response, error) => {
    if (error) {
      store.dispatch({ type: SET_ERROR, error });
      return;
    }

    if (Array.isArray(reduxAction)) {
      reduxAction.forEach((action) => {
        store.dispatch(action(response, ...params));
      });
    } else {
      store.dispatch(reduxAction(response, ...params));
    }
  };
};

export const socketQuery = (body, queryAction) => {
  const frontEndId = guid();
  const token = localStorage.getItem("userToken");
  const queryData = createQueryData(body, queryAction, frontEndId, token);

  socket.emit("query", queryData);

  return new Promise((resolve, reject) => {
    callbacks[frontEndId] = (response, error) => {
      if (error) {
        return reject(error);
      }

      if (response) {
        return resolve(response);
      }

      reject(`UNHANDLED ERROR IN "${queryAction}" ACTION`);
    };
  }).catch((error) => {
    console.info("socket error ", error);
    throw error;
  });
};

socket.on("response", ({ action, response, error, frontEndId }) => {
  try {
    if (callbacks[frontEndId]) {
      callbacks[frontEndId](response, error);
      delete callbacks[frontEndId];
    } else if (subscribeCallbacks[action]) {
      subscribeCallbacks[action](response, error);
    } else {
      throw `CALLBACK WAS NOT FOUND "${action}" ${JSON.stringify(response)}`;
    }
  } catch (err) {
    console.log("socket response err: ", err);
  }
});

export default socket;
