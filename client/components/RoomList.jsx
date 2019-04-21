import React, { memo } from 'react';

const RoomList = memo(({ rooms, subscribeToRoom, currentRoomId }) => {
  return (
    <div className="room-list">
      <ul>
        <h3>Rooms</h3>
        {rooms.map(({ _id, name }) => {
          const isActive = currentRoomId === _id;
          return (
            <li key={_id} className={`room ${isActive && 'active'}`}>
              <a href="#" onClick={() => subscribeToRoom({ id: _id, roomName: name })}>
                {name}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
});

export default RoomList;
