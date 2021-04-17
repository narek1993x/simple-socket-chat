import React, { memo, useState } from "react";

const NewRoomForm = memo((props) => {
  const [roomName, setRoomName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    props.addRoom(roomName);
    setRoomName("");
  };

  return (
    <div className="new-room-form">
      <form onSubmit={handleSubmit}>
        <input
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          type="text"
          placeholder="Create a room"
          required
        />
        <button id="create-room-btn" type="submit">
          +
        </button>
      </form>
    </div>
  );
});

export default NewRoomForm;
