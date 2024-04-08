const express = require('express');
const {
  onlineUsers,
  createMessage,
  getMessages,
  toggleOnline,
  createChat,
  getChats,
} = require('../controllers/chatController');
const router = express.Router();

router.get('/online/:userId', onlineUsers);
router.post('/message', createMessage);
router.get('/messages', getMessages);

router.put('/online/:userId', toggleOnline);

router.post('/chat', createChat);
router.get('/chats/:userId', getChats);

module.exports = router;
