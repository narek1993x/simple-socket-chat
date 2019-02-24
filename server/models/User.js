const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  online: {
    type: Boolean,
    default: false
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  privateMessages: [
    {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Message'
    }
  ]
});

UserSchema.statics.loginUser = async function({ username }) {
  try {
    const user = await this.findOne({ username });

    if (null === user) {
      return await new this({ username, online: true }).save();
    } else {
      return await this.findOneAndUpdate(
        { username },
        { $set: { online: true } },
        { new: true }
      );
    }
  } catch (error) {
    console.error('error when add new user', error);
  }
};

mongoose.model('User', UserSchema);
