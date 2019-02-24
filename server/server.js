const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
const models = require('./models');

const User = mongoose.model('User');
const Message = mongoose.model('Message');
const Room = mongoose.model('Room');

// Local DB
const MONGO_URI = `mongodb://localhost:27017/simple-socket-chat`;
const OPTS = {
  useNewUrlParser: true,
  useCreateIndex: true
};

if (!MONGO_URI) {
  throw new Error('You must provide a MongoLab URI');
}

mongoose.Promise = global.Promise;
mongoose.connect(MONGO_URI, OPTS);
mongoose.connection
  .once('open', () => console.log('Connected to MongoLab instance.'))
  .on('error', (error) => console.log('Error connecting to MongoLab:', error));

const clients = {};

function directAction(username, action, response) {
  if (clients[username]) {
    io.sockets.connected[clients[username].socket].emit('response', {
      action,
      response
    });
  } else {
    console.log('User does not exist: ' + username);
  }
}

io.on('connection', async function(socket) {
  let addedUser = false;

  socket.on('disconnect', async () => {
    if (addedUser) {
      await User.findOneAndUpdate(
        { username: socket.username },
        { $set: { online: false } },
        { new: true }
      );
      socket.broadcast.emit('response', {
        action: 'user left',
        response: {
          users: await User.find({})
        }
      });

      for (let name in clients) {
        if (clients[name].socket === socket.id) {
          delete clients[name];
          break;
        }
      }
    }
  });

  socket.on('query', async ({ action, body }) => {
    switch (action) {
      // Message sending actions
      case 'message':
        const newMessage = await Message.createMessage(body);

        return socket.to(body.roomName).emit('response', {
          action,
          response: newMessage
        });
      case 'private-message':
        const newPrivateMessage = await Message.privateMessage(body);
        return directAction(body.username, action, newPrivateMessage);

      // Create new room action
      case 'room':
        const newRoom = await Room.createRoom(body);

        return io.emit('response', {
          action,
          response: newRoom
        });

      // Subscribing actions
      case 'subscribe room':
        const currentRoom = await Room.findById(body.id).populate({
          path: 'messages',
          model: 'Message',
          populate: {
            path: 'createdBy',
            model: 'User'
          }
        });
        // Join to room
        socket.join(body.roomName);
        return socket.emit('response', {
          action,
          response: currentRoom
        });
      case 'subscribe user':
        const subscriedUser = await User.findById(body.id).populate({
          path: 'privateMessages',
          model: 'Message',
          populate: {
            path: 'createdBy',
            model: 'User'
          }
        });

        return socket.emit('response', {
          action,
          response: subscriedUser
        });
      case 'leave room':
        // Leave room
        return socket.leave(body.roomName);

      // User adding actions
      case 'add user':
        if (addedUser) return;
        socket.username = body.username;
        addedUser = true;

        // add new client for using direct messages
        clients[socket.username] = {
          socket: socket.id
        };

        await User.loginUser({ username: socket.username });
        const rooms = await Room.find({});
        const users = await User.find({});
        const currentUser = users.find((u) => u.username === socket.username);

        socket.emit('response', {
          action: 'login',
          response: {
            users,
            rooms,
            currentUser
          }
        });

        return socket.broadcast.emit('response', {
          action: 'user joined',
          response: {
            users
          }
        });

      // Type handling actions
      case 'typing':
        if (body.isDirect) {
          return directAction(body.username, action, {
            username: socket.username,
            direct: true
          });
        }
        return socket.to(body.roomName).emit('response', {
          action,
          response: {
            username: socket.username,
            roomName: body.roomName
          }
        });
      case 'stop typing':
        if (body.isDirect) {
          return directAction(body.username, action, {
            username: socket.username,
            direct: true
          });
        }
        return socket.to(body.roomName).emit('response', {
          action,
          response: {
            username: socket.username,
            roomName: body.roomName
          }
        });

      default:
        break;
    }
  });
});

module.exports = http;
