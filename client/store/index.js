import { combineReducers } from 'redux';
import message from './message/reducer';
import room from './room/reducer';
import user from './user/reducer';

export default combineReducers({
  message,
  room,
  user
})