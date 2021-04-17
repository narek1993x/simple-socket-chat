import * as types from "./actionTypes";
import { updateObject } from "../../helpers/utils";

const initialState = {
  error: "",
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case types.SET_ERROR:
      return updateObject(state, { error: action.error });
    case types.CLEAR_ERROR:
      return updateObject(state, { error: "" });
    default:
      return state;
  }
};

export default reducer;
