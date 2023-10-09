require('dotenv').config();

const express = require('express');
const expressLayout = require('express-ejs-layouts');
const methodOverride = require('method-override');
const { flash } = require('express-flash-message');
const session = require('express-session')
const connectDB = require('./server/config/db');
const fileUpload = require('express-fileupload');

const socket = require('socket.io');
const http = require('http');

const app = express();
const port = 3000 || process.env.PORT;


// Connect to Database
connectDB();

app.use(express.urlencoded({ extended : true }));
app.use(express.json());
app.use(methodOverride('_method'));

// Static files
app.use(express.static('public'));


// Express Session
app.use(
    session({
      secret: 'secret',
      resave: true,
      saveUninitialized: true,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      }
    })
  );

// Flash Messages
app.use(flash({ sessionKeyName: 'flashMessage' }));

app.use(fileUpload());
app.use(expressLayout);

//Templating Engine
app.set('layout', './layouts/main');
app.set('view engine', 'ejs');

//Routes
const routes = require('./server/routes/customer.js');
app.use('/', routes);

// // Home
// app.get('/', (req,res) => {
//     const locals = {
//         title: 'NodeJs',
//         description: 'Free NodeJs User Management System'
//     }
//     res.render('index', locals);
// });
//https://www.youtube.com/watch?v=EsJXOllG3ZE


// Handle 404
app.get('*', (req,res) => {
    res.status(404).render('404');
});

const server = app.listen(port, ()=> console.log(`Listening to port ${port}`));

const io = socket(server);


io.on('connection', (socket) => {
  
  const currentDate = new Date();

  console.log('User connected id = ' + socket.id + ' ' + currentDate);
  
  socket.on('updateEmployee', () => {

    console.log("Received from admin");
    // Emit a 'refreshEmployees' event to notify the dashboard
    io.emit('refreshEmployees');
  });

});

