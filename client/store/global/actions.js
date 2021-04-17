import * as types from "./actionTypes";
import * as socketActions from "../../socket/socketActions";
import { createSubscriptions } from "../../socket/socket";

export const clearError = () => {
  return {
    type: types.CLEAR_ERROR,
  };
};

createSubscriptions([
  {
    query: socketActions.ERROR,
  },
]);
