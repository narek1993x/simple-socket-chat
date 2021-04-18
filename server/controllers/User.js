const { UserModel } = require("../models/User");

class UserController {
  static async getAll() {
    return await UserModel.find({});
  }

  static async updateStatus(username, online) {
    await UserModel.findOneAndUpdate({ username }, { $set: { online } }, { new: true });
  }

  static async getUserPrivateMessages(userId, currentUserId) {
    const currentUserPM = await UserModel.findById(currentUserId)
      .select("privateMessages")
      .populate({
        path: "privateMessages",
        model: "Message",
        match: { $or: [{ createdBy: userId }, { to: userId }] },
        populate: {
          path: "createdBy",
          model: "User",
          select: "username",
        },
      });

    return currentUserPM.privateMessages;
  }

  static async signin({ username, password }) {
    return await UserModel.signin({ username, password });
  }

  static async signup({ username, password, email }) {
    return await UserModel.signup({ username, password, email });
  }
}

module.exports = UserController;
