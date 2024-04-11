const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    content: String,
    timestamp: {
      type: Date,
      default: Date.now,
    },
    file: {
      type: String,
    },
    isFile: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

messageSchema.pre('remove', async function (next) {
  try {
    await Message.deleteMany({
      $or: [{ sender: this._id }, { recipient: this._id }],
    });
    next();
  } catch (error) {
    next(error);
  }
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
