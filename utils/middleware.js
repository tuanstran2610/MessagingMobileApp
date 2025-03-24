import session from 'express-session';
import MongoStore from 'connect-mongo';

export const sessionMiddleware = session({
    secret: 'tuanstran',
    saveUninitialized: false,
    resave: false,
    cookie: {
        maxAge: 60000 * 60 * 24 * 7,
    },
    store: MongoStore.create(
        {
            mongoUrl: 'mongodb://localhost:27017/chat_app_db', // Explicitly provide URL
        }
    )
});



export const loggingMiddleware = (req, res, next) => {
    console.log(`${req.method} - ${req.url}`);
    next();
}
