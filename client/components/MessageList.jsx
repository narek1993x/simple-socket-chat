import React from 'react';
import ReactDOM from 'react-dom';
import moment from 'moment';
import Message from './Message';

class MessageList extends React.Component {
  componentWillUpdate() {
    const node = ReactDOM.findDOMNode(this);
    this.shouldScrollToBottom =
      node.scrollTop + node.clientHeight + 100 >= node.scrollHeight;
  }

  componentDidUpdate() {
    if (this.shouldScrollToBottom) {
      const node = ReactDOM.findDOMNode(this);
      node.scrollTop = node.scrollHeight;
    }
  }

  render() {
    const {
      messages,
      privateMessages,
      currentUserId,
      typedUser,
      typingRoom,
      roomId,
      subscribedUserName,
      breakTypingAnimation
    } = this.props;
    const isType =
      (typingRoom && typingRoom._id === roomId) || subscribedUserName === typedUser;

    if (!roomId && !subscribedUserName) {
      return (
        <div className="message-list">
          <div className="join-room">&larr; Join a room!</div>
        </div>
      );
    }

    const list = subscribedUserName ? privateMessages : messages;

    return (
      <div className="message-list">
        {list.map(({ message, createdDate = Date.now(), createdBy, username }, i) => {
          const currentUsername = username || (createdBy && createdBy.username);
          return (
            <Message
              key={i}
              message={message}
              time={moment(createdDate).format('hh:mm')}
              username={currentUsername}
              isCurrentUserMessage={currentUsername === currentUserId}
            />
          );
        })}
        {!breakTypingAnimation && isType && (
          <span className="message-type" style={{ maxWidth: typedUser.length * 18 }}>
            <p className="type">...{typedUser} is typing</p>
          </span>
        )}
      </div>
    );
  }
}

export default MessageList;
