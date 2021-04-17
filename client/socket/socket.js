import io from "socket.io-client";
import store from "../store";
import { guid, createQueryData } from "./utils";

const wsUri = "ws://localhost:3001";
const socket = io.connect(wsUri, { secure: true });

const callbacks = {};
const subscribeCallbacks = {};

export const createSubscriptions = (subscriptions) => {
  subscriptions.forEach(createSubscription);
};

export const createSubscription = ({ query, reduxAction, params = [] }) => {
  subscribeCallbacks[query] = (response) => {
    store.dispatch(reduxAction(response, ...params));
  };
};

export const socketQuery = (body, queryAction) => {
  const frontEndId = guid();
  const token = localStorage.getItem("userToken");
  const queryData = createQueryData(body, queryAction, frontEndId, token);

  socket.emit("query", queryData);

  return new Promise((resolve, reject) => {
    callbacks[frontEndId] = (response) => {
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

socket.on("response", ({ action, response, frontEndId }) => {
  try {
    if (callbacks[frontEndId]) {
      callbacks[frontEndId](response);
      delete callbacks[frontEndId];
    } else if (subscribeCallbacks[action]) {
      subscribeCallbacks[action](response);
    } else {
      throw `CALLBACK WAS NOT FOUND "${action}" ${JSON.stringify(response)}`;
    }
  } catch (err) {
    console.log("socket response err: ", err);
  }
});

export default socket;
