import React from "react";
import { connect } from "react-redux";
import socket from "./socket/socket";
import * as socketActions from "./socket/socketActions";

import RoomList from "./components/RoomList";
import OnlineUserList from "./components/OnlineUserList";
import MessageList from "./components/MessageList";
import SendMessageForm from "./components/SendMessageForm";
import NewRoomForm from "./components/NewRoomForm";
import Auth from "./components/Auth";

import { setNewRoom, createRoom } from "./store/room/actions";
import { authUser, setUsers } from "./store/user/actions";
import { setMessages, setPrivateMessages, addNewMessageByKey } from "./store/message/actions";

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      subscribedUser: null,
      typedUser: "",
      directTyping: false,
      breakTypingAnimation: false,
      typingRoom: null,
      roomName: "",
      roomId: null,
      isUserNameSet: false,
      error: "",
    };

    this.authInputRef = React.createRef();
  }

  componentDidMount = () => {
    const { dispatch } = this.props;

    const token = localStorage.getItem("userToken");
    if (token) {
      dispatch(authUser({ token }, socketActions.LOGIN_WITH_TOKEN));
    } else {
      this.authInputRef.current.focus();
    }

    socket.on("response", ({ action, response, error }) => {
      switch (action) {
        case socketActions.MESSAGE:
        case socketActions.PRIVATE_MESSAGE:
          return this.handleBreakTypeAnimation();
        case socketActions.CREATE_ROOM:
          return dispatch(setNewRoom(response));
        case "subscribe room":
          return dispatch(setMessages(response.messages));
        case "subscribe user":
          return dispatch(setPrivateMessages(response.privateMessages));
        case "user joined":
        case "user left":
          return this.userJoinLeftHandler(response);
        case "typing":
          return this.typeHandler(response);
        case "stop typing":
          return this.typeHandler(response, true);
        case "error":
          return this.setState({ error });
        default:
          break;
      }
    });
  };

  userJoinLeftHandler = ({ users }) => {
    this.props.dispatch(setUsers(users));
  };

  subscribeToRoom = ({ roomName, id }) => {
    if (this.state.roomName) {
      socket.emit("query", {
        action: "leave room",
        body: {
          roomName: this.state.roomName,
        },
      });
    }
    const emitData = {
      action: "subscribe room",
      body: {
        roomName,
        id,
      },
    };
    this.setState({ roomId: id, roomName, messages: [], subscribedUser: null });
    this.props.dispatch(setMessages([]));
    socket.emit("query", emitData);
  };

  subscribeToUser = (user) => {
    const emitData = {
      action: "subscribe user",
      body: {
        id: user._id,
      },
    };
    this.setState({
      subscribedUser: user,
      roomId: null,
      roomName: "",
    });
    this.props.dispatch(setPrivateMessages([]));
    socket.emit("query", emitData);
  };

  typeHandler = ({ username, roomName = "", direct }, stopTyping) => {
    const typeRoom = this.props.rooms.find((r) => r.name === roomName);
    const typedUser = stopTyping ? "" : username;
    const typingRoom = stopTyping ? {} : typeRoom;

    if (direct) {
      this.setState({
        typedUser,
        directTyping: !stopTyping,
        breakTypingAnimation: false,
      });
    } else {
      this.setState({ typedUser, typingRoom, breakTypingAnimation: false });
    }
  };

  sendMessage = (message) => {
    const { roomName, roomId, subscribedUser } = this.state;
    const { currentUser, username } = this.props;

    if (!message) return;

    let emitData = {
      action: "message",
      body: {
        message,
        userId: currentUser._id,
        roomName,
        roomId,
      },
    };

    if (subscribedUser && subscribedUser.username) {
      emitData = {
        action: socketActions.PRIVATE_MESSAGE,
        body: {
          message,
          directUserId: subscribedUser._id,
          userId: currentUser._id,
          username: subscribedUser.username,
        },
      };
    }

    const newItemKey = subscribedUser && subscribedUser._id ? "privateMessages" : "messages";
    this.props.dispatch(addNewMessageByKey({ message, username }, newItemKey));
    socket.emit("query", emitData);
  };

  createRoom = (roomName) => {
    const { dispatch, currentUser } = this.props;

    if (!roomName) return;

    const body = {
      name: roomName,
      userId: currentUser._id,
    };

    dispatch(createRoom(body, socketActions.CREATE_ROOM));
  };

  handleUserAuth = ({ username, password, email, isSignin }) => {
    if (!username || !password || (!isSignin && !email)) return;

    const body = { isSignin, username, password, ...(!isSignin ? { email } : {}) };

    this.props.dispatch(authUser(body, socketActions.LOGIN));
  };

  handleBreakTypeAnimation = () => {
    this.setState({ breakTypingAnimation: true });
  };

  handleClearError = () => {
    this.setState({ error: "" });
  };

  render() {
    const {
      roomId,
      subscribedUser,
      roomName,
      typedUser,
      typingRoom,
      breakTypingAnimation,
      directTyping,
      error,
    } = this.state;

    const { isAuthenticated, username } = this.props;

    const subscribedUserId = subscribedUser && subscribedUser._id;
    const subscribedUserName = subscribedUser && subscribedUser.username;

    let content = (
      <Auth
        authInputRef={this.authInputRef}
        onHandleUserAuth={this.handleUserAuth}
        onHandleClearError={this.handleClearError}
        error={error}
      />
    );

    if (isAuthenticated) {
      content = (
        <div className="app">
          <RoomList currentRoomId={roomId} subscribeToRoom={this.subscribeToRoom} />
          <OnlineUserList
            username={username}
            directTyping={directTyping}
            breakTypingAnimation={breakTypingAnimation}
            typedUser={typedUser}
            subscribedUser={subscribedUser}
            subscribeToUser={this.subscribeToUser}
          />
          <MessageList
            roomId={roomId}
            subscribedUserName={subscribedUserName}
            typedUser={typedUser}
            typingRoom={typingRoom}
            breakTypingAnimation={breakTypingAnimation}
            currentUserId={username}
          />
          <SendMessageForm
            disabled={!roomId && !subscribedUserId}
            sendMessage={this.sendMessage}
            roomName={roomName}
            subscribedUserName={subscribedUserName}
          />
          <NewRoomForm createRoom={this.createRoom} />
        </div>
      );
    }

    return content;
  }
}

export default connect((state) => ({
  rooms: state.room.rooms,
  currentUser: state.user.currentUser,
  username: state.user.currentUser.username,
  isAuthenticated: state.user.isAuthenticated,
}))(App);
