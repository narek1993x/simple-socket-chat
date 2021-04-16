import io from "socket.io-client";
import store from "../store";
import { guid, createQueryData } from "./utils";

const wsUri = "ws://localhost:3001";
const socket = io.connect(wsUri, { secure: true });

const callbacks = {};
const subscriptions = {};

export const createSubscription = ({ query, reduxAction, params }) => {
  subscriptions[query] = (response) => {
    if (typeof reduxAction === "function") {
      store.dispatch(reduxAction(response, ...params));
    } else {
      store.dispatch({ type: reduxAction, payload: response });
    }
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
    } else if (subscriptions[action]) {
      subscriptions[action](response);
    } else {
      throw `CALLBACK WAS NOT FOUND "${action}" ${JSON.stringify(response)}`;
    }
  } catch (err) {
    console.log("socket response err: ", err);
  }
});

export default socket;
