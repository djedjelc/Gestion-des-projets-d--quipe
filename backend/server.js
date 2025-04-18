const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');


dotenv.config();


connectDB();


const auth = require('./routes/auth');
const users = require('./routes/users');
const projects = require('./routes/projects');
const tasks = require('./routes/tasks');

const app = express();


app.use(express.json());


app.use(cors());


app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, '..')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});


app.use('/api/auth', auth);
app.use('/api/users', users);
app.use('/api/projects', projects);
app.use('/api/tasks', tasks);


app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));


app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);


process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  
  
}); 