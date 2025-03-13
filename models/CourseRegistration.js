const mongoose = require("mongoose")

const courseRegistrationSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true,
    },
    semester: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ProgramSemester",
        required: true,
    },
    enrollmentStatus: {
        type: String,
        enum: ["Registered", "Dropped", "Completed"],
        default: "Registered",
    },
    grade: {
        type: String,
        enum: ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "F", ""],
        default: "",
    },
    registrationDate: {
        type: Date,
        default: Date.now,
    },
})

// Compound index to ensure a student is registered for a course only once per semester
courseRegistrationSchema.index({ student: 1, course: 1, semester: 1 }, { unique: true })

module.exports = mongoose.model("CourseRegistration", courseRegistrationSchema)

