import React, { PureComponent } from 'react';
import socket from '../socket/socket';

class SendMessageForm extends PureComponent {
  state = {
    message: '',
    isTyping: false
  };

  handleChange = (e) => {
    const { subscribedUserName, roomName } = this.props;
    let body = { roomName };

    if (subscribedUserName) {
      body = {
        username: subscribedUserName,
        isDirect: true
      };
    }

    if (this.timeOut) clearTimeout(this.timeOut);

    this.timeOut = setTimeout(() => {
      socket.emit('query', {
        action: 'stop typing',
        body
      });
      this.setState({ isTyping: false });
    }, 1000);

    !this.state.isTyping && socket.emit('query', { action: 'typing', body });
    this.setState({ message: e.target.value, isTyping: true });
  };

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.sendMessage(this.state.message);
    this.setState({ message: '' });
  };

  render() {
    return (
      <form className="send-message-form" onSubmit={this.handleSubmit}>
        <input
          disabled={this.props.disabled}
          onChange={this.handleChange}
          value={this.state.message}
          placeholder="Type your message and hit ENTER"
          type="text"
        />
      </form>
    );
  }
}

export default SendMessageForm;
