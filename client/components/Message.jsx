import React, { memo } from 'react';

const Message = memo(({ username, time, message, isCurrentUserMessage }) => (
  <div className={`message ${isCurrentUserMessage ? 'right' : ''}`}>
    <div className="message-username">
      <span>{username}</span>&nbsp;{time}
    </div>
    <div className="message-text">{message}</div>
  </div>
));

export default Message;
