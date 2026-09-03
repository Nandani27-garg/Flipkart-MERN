const mongoose = require('mongoose');

mongoose.set('strictQuery', false);

const connectDatabase = async () => {
    try {
        const MONGO_URI = process.env.MONGO_URI;

        if (!MONGO_URI) {
            throw new Error('MONGO_URI is not defined in environment variables');
        }

        await mongoose.connect(MONGO_URI);
        console.log('Mongoose Connected');
    } catch (error) {
        console.error('MongoDB connection failed:', error.message);
        process.exit(1);
    }
};

module.exports = connectDatabase;
