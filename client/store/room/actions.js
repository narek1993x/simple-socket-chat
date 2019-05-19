import * as types from './actionTypes';
import { socketQuery } from '../../socket/socket';

export const createRoom = (body, queryAction) => {
  return async () => {
    try {
      await socketQuery(body, queryAction);
    } catch (error) {
      console.error('createRoom: ', error);
    }
  }
}

export const setRooms = (rooms) => {
  return {
    type: types.SET_ROOMS,
    rooms
  }
}

export const setNewRoom = (newRoom) => {
  return {
    type: types.SET_NEW_ROOM,
    newRoom
  }
}
