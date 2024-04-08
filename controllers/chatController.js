const { userSockets } = require('../socket');
const User = require('../models/User');
const Message = require('../models/Message');
const Chat = require('../models/Chat');
const { getReceiverSocketId, io } = require('../socket');

const onlineUsers = async (req, res) => {
  try {
    const { userId } = await req.params;
    const onlineUsers = await User.find({ online: true, _id: { $ne: userId } });
    res.status(200).send({ online: onlineUsers });
  } catch (error) {
    console.error('Error fetching online users:', error);
    res.status(500).send('Server Error');
  }
};

const toggleOnline = async (req, res) => {
  try {
    const { userId } = req.params;
    const { online } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.online = online;
    await user.save();
    res
      .status(200)
      .json({ message: 'Online status updated successfully', user: user });
  } catch (error) {
    console.error('Error toggling online status:', error);
    res.status(500).send('Server Error');
  }
};

const createMessage = async (req, res) => {
  try {
    const { sender, recipient, content } = req.body;
    const newMessage = new Message({
      sender,
      recipient,
      content,
    });
    const savedMessage = await newMessage.save();
    const savedChat = await Chat.findOneAndUpdate(
      {
        $or: [
          { sender: sender, recipient: recipient },
          { sender: recipient, recipient: sender },
        ],
      },
      {
        lastMessage: savedMessage._id,
      },
      { upsert: true, new: true }
    ).populate({
      path: 'lastMessage',
      populate: { path: 'sender recipient' },
    });

    const recipientSocketId = getReceiverSocketId(recipient);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('receive-message', savedMessage);
      io.to(recipientSocketId).emit('receive-chat', savedChat);
    } else {
      console.log(`Recipient with ID ${recipient} is not connected.`);
    }
    res.status(201).json({ message: savedMessage, chat: savedChat });
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).send('Server Error');
  }
};

const getMessages = async (req, res) => {
  try {
    const { senderId, recipientId } = req.query;
    const messages = await Message.find({
      $or: [
        { sender: senderId, recipient: recipientId },
        { sender: recipientId, recipient: senderId },
      ],
    }).sort({ timestamp: 1 });
    res.status(200).json({ messages: messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).send('Server Error');
  }
};

const createChat = async (req, res) => {
  try {
    console.log(req.body);
    const { senderId, recipientId } = req.body;

    const existingChat = await Chat.findOne({
      $or: [
        { sender: senderId, recipient: recipientId },
        { sender: recipientId, recipient: senderId },
      ],
    }).populate({
      path: 'lastMessage',
      populate: { path: 'sender recipient' },
    });

    if (existingChat) {
      return res
        .status(200)
        .json({ message: 'Chat already exists', chat: existingChat });
    }

    const newChat = new Chat({
      sender: senderId,
      recipient: recipientId,
    });
    const savedChat = await newChat.save();
    res
      .status(201)
      .json({ message: 'Chat created successfully', chat: savedChat });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).send('Server Error');
  }
};

const getChats = async (req, res) => {
  try {
    const userId = req.params.userId;
    const chats = await Chat.find({
      $or: [{ sender: userId }, { recipient: userId }],
    }).populate({
      path: 'lastMessage',
      populate: { path: 'sender recipient' },
    });

    res.status(200).json({ chats: chats });
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).send('Server Error');
  }
};

module.exports = {
  onlineUsers,
  createMessage,
  getMessages,
  toggleOnline,
  createChat,
  getChats,
};
