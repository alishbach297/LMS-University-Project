const mongoose = require("mongoose")

const courseRegistrationSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  courseOffering: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CourseOffering",
    required: true,
  },
  enrollmentStatus: {
    type: String,
    enum: ["Registered", "Dropped", "Completed"],
    default: "Registered",
  },
  grade: {
    type: String,
    enum: ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "F", "I", "W", ""],
    default: "",
  },
  registrationDate: {
    type: Date,
    default: Date.now,
  },
})

// Compound index to ensure a student is registered for a course offering only once
courseRegistrationSchema.index({ student: 1, courseOffering: 1 }, { unique: true })

module.exports = mongoose.model("CourseRegistration", courseRegistrationSchema)

