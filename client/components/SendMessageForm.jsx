import React, { PureComponent } from "react";
import * as socketActions from "../socket/socketActions";
import socket from "../socket/socket";

class SendMessageForm extends PureComponent {
  state = {
    message: "",
    isTyping: false,
  };

  handleChange = (e) => {
    const { subscribedUsername, roomName } = this.props;
    let body = { roomName };

    if (subscribedUsername) {
      body = {
        username: subscribedUsername,
        isDirect: true,
      };
    }

    if (this.timeOut) clearTimeout(this.timeOut);

    this.timeOut = setTimeout(() => {
      socket.emit("query", {
        action: socketActions.STOP_TYPING,
        body,
      });
      this.setState({ isTyping: false });
    }, 1000);

    !this.state.isTyping && socket.emit("query", { action: socketActions.TYPING, body });
    this.setState({ message: e.target.value, isTyping: true });
  };

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.sendMessage(this.state.message);
    this.setState({ message: "" });
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
