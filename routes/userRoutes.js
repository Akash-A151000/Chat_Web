const express = require('express');
const {
  registerController,
  deleteUser,
  getUser,
} = require('../controllers/userController');

const router = express.Router();

router.post('/register', registerController);
router.delete('/delete/:userId', deleteUser);
router.get('/user', getUser);

module.exports = router;
