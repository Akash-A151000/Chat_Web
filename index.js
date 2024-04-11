const chatRoutes = require('./routes/chatRoute');
const userRoutes = require('./routes/userRoutes');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');
const { createMessageFiles } = require('./controllers/chatController');
const { fileURLToPath } = require('url');

const { app, server, express } = require('./socket');

const cors = require('cors');
const connectDb = require('./db');

const PORT = 3001 || process.env.PORT;

app.use(express.json());
app.use(cors());
app.use('/public', express.static(path.join(__dirname, 'public')));
dotenv.config();
connectDb();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/assets/upload');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

app.post(
  '/users/messages/file',
  upload.single('selectedfile'),
  createMessageFiles
);

app.use('/auth', userRoutes);
app.use('/users', chatRoutes);

app.get('/api/check-server', (req, res) => {
  res.sendStatus(200);
});

server.listen(PORT, () => {
  console.log(`Server running at port ${PORT}`);
});
