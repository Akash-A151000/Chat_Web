const chatRoutes = require('./routes/chatRoute');
const userRoutes = require('./routes/userRoutes');
const dotenv = require('dotenv');
const path = require('path');
const User = require('./models/User');
const Chat = require('./models/Chat');
const Message = require('./models/Message');

const { app, server, express } = require('./socket');

const cors = require('cors');
const connectDb = require('./db');

const PORT = 3001 || process.env.PORT;

app.use(express.json());
app.use(cors());
app.use('/public', express.static(path.join(__dirname, 'public')));
dotenv.config();
connectDb();

app.use('/auth', userRoutes);
app.use('/users', chatRoutes);

app.get('/api/check-server', (req, res) => {
  res.sendStatus(200);
});

server.listen(PORT, () => {
  console.log(`Server running at port ${PORT}`);
});
