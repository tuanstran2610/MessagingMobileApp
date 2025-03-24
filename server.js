require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();



mongoose.connect(process.env.MONGO_URI);
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error'));
db.once('open', () => {
    console.log('Database connected')
})


app.get('/', (req, res) => {
    res.send('hello word')
})


const PORT = 5050;
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});




