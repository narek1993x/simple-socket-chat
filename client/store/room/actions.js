import * as types from "./actionTypes";
import { socketQuery } from "../../socket/socket";
import { createSubscriptions } from "../../socket/socket";
import { CREATE_ROOM } from "../../socket/socketActions";

export const createRoom = (body, queryAction) => {
  return async (dispatch) => {
    try {
      const newRoom = await socketQuery(body, queryAction);
      dispatch(setNewRoom(newRoom));
    } catch (error) {
      console.error("createRoom: ", error);
    }
  };
};

export const setRooms = (rooms) => {
  return {
    type: types.SET_ROOMS,
    rooms,
  };
};

export const setNewRoom = (newRoom) => {
  return {
    type: types.SET_NEW_ROOM,
    newRoom,
  };
};

createSubscriptions([
  {
    query: CREATE_ROOM,
    reduxAction: setNewRoom,
  },
]);
