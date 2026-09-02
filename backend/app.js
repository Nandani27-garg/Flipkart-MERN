const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const path = require('path');
const errorMiddleware = require('./middlewares/error');

const app = express();

// config
if (process.env.NODE_ENV !== 'production' || !process.env.MONGO_URI) {
    const env = require('dotenv').config({ path: path.join(__dirname, 'config', 'config.env') });
    if (env && env.parsed && env.parsed.MONGO_URI) {
        process.env.MONGO_URI = env.parsed.MONGO_URI;
    }
}

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());

const user = require('./routes/userRoute');
const product = require('./routes/productRoute');
const order = require('./routes/orderRoute');
const payment = require('./routes/paymentRoute');

app.use('/api/v1', user);
app.use('/api/v1', product);
app.use('/api/v1', order);
app.use('/api/v1', payment);

// error middleware
app.use(errorMiddleware);

module.exports = app;