import io from 'socket.io-client';

const wsUri = 'ws://localhost:3001/';
const socket = io(wsUri);

export default socket;
