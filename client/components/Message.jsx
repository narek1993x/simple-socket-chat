import React from 'react';

const Message = ({ username, time, message, isCurrentUserMessage }) => (
  <div className={`message ${isCurrentUserMessage ? 'right' : ''}`}>
    <div className="message-username">
      <span>{username}</span>&nbsp;{time}
    </div>
    <div className="message-text">{message}</div>
  </div>
);

export default Message;
