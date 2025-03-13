const mongoose = require("mongoose")

const programSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    required: true,
  },
  duration: {
    type: Number,
    required: true,
    comment: "Duration in years",
  },
  totalCreditHours: {
    type: Number,
    required: true,
  },
  shift: {
    type: String,
    enum: ["Morning", "Evening", "Both"],
    default: "Both",
  },
  description: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Compound index to ensure program code is unique within a department
programSchema.index({ code: 1, department: 1 }, { unique: true })

module.exports = mongoose.model("Program", programSchema)

