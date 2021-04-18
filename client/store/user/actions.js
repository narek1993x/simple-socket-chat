import * as types from "./actionTypes";
import * as socketActions from "../../socket/socketActions";
import { socketQuery, createSubscriptions } from "../../socket/socket";
import { setRooms } from "../room/actions";

export const authUser = (body, queryAction) => {
  return async (dispatch) => {
    try {
      const { users, currentUser, rooms, token } = await socketQuery(body, queryAction);

      if (token) {
        localStorage.setItem("userToken", token);
      }

      dispatch(setUsers({ users }));
      dispatch(setCurrentUser(currentUser));
      dispatch(setRooms(rooms));
    } catch (error) {
      console.error("authUser: ", error);
    }
  };
};

export const setUsers = ({ users }) => {
  return {
    type: types.SET_USERS,
    users,
  };
};

export const setCurrentUser = (currentUser) => {
  return {
    type: types.SET_CURRENT_USER,
    currentUser,
  };
};

export const subscribeToUser = (subscribedUser) => {
  return {
    type: types.SUBSCRIBE_TO_USER,
    subscribedUser,
  };
};

createSubscriptions([
  {
    query: socketActions.USER_JOINED,
    reduxAction: setUsers,
  },
  {
    query: socketActions.USER_LEFT,
    reduxAction: setUsers,
  },
]);
