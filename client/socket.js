import io from 'socket.io-client';

const wsUri = 'ws://localhost:3001/';
const socket = io(wsUri);

const socketApi = {};
const callbacks = {};

const createEmitter = (emitAction) => {
  socketApi[emitAction] = (requestData) => {
    return new Promise((resolve, reject) => {
      callbacks[emitAction] = function(response) {
        if (response.response) {
          return resolve(response.response);
        }
        reject(errorObject);
      };

      const emitData = {
        body: requestData,
        action: emitAction,
      };
    
      socket.emit('query', emitData);
    }).catch((error) => {
      throw error;
      console.info('socket error ', error);
    });
  };
}

export const addMethod = (name) => {
  createEmitter(name);
};

export const request = (name, data) => {
  if (!socketApi[name]) {
    throw `Socket action ${name} is not defined`;
  }
  return socketApi[name].call(null, data);
};

// socket.on('response', (response) => {
//   try {
//     if (callbacks[response.action]) {
//       callbacks[response.action](response);
//       delete callbacks[response.action];
//     } else {
//       throw `CALLBACK WAS NOT FOUND${JSON.stringify(response)}`;
//     }
//   } catch (err) {
//     console.log('socket response err: ', err);
//   }
// });

export default socket;
