const { UserModel } = require("../models/User");

class UserController {
  static async getAll() {
    return await UserModel.find({});
  }

  static async disconnect(username) {
    await UserModel.findOneAndUpdate({ username }, { $set: { online: false } }, { new: true });
  }

  static async getPrivateMessages(userId) {
    return await UserModel.findById(userId).populate({
      path: "privateMessages",
      model: "Message",
      populate: {
        path: "createdBy",
        model: "User",
      },
    });
  }

  static async signin({ username, password }) {
    return await UserModel.signin({ username, password });
  }

  static async signup({ username, password, email }) {
    return await UserModel.signup({ username, password, email });
  }
}

module.exports = UserController;
