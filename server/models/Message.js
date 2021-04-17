const mongoose = require("mongoose");
const { UserModel } = require("./User");
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  message: {
    type: String,
    required: true,
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
  room: {
    type: Schema.Types.ObjectId,
    required: false,
    ref: "Room",
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  isPrivateMessage: {
    type: Boolean,
    default: false,
  },
});

async function updateUserPrivateMessage(userId, messageId) {
  try {
    return await UserModel.findOneAndUpdate(
      { _id: userId },
      { $addToSet: { privateMessages: messageId } },
      { new: true },
    );
  } catch (error) {
    console.error("error when update direct user message", error);
  }
}

let MessageModel;

MessageSchema.statics.privateMessage = async function (params) {
  const { message, userId, directUserId } = params;
  if (!userId || !directUserId) return;

  try {
    const newMessage = await new MessageModel({
      message,
      isPrivateMessage: true,
      createdBy: userId,
    }).save();
    const withOwner = await MessageModel.findById(newMessage._id).populate({
      path: "createdBy",
      model: "User",
    });
    await updateUserPrivateMessage(userId, newMessage._id);
    await updateUserPrivateMessage(directUserId, newMessage._id);

    return withOwner;
  } catch (error) {
    console.error("error when create direct message and update user", error);
  }
};

MessageSchema.statics.createMessage = async function (params) {
  const { message, userId, roomId } = params;

  if (!userId || !roomId) return;
  const Room = mongoose.model("Room");

  try {
    const newMessage = await new MessageModel({
      message,
      createdBy: userId,
      room: roomId,
    }).save();
    const withOwner = await MessageModel.findById(newMessage._id).populate({
      path: "createdBy",
      model: "User",
    });
    await Room.findOneAndUpdate({ _id: roomId }, { $addToSet: { messages: newMessage._id } }, { new: true });
    return withOwner;
  } catch (error) {
    console.error("error when create new message and update user", error);
  }
};

MessageModel = mongoose.model("Message", MessageSchema);

module.exports = {
  MessageModel,
  MessageSchema,
};
