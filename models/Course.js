const mongoose = require("mongoose")

const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  creditHours: {
    type: Number,
    required: true,
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    required: true,
  },
  programs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Program",
    },
  ],
  description: {
    type: String,
  },
  prerequisites: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Compound index to ensure course code is unique within a department
courseSchema.index({ code: 1, department: 1 }, { unique: true })

module.exports = mongoose.model("Course", courseSchema)

