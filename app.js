const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');

const usersRouter = require('./routes/routeUser');
const chatsRouter = require('./routes/routeChatBox');
const messagesRouter = require('./routes/routeMessage');

const { loggingMiddleware, sessionMiddleware } = require('./utils/middleware');

const passport = require('./strategies/local-strategy');

const configureSocket = require('./socket');

const app = express();
const server = http.createServer(app); // Create an HTTP server
const io = socketIo(server, {
  cors: {
    origin: "http://your-react-native-app-ip:port",
    methods: ["GET", "POST"],
    credentials: true, // Allow credentials
  },
});




const PORT = process.env.PORT || 3030;


mongoose.connect('mongodb://localhost:27017/chat_app_db').then(() => {
  console.log('Database connected')
}).catch((err) => {
  console.log(`Error: ${err}`)
});

app.use(express.json());
app.use(cookieParser());
app.use(loggingMiddleware);
// app.use(session({
//   secret: 'tuanstran',
//   saveUninitialized: false,
//   resave: false,
//   cookie: {
//     maxAge: 60000 * 60 * 24 * 7,
//   },
//   store: MongoStore.create({
//     client: mongoose.connection.getClient(),
//   })
// }));
app.use(sessionMiddleware); // Use session middleware
app.use(passport.initialize());
app.use(passport.session());
app.use(usersRouter);
app.use(chatsRouter);
app.use(messagesRouter);

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

// Share session with Socket.io
io.use((socket, next) => {
  sessionMiddleware(socket.request, {}, () => {
    passport.initialize()(socket.request, {}, () => {
      passport.session()(socket.request, {}, () => {
        if (socket.request.user) {
          console.log(`User authenticated: ${socket.request.user._id}`);
        }
        next();
      });
    });
  });
});


// Initialize Socket.io
configureSocket(io);


server.listen(PORT, () => { console.log(`Server running on port ${PORT}`) });

