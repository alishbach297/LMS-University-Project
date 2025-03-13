const mongoose = require("mongoose")

const programSemesterSchema = new mongoose.Schema({
    program: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Program",
        required: true,
    },
    academicSession: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AcademicSession",
        required: true,
    },
    semesterNumber: {
        type: Number,
        required: true,
    },
    courses: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
        },
    ],
    isActive: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
})

// Compound index to ensure semester number is unique within a program and academic session
programSemesterSchema.index({ program: 1, academicSession: 1, semesterNumber: 1 }, { unique: true })

module.exports = mongoose.model("ProgramSemester", programSemesterSchema)

