import React, { memo } from "react";
import { connect } from "react-redux";

const OnlineUserList = memo((props) => {
  const { users, username, subscribeToUser, subscribedUser = {}, isDirectTyping, typingUsername, isTyping } = props;

  const orderedUsers = [...users].sort((a, b) => a.id - b.id);
  const onlineUsersCount = orderedUsers.reduce((a, b) => {
    if (b.online) a++;
    return a;
  }, 0);

  return (
    <div className="online-users">
      <ul>
        <h3>Online users count: {onlineUsersCount}</h3>
        {orderedUsers.map((user) => {
          const current = user.username === username;
          const selected = subscribedUser && subscribedUser.username === user.username;
          const isType = isTyping && isDirectTyping && user.username === typingUsername;

          return (
            <li key={user._id} className={`user ${selected ? "selected" : ""}`}>
              <a href="#" onClick={() => !current && subscribeToUser(user)}>
                <span className={`status${user.online ? " online" : ""}`}>{user.online ? "●" : "○"}</span>
                {user.username} {current && " (you)"}
                {isType && <p className="type">...</p>}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
});

const mapStateToProps = (state) => ({
  users: state.user.users,
  typingUsername: state.message.typingUsername,
  isDirectTyping: state.message.isDirectTyping,
  isTyping: state.message.isTyping,
});

export default connect(mapStateToProps)(OnlineUserList);
