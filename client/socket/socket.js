import io from 'socket.io-client';

const wsUri = 'ws://localhost:3001';
const socket = io.connect(wsUri, { secure: true });

const callbacks = {};

let x = 0;
const guid = () => {
  if (x === 50000) x = 0;
  return x++;
}

const createQueryData = (body, action, frontEndId, token) => ({
  action,
  body,
  frontEndId,
  ...(token ? { token } : {})
})

export const socketQuery = (body, queryAction) => {
  const frontEndId = guid();
  const token = localStorage.getItem('userToken');
  const queryData = createQueryData(body, queryAction, frontEndId, token);

  socket.emit('query', queryData);

  return new Promise((resolve, reject) => {
    callbacks[frontEndId] = (response) => {
      if (response) {
        return resolve(response);
      }
      reject(`UNHANDLED ERROR IN "${queryAction}" ACTION`);
    };
  }).catch((error) => {
    throw error;
    console.info('socket error ', error);
  });
};

socket.on('response', ({ action, response, frontEndId }, ) => {
  try {
    if (callbacks[frontEndId]) {
      callbacks[frontEndId](response);
      delete callbacks[frontEndId];
    } else {
      throw `CALLBACK WAS NOT FOUND "${action}" ${JSON.stringify(response)}`;
    }
  } catch (err) {
    console.log('socket response err: ', err);
  }
});

export default socket;
