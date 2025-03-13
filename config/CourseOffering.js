const mongoose = require("mongoose")

const courseOfferingSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  academicSemester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Semester",
    required: true,
  },
  programSemester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ProgramSemester",
    required: true,
  },
  program: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Program",
    required: true,
  },
  shift: {
    type: String,
    enum: ["Morning", "Evening"],
    required: true,
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  maxStudents: {
    type: Number,
    default: 50,
  },
  schedule: {
    days: [
      {
        type: String,
        enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      },
    ],
    startTime: String,
    endTime: String,
    room: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Compound index to ensure a course is offered only once per program semester and shift
courseOfferingSchema.index({ course: 1, programSemester: 1, shift: 1 }, { unique: true })

module.exports = mongoose.model("CourseOffering", courseOfferingSchema)

