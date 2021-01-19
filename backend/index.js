const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 3000;
const group_router = require('./routes/group');
const auth_router = require('./routes/auth');
const user_router = require('./routes/user');
const booking_router = require('./routes/booking');

const mongoose = require('mongoose');
require('dotenv').config();

// middlewares
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send('Hello World!')
  });

app.use('/api/group', group_router);
app.use('/api/auth', auth_router);
app.use('/api/user', user_router);
app.use('/api/booking', booking_router);

const connection = process.env.CONNECTION_URI;
mongoose.connect(connection,{ useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false})
    .then(() => {
        console.log("Database Connected Successfully");
        app.listen(port, () => {
            console.log(`Kesari app listening at http://localhost:${port}`)
          });
    })
    .catch(err => console.log(err));