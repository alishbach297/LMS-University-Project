require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/backend', {
            useNewUrlParser: true,
            useUnifiedTopology: true,

        });
        console.log(`MongoDB Connected: ${mongoose.connection.host}`);

        mongoose.connection.on('error', err => {
            console.error('MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
        });

    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;