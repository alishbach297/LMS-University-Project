require("dotenv").config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require("./config/db");

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
connectDB();
const authRoutes = require("./routes/authRoutes")
const departmentRoutes = require("./routes/departmentRoutes")
const programRoutes = require("./routes/programRoutes")
const courseRoutes = require("./routes/courseRoutes")
const academicSessionRoutes = require("./routes/academicSessionRoutes")
const programSemesterRoutes = require("./routes/programSemesterRoutes")
const studentRoutes = require("./routes/studentRoutes")
const teacherRoutes = require("./routes/teacherRoutes")
const directorRoutes = require("./routes/directorRoutes")
app.use("/api/auth", authRoutes)
app.use("/api/departments", departmentRoutes)
app.use("/api/programs", programRoutes)
app.use("/api/courses", courseRoutes)
app.use("/api/program-semesters", programSemesterRoutes)
app.use("/api/academic-sessions", academicSessionRoutes)
app.use("/api/students", studentRoutes)
app.use("/api/teachers", teacherRoutes)
app.use("/api/directors", directorRoutes)



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