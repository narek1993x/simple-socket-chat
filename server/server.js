require("now-env");
const app = require("express")();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);

const UserController = require("./controllers/User");
const RoomController = require("./controllers/Room");
const MessageController = require("./controllers/Message");

const { loginSocket } = require("./helpers");

// Local DB
// const MONGO_URI = `mongodb://localhost:27017/simple-socket-chat`;
const OPTS = {
  useNewUrlParser: true,
  useCreateIndex: true,
};

if (!process.env.MONGO_URI) {
  throw new Error("You must provide a MongoLab URI");
}

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGO_URI, OPTS);
mongoose.connection
  .once("open", () => console.log("Connected to MongoLab instance."))
  .on("error", (error) => console.log("Error connecting to MongoLab:", error));

const clients = {};

function directAction(username, action, response) {
  if (clients[username]) {
    io.sockets.connected[clients[username].socket].emit("response", {
      action,
      response,
    });
  } else {
    console.log("User does not exist: " + username);
  }
}

async function requestMaker(Model, action, params, username) {
  try {
    return await Model[action](params);
  } catch (error) {
    io.sockets.connected[clients[username].socket].emit("response", {
      action: "error",
      error: error.toString(),
    });
    throw error;
  }
}

io.origins(["http://localhost:3000"]);

io.on("connection", async function (socket) {
  let addedUser = false;

  socket.on("disconnect", async () => {
    if (addedUser) {
      await UserController.disconnect(socket.username);

      socket.broadcast.emit("response", {
        action: "user left",
        response: {
          users: await UserController.getAll(),
        },
      });

      for (let name in clients) {
        if (clients[name].socket === socket.id) {
          delete clients[name];
          break;
        }
      }
    }
  });

  socket.on("query", async ({ action, body, frontEndId }) => {
    switch (action) {
      case "message":
        const newMessage = await MessageController.addMessage(body);

        return socket.to(body.roomName).emit("response", {
          action,
          response: newMessage,
        });
      case "private-message":
        const newPrivateMessage = await MessageController.addPrivateMessage(body);

        return directAction(body.username, action, newPrivateMessage);
      case "add_room":
        const newRoom = await RoomController.addRoom(body);

        return io.emit("response", {
          action,
          response: newRoom,
          frontEndId,
        });
      case "subscribe room":
        const currentRoom = await RoomController.getRoom(body.id);
        socket.join(body.roomName);

        return socket.emit("response", {
          action,
          response: currentRoom,
        });
      case "subscribe user":
        const subscribedUser = await UserController.getUser(body.id);

        return socket.emit("response", {
          action,
          response: subscribedUser,
        });
      case "leave room":
        return socket.leave(body.roomName);

      case "login":
        if (addedUser) return;
        socket.username = body.username.toLowerCase();

        // add new client for using direct messages
        clients[socket.username] = {
          socket: socket.id,
        };

        let token;
        if (body.isSignin) {
          token = await requestMaker(
            UserController,
            "signin",
            { username: socket.username, password: body.password },
            socket.username,
          );
        } else {
          token = await requestMaker(
            UserController,
            "signup",
            { username: socket.username, password: body.password, email: body.email },
            socket.username,
          );
        }

        try {
          addedUser = true;
          await loginSocket(socket, token, frontEndId);
        } catch (error) {
          console.error("Error when add user: ", error);
          addedUser = false;
        }
        break;
      case "login_with_token":
        try {
          const tokenUser = await loginSocket(socket, body.token, frontEndId, true);
          socket.username = tokenUser.username;

          clients[tokenUser.username] = {
            socket: socket.id,
          };
          addedUser = true;
        } catch (error) {
          console.error("Error when login_with_token: ", error);
          addedUser = false;
        }
        break;

      case "typing":
        if (body.isDirect) {
          return directAction(body.username, action, {
            username: socket.username,
            direct: true,
          });
        }

        return socket.to(body.roomName).emit("response", {
          action,
          response: {
            username: socket.username,
            roomName: body.roomName,
          },
        });
      case "stop typing":
        if (body.isDirect) {
          return directAction(body.username, action, {
            username: socket.username,
            direct: true,
          });
        }
        return socket.to(body.roomName).emit("response", {
          action,
          response: {
            username: socket.username,
            roomName: body.roomName,
          },
        });

      default:
        break;
    }
  });
});

module.exports = http;
