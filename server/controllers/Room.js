const { RoomModel } = require("../models/Room");

class RoomController {
  static async getAll() {
    return await RoomModel.find({});
  }

  static async addRoom(params) {
    return await RoomModel.addRoom(params);
  }

  static async getRoom(roomId) {
    return await RoomModel.findById(roomId).populate({
      path: "messages",
      model: "Message",
      populate: {
        path: "createdBy",
        model: "User",
      },
    });
  }
}

module.exports = RoomController;
