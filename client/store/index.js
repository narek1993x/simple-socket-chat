import { createStore, applyMiddleware, compose, combineReducers } from "redux";
import thunk from "redux-thunk";
import message from "./message/reducer";
import room from "./room/reducer";
import user from "./user/reducer";
import global from "./global/reducer";

const rootReducers = combineReducers({
  message,
  room,
  user,
  global,
});

const composeEnhancers =
  process.env.NODE_ENV === "development" && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    : compose;

const store = createStore(rootReducers, composeEnhancers(applyMiddleware(thunk)));

export default store;
