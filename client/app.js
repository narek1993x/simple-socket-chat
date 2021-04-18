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

import { addRoom } from "./store/room/actions";
import { authUser, subscribeToUser } from "./store/user/actions";
import { setMessages, setPrivateMessages, addNewMessageByKey } from "./store/message/actions";

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      roomName: "",
      roomId: null,
      isUserNameSet: false,
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
  };

  subscribeToRoom = ({ roomName, id }) => {
    if (this.state.roomName) {
      socket.emit("query", {
        action: socketActions.LEAVE_ROOM,
        body: {
          roomName: this.state.roomName,
        },
      });
    }
    const emitData = {
      action: socketActions.SUBSCRIBE_ROOM,
      body: {
        roomName,
        id,
      },
    };
    this.setState({ roomId: id, roomName });
    this.props.dispatch(setMessages([]));
    this.props.dispatch(subscribeToUser(null));

    socket.emit("query", emitData);
  };

  handleSubscribeToUser = (user) => {
    const { currentUser } = this.props;

    const emitData = {
      action: socketActions.SUBSCRIBE_USER,
      body: {
        id: user._id,
        currentUserId: currentUser._id,
      },
    };

    this.setState({
      roomId: null,
      roomName: "",
    });

    this.props.dispatch(setPrivateMessages([]));
    this.props.dispatch(subscribeToUser(user));
    socket.emit("query", emitData);
  };

  sendMessage = (message) => {
    const { roomName, roomId } = this.state;
    const { currentUser, username, subscribedUser } = this.props;

    if (!message) return;

    let emitData = {
      action: socketActions.MESSAGE,
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
          username: subscribedUser.username,
          userId: currentUser._id,
        },
      };
    }

    const newItemKey = subscribedUser && subscribedUser._id ? "privateMessages" : "messages";
    this.props.dispatch(addNewMessageByKey({ message, username }, newItemKey));
    socket.emit("query", emitData);
  };

  addRoom = (roomName) => {
    const { dispatch, currentUser } = this.props;

    if (!roomName) return;

    const body = {
      name: roomName,
      userId: currentUser._id,
    };

    dispatch(addRoom(body, socketActions.ADD_ROOM));
  };

  handleUserAuth = ({ username, password, email, isSignin }) => {
    if (!username || !password || (!isSignin && !email)) return;

    const body = { isSignin, username, password, ...(!isSignin ? { email } : {}) };

    this.props.dispatch(authUser(body, socketActions.LOGIN));
  };

  render() {
    const { roomId, roomName } = this.state;

    const { isAuthenticated, subscribedUser, username } = this.props;

    const subscribedUserId = subscribedUser && subscribedUser._id;
    const subscribedUsername = subscribedUser && subscribedUser.username;

    let content = <Auth authInputRef={this.authInputRef} onHandleUserAuth={this.handleUserAuth} />;

    if (isAuthenticated) {
      content = (
        <div className="app">
          <RoomList currentRoomId={roomId} subscribeToRoom={this.subscribeToRoom} />
          <OnlineUserList
            username={username}
            subscribedUser={subscribedUser}
            subscribeToUser={this.handleSubscribeToUser}
          />
          <MessageList roomId={roomId} subscribedUsername={subscribedUsername} currentUserId={username} />
          <SendMessageForm
            disabled={!roomId && !subscribedUserId}
            sendMessage={this.sendMessage}
            roomName={roomName}
            subscribedUsername={subscribedUsername}
          />
          <NewRoomForm addRoom={this.addRoom} />
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
  subscribedUser: state.user.subscribedUser,
}))(App);
