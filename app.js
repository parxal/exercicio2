const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const connection = require('./config/database');
const configPassport = require('./config/passport');
const {port, https, certs} = require('./services/https');
const MongoStore = require('connect-mongo');

var app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.set('view engine', 'ejs');

const dbString = process.env.DB_STRING;
const dbOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true
}
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: dbString,
        mongoOptions: dbOptions,
        collectionName: 'sessions'
    }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 1 // Equals 1 day (1 day * 24 hr/1 day * 60 min/1 hr * 60 sec/1 min * 1000 ms / 1 sec)
    }
}));


app.use(passport.initialize());
app.use(passport.session());

require('./routes/authRoutes')(app);

const https_server = https.createServer(certs, app).listen(port, () => {
  console.log('HTTPS server listening on: ', https_server.address());
});
