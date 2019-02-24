import React from 'react';
import ReactDOM from 'react-dom';
import socket from './socket';
import './index.styl';

import RoomList from './components/RoomList';
import OnlineUserList from './components/OnlineUserList';
import MessageList from './components/MessageList';
import SendMessageForm from './components/SendMessageForm';
import NewRoomForm from './components/NewRoomForm';

class Root extends React.Component {
  state = {
    messages: [],
    privateMessages: [],
    rooms: [],
    users: [],
    currentUser: {},
    subscribedUser: null,
    username: localStorage.getItem('username') || '',
    typedUser: '',
    directTyping: false,
    typingRoom: null,
    roomName: '',
    roomId: null,
    isUserNameSet: false
  };

  componentDidMount = () => {
    if (this.state.username) {
      this.setUserName('', true);
    } else {
      this.username.focus();
    }

    socket.on('response', ({ action, response }) => {
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
        default:
          break;
      }
    });
  };

  loginHandler = ({ users, rooms, currentUser }) => {
    this.setState({ users, rooms, currentUser });
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

  typeHandler = ({ username, roomName = '' }, stopTyping) => {
    const typeRoom = this.state.rooms.find((r) => r.name === roomName);
    const typedUser = stopTyping ? '' : username;
    const typingRoom = stopTyping ? {} : typeRoom;

    this.setState({ typedUser, typingRoom });
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
      [key]: [...prevState[key], item]
    }));
  };

  setUserName = (e, fromStorage) => {
    if (e.keyCode === 13 || fromStorage) {
      const username = this.username.value || this.state.username;

      const emitData = {
        action: 'add user',
        body: { username }
      };

      this.setState({ isUserNameSet: true, username });
      !fromStorage && localStorage.setItem('username', username);
      socket.emit('query', emitData);
    }
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
      isUserNameSet
    } = this.state;

    const subscribedUserId = subscribedUser && subscribedUser._id;
    const subscribedUserName = subscribedUser && subscribedUser.username;

    let content = (
      <div className="username-input">
        <h2>What's your nickname?</h2>
        <input
          type="text"
          ref={(node) => (this.username = node)}
          onKeyDown={this.setUserName}
        />
      </div>
    );

    if (isUserNameSet) {
      content = (
        <React.Fragment>
          <RoomList
            rooms={rooms}
            currentRoomId={roomId}
            subscribeToRoom={this.subscribeToRoom}
          />
          <OnlineUserList
            users={users}
            username={username}
            subscribedUser={subscribedUser}
            subscribeToUser={this.subscribeToUser}
          />
          <MessageList
            roomId={roomId}
            subscribedUserName={subscribedUserName}
            typedUser={typedUser}
            typingRoom={typingRoom}
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
        </React.Fragment>
      );
    }

    return <div className="app">{content}</div>;
  }
}

ReactDOM.render(<Root />, document.querySelector('#root'));
