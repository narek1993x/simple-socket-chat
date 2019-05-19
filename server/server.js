require('now-env');
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
const models = require('./models');
const { loginSocket } = require('./helpers');

const User = mongoose.model('User');
const Message = mongoose.model('Message');
const Room = mongoose.model('Room');

// Local DB
// const MONGO_URI = `mongodb://localhost:27017/simple-socket-chat`;
const OPTS = {
  useNewUrlParser: true,
  useCreateIndex: true
};

if (!process.env.MONGO_URI) {
  throw new Error('You must provide a MongoLab URI');
};

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGO_URI, OPTS);
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
};

async function requestMaker(Model, action, params, username) {
  try {
    return await Model[action](params);
  } catch (error) {
    io.sockets.connected[clients[username].socket].emit('response', {
      action: 'error',
      error: error.toString()
    });
    throw error;
  }
};

io.origins(['http://localhost:3000']);

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

  socket.on('query', async ({ action, body, frontEndId }) => {
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
      case 'create_room':
        const newRoom = await Room.createRoom(body);

        return io.emit('response', {
          action,
          response: newRoom,
          frontEndId
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
      case 'login':
        if (addedUser) return;
        socket.username = body.username.toLowerCase();

        // add new client for using direct messages
        clients[socket.username] = {
          socket: socket.id
        };

        let token;
        if (body.isSignin) {
          token = await requestMaker(
            User,
            'signinUser',
            { username: socket.username, password: body.password },
            socket.username
          );
        } else {
          token = await requestMaker(
            User,
            'signupUser',
            { username: socket.username, password: body.password, email: body.email },
            socket.username
          );
        }

        try {
          addedUser = true;
          await loginSocket(socket, token, frontEndId);
        } catch (error) {
          console.error('Error when add user: ', error);
          addedUser = false;
        }
        break;
      // Login user with token
      case 'login_with_token':
        try {
          const tokenUser = await loginSocket(socket, body.token, frontEndId, true);
          socket.username = tokenUser.username;

          clients[tokenUser.username] = {
            socket: socket.id
          };
          addedUser = true;
        } catch (error) {
          console.error('Error when login_with_token: ', error);
          addedUser = false;
        }
        break;

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
