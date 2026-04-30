import 'dotenv/config';
import app from './app.js';
import connectDB from './config/db.js';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
  },
});

app.set('io', io);

io.on('connection', (socket) => {
  socket.on('join', ({ userId }) => {
    if (userId) socket.join(String(userId));
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
