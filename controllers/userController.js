const User = require('../models/User');
const Message = require('../models/Message');
const Chat = require('../models/Chat');

const registerController = async (req, res) => {
  try {
    const arr = ['icon1', 'icon2', 'icon3', 'icon4', 'icon5'];
    const randomNumber = Math.floor(Math.random() * 5);
    const { name, icon } = req.body;
    const user = await User.findOne({ name });
    if (user) return res.status(400).json({ message: 'User Already Exists' });

    const newUser = new User({
      name,
      icon: arr[randomNumber],
      online: true,
    });
    const savedUser = await newUser.save();
    res
      .status(201)
      .json({ message: 'User Created Successfully', user: savedUser });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: err.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log(req.params.userId);
    await User.findByIdAndDelete(userId);
    await Chat.deleteMany({
      $or: [{ sender: userId }, { recipient: userId }],
    });
    await Message.deleteMany({
      $or: [{ sender: userId }, { recipient: userId }],
    });
    res
      .status(200)
      .json({ message: 'User and associated messages deleted successfully' });
  } catch (error) {
    console.log(err.message);
    res.status(500).json({ message: err.message });
  }
};

const getUser = async (req, res) => {
  try {
    const { userId } = req.query;

    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ user });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { registerController, deleteUser, getUser };
