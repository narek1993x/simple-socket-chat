import React from "react";
import ReactDOM from "react-dom";
import { connect } from "react-redux";
import moment from "moment";
import Message from "./Message";

function isTypingChecker({ isTyping, typingRoomId, typingUsername, roomId, subscribedUsername }) {
  return (
    isTyping && ((typingRoomId && typingRoomId === roomId) || (typingUsername && subscribedUsername === typingUsername))
  );
}

class MessageList extends React.Component {
  componentWillUpdate() {
    const node = ReactDOM.findDOMNode(this);
    this.shouldScrollToBottom = node.scrollTop + node.clientHeight + 100 >= node.scrollHeight;
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
      typingUsername,
      typingRoomId,
      roomId,
      subscribedUsername,
      isTyping,
    } = this.props;

    const isType = isTypingChecker({
      isTyping,
      typingRoomId,
      typingUsername,
      roomId,
      subscribedUsername,
    });

    if (!roomId && !subscribedUsername) {
      return (
        <div className="message-list">
          <div className="join-room">&larr; Join a room!</div>
        </div>
      );
    }

    const list = subscribedUsername ? privateMessages : messages;

    return (
      <div className="message-list">
        {list.map(({ message, createdDate = Date.now(), createdBy, username }, i) => {
          const currentUsername = username || (createdBy && createdBy.username);
          return (
            <Message
              key={i}
              message={message}
              time={moment(createdDate).format("hh:mm")}
              username={currentUsername}
              isCurrentUserMessage={currentUsername === currentUserId}
            />
          );
        })}
        {isType && (
          <span className="message-type" style={{ maxWidth: typingUsername.length * 18 }}>
            <p className="type">...{typingUsername} is typing</p>
          </span>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  messages: state.message.messages,
  privateMessages: state.message.privateMessages,
  typingUsername: state.message.typingUsername,
  typingRoomId: state.message.typingRoomId,
  isTyping: state.message.isTyping,
});

export default connect(mapStateToProps)(MessageList);
