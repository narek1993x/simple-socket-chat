import React from 'react';
import ReactDOM from 'react-dom';
import socket from './socket';
import './index.styl';

import RoomList from './components/RoomList';
import OnlineUserList from './components/OnlineUserList';
import MessageList from './components/MessageList';
import SendMessageForm from './components/SendMessageForm';
import NewRoomForm from './components/NewRoomForm';
import Auth from './components/Auth';

class Root extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      messages: [],
      privateMessages: [],
      rooms: [],
      users: [],
      currentUser: {},
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
    const userToken = localStorage.getItem('userToken');
    if (userToken) {
      this.handleUserAuthWithToken(userToken);
    } else {
      this.authInputRef.current.focus();
    }

    socket.on('response', ({ action, response, error }) => {
      switch (action) {
        case 'message':
          return this.setNewItemByKey(response, 'messages');
        case 'private-message':
          return this.setNewItemByKey(response, 'privateMessages');
        case 'room':
          return this.setNewItemByKey(response, 'rooms');
        case 'subscribe room':
          return this.setState({ messages: response.messages });
        case 'subscribe user':
          return this.setState({ privateMessages: response.privateMessages });
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

    this.setState({
      users,
      rooms,
      currentUser,
      username,
      isUserNameSet: !!username,
      error: ''
    });
  };

  userJoinLeftHandler = ({ users }) => {
    this.setState({ users });
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
    socket.emit('query', emitData);
    this.setState({ roomId: id, roomName, messages: [], subscribedUser: null });
  };

  subscribeToUser = (user) => {
    const emitData = {
      action: 'subscribe user',
      body: {
        id: user._id
      }
    };
    socket.emit('query', emitData);
    this.setState({
      subscribedUser: user,
      privateMessages: [],
      roomId: null,
      roomName: ''
    });
  };

  typeHandler = ({ username, roomName = '', direct }, stopTyping) => {
    const typeRoom = this.state.rooms.find((r) => r.name === roomName);
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
    const { username, currentUser, roomName, roomId, subscribedUser } = this.state;

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
    this.setNewItemByKey({ message, username }, newItemKey);
    socket.emit('query', emitData);
  };

  createRoom = (roomName) => {
    const { currentUser } = this.state;

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

  setNewItemByKey = (item, key) => {
    if (!item) return;

    this.setState((prevState) => ({
      [key]: [...prevState[key], item],
      breakTypingAnimation: ['messages', 'privateMessages'].includes(key)
    }));
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

    // this.setState({ isUserNameSet: true, username });
    // !fromStorage && localStorage.setItem('username', username);
    socket.emit('query', emitData);
  };

  render() {
    const {
      messages,
      privateMessages,
      rooms,
      roomId,
      subscribedUser,
      roomName,
      users,
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
            rooms={rooms}
            currentRoomId={roomId}
            subscribeToRoom={this.subscribeToRoom}
          />
          <OnlineUserList
            users={users}
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
            privateMessages={privateMessages}
            messages={messages}
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

ReactDOM.render(<Root />, document.querySelector('#root'));
