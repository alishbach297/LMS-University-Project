require("dotenv").config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require("./config/db");
const authRoute = require("./routes/authRoute")
// const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
    cors({
        origin: "http://127.0.0.1:5173",
        methods: "GET, POST, PUT, DELETE, OPTIONS",
        allowedHeaders: "*",
    })
);

app.use(
    helmet({
        crossOriginResourcePolicy: false,
    })
);
app.use(morgan('dev'));

// Connect to DB
connectDB();
app.use('/auth', authRoute)



const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

function gracefulShutdown() {
    console.log('Received kill signal, shutting down gracefully');
    server.close(() => {
        console.log('Closed out remaining connections');
        mongoose.connection.close(false, () => {
            console.log('MongoDB connection closed');
            process.exit(0);
        });
    });

    setTimeout(() => {
        console.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 10000);
}