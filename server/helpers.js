const mongoose = require('mongoose');

const User = mongoose.model('User');
const Message = mongoose.model('Message');
const Room = mongoose.model('Room');

const jwt = require('jsonwebtoken');

// Verify JWT Token passed from client
const getUser = async (token) => {
  if (token) {
    try {
      return await jwt.verify(token, process.env.SECRET);
    } catch (error) {
      throw new AuthenticationError('Your session has ended. Please sign in again.');
    }
  }
};

module.exports = {
  loginSocket: async function(socket, token, isFromToken) {
    const user = await getUser(token);

    if (isFromToken) {
      await User.findOneAndUpdate(
        { username: user.username },
        { $set: { online: true } },
        { new: true }
      );
    }

    const users = await User.find({});
    const rooms = await Room.find({});

    let currentUser;
    if (user && user.username) {
      currentUser = users.find((u) => u.username === user.username);
    }

    socket.emit('response', {
      action: 'login',
      response: {
        users,
        rooms,
        currentUser,
        token
      }
    });

    socket.broadcast.emit('response', {
      action: 'user joined',
      response: {
        users
      }
    });

    return currentUser;
  }
};
