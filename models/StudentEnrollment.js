const mongoose = require("mongoose")

const studentEnrollmentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
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
  currentSemester: {
    type: Number,
    default: 1,
  },
  shift: {
    type: String,
    enum: ["Morning", "Evening"],
    required: true,
  },
  enrollmentDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["Active", "Graduated", "Withdrawn", "On Leave"],
    default: "Active",
  },
  registrationNumber: {
    type: String,
    required: true,
    unique: true,
  },
  rollNumber: {
    type: String,
    required: true,
    unique: true,
  },
})

module.exports = mongoose.model("StudentEnrollment", studentEnrollmentSchema)

