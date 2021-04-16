import * as types from "./actionTypes";
import { updateObject } from "../../helpers/utils";

const initialState = {
  rooms: [],
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case types.SET_ROOMS:
      return updateObject(state, { rooms: action.rooms });
    case types.SET_NEW_ROOM:
      return updateObject(state, { rooms: [...state.rooms, action.newRoom] });
    default:
      return state;
  }
};

export default reducer;
