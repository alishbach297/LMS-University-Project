const mongoose = require("mongoose")

const semesterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Compound index to ensure semester name is unique within a year
semesterSchema.index({ name: 1, year: 1 }, { unique: true })

module.exports = mongoose.model("Semester", semesterSchema)

