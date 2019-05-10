import * as types from './actionTypes';

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
