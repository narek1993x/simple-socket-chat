const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RoomSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  messages: [
    {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Message",
    },
  ],
});

let RoomModel;

RoomSchema.statics.createRoom = async function (params) {
  const { name, userId } = params;

  try {
    const newRoom = await new RoomModel({ name, createdBy: userId }).save();
    return newRoom;
  } catch (error) {
    console.error("error when create new room", error);
  }
};

RoomModel = mongoose.model("Room", RoomSchema);

module.exports = {
  RoomModel,
  RoomSchema,
};
