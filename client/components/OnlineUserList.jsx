import React from 'react';

const OnlineUserList = (props) => {
  const {
    users,
    username,
    subscribeToUser,
    subscribedUser = {},
    directTyping,
    breakTypingAnimation,
    typedUser
  } = props;
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
          const isType = user.username === typedUser && directTyping;
          return (
            <li key={user._id} className={`user ${selected ? 'selected' : ''}`}>
              <a href="#" onClick={() => !current && subscribeToUser(user)}>
                <span className={`status${user.online ? ' online' : ''}`}>{user.online ? '●' : '○'}</span>
                {user.username} {current && ' (you)'}
                {!breakTypingAnimation && isType && <p className="type">......</p>}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default OnlineUserList;
