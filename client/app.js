import React from 'react';
import { connect } from 'react-redux';
import socket from './socket';
import './index.styl';

import RoomList from './components/RoomList';
import OnlineUserList from './components/OnlineUserList';
import MessageList from './components/MessageList';
import SendMessageForm from './components/SendMessageForm';
import NewRoomForm from './components/NewRoomForm';
import Auth from './components/Auth';

import { setRooms, setNewRoom } from './store/room/actions';
import { setUsers, setCurrentUser } from './store/user/actions';
import { setMessages, setPrivateMessages, addNewMessageByKey } from './store/message/actions';

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      subscribedUser: null,
      username: '',
      typedUser: '',
      directTyping: false,
      breakTypingAnimation: false,
      typingRoom: null,
      roomName: '',
      roomId: null,
      isUserNameSet: false,
      error: ''
    };

    this.authInputRef = React.createRef();
  }

  componentDidMount = () => {
    const { dispatch } = this.props;

    const userToken = localStorage.getItem('userToken');
    if (userToken) {
      this.handleUserAuthWithToken(userToken);
    } else {
      this.authInputRef.current.focus();
    }

    socket.on('response', ({ action, response, error }) => {
      switch (action) {
        case 'message':
          this.handleBreakTypeAnimation();
          return dispatch(addNewMessageByKey(response, 'messages'));
        case 'private-message':
          this.handleBreakTypeAnimation();
          return dispatch(addNewMessageByKey(response, 'privateMessages'));
        case 'room':
          return dispatch(setNewRoom(response));
        case 'subscribe room':
          return dispatch(setMessages(response.messages));
        case 'subscribe user':
          return dispatch(setPrivateMessages(response.privateMessages));
        case 'login':
          return this.loginHandler(response);
        case 'user joined':
          return this.userJoinLeftHandler(response);
        case 'user left':
          return this.userJoinLeftHandler(response);
        case 'typing':
          return this.typeHandler(response);
        case 'stop typing':
          return this.typeHandler(response, true);
        case 'error':
          return this.setState({ error });
        default:
          break;
      }
    });
  };

  loginHandler = ({ users, rooms, currentUser, token }) => {
    const username = currentUser && currentUser.username;
    if (token) {
      localStorage.setItem('userToken', token);
    }

    this.props.dispatch(setUsers(users));
    this.props.dispatch(setRooms(rooms));
    this.props.dispatch(setCurrentUser(currentUser));

    this.setState({
      username,
      isUserNameSet: !!username,
      error: ''
    });
  };

  userJoinLeftHandler = ({ users }) => {
    this.props.dispatch(setUsers(users));
  };

  subscribeToRoom = ({ roomName, id }) => {
    if (this.state.roomName) {
      socket.emit('query', {
        action: 'leave room',
        body: {
          roomName: this.state.roomName
        }
      });
    }
    const emitData = {
      action: 'subscribe room',
      body: {
        roomName,
        id
      }
    };
    this.setState({ roomId: id, roomName, messages: [], subscribedUser: null });
    this.props.dispatch(setMessages([]));
    socket.emit('query', emitData);
  };

  subscribeToUser = (user) => {
    const emitData = {
      action: 'subscribe user',
      body: {
        id: user._id
      }
    };
    this.setState({
      subscribedUser: user,
      roomId: null,
      roomName: ''
    });
    this.props.dispatch(setPrivateMessages([]));
    socket.emit('query', emitData);
  };

  typeHandler = ({ username, roomName = '', direct }, stopTyping) => {
    const typeRoom = this.props.rooms.find((r) => r.name === roomName);
    const typedUser = stopTyping ? '' : username;
    const typingRoom = stopTyping ? {} : typeRoom;

    if (direct) {
      this.setState({
        typedUser,
        directTyping: !stopTyping,
        breakTypingAnimation: false
      });
    } else {
      this.setState({ typedUser, typingRoom, breakTypingAnimation: false });
    }
  };

  sendMessage = (message) => {
    const { username, roomName, roomId, subscribedUser } = this.state;
    const { currentUser } = this.props;

    if (!message) return;

    let emitData = {
      action: 'message',
      body: {
        message,
        userId: currentUser._id,
        roomName,
        roomId
      }
    };

    if (subscribedUser && subscribedUser.username) {
      emitData = {
        action: 'private-message',
        body: {
          message,
          directUserId: subscribedUser._id,
          userId: currentUser._id,
          username: subscribedUser.username
        }
      };
    }

    const newItemKey =
      subscribedUser && subscribedUser._id ? 'privateMessages' : 'messages';
    this.props.dispatch(addNewMessageByKey({ message, username }, newItemKey))
    socket.emit('query', emitData);
  };

  createRoom = (roomName) => {
    const { currentUser } = this.props;

    if (!roomName) return;

    const emitData = {
      action: 'room',
      body: {
        name: roomName,
        userId: currentUser._id
      }
    };

    socket.emit('query', emitData);
  };

  handleUserAuthWithToken = (token) => {
    const emitData = {
      action: 'login with token',
      body: { token }
    };

    socket.emit('query', emitData);
  };

  handleUserAuth = ({ username, password, email, isSignin }) => {
    if (!username || !password || (!isSignin && !email)) return;

    const emitData = {
      action: 'add user',
      body: { isSignin, username, password, ...(!isSignin ? { email } : {}) }
    };

    socket.emit('query', emitData);
  };

  handleBreakTypeAnimation = () => {
    this.setState({ breakTypingAnimation: true });
  }

  render() {
    const {
      roomId,
      subscribedUser,
      roomName,
      username,
      typedUser,
      typingRoom,
      breakTypingAnimation,
      directTyping,
      isUserNameSet,
      error
    } = this.state;

    const subscribedUserId = subscribedUser && subscribedUser._id;
    const subscribedUserName = subscribedUser && subscribedUser.username;

    let content = (
      <Auth
        authInputRef={this.authInputRef}
        onHandleUserAuth={this.handleUserAuth}
        error={error}
      />
    );

    if (isUserNameSet) {
      content = (
        <div className="app">
          <RoomList
            currentRoomId={roomId}
            subscribeToRoom={this.subscribeToRoom}
          />
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

export default connect(state => ({
  rooms: state.room.rooms,
  currentUser: state.user.currentUser
}))(App);
