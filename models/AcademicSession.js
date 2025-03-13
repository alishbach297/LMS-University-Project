const mongoose = require("mongoose")

const academicSessionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    startYear: {
        type: Number,
        required: true,
    },
    endYear: {
        type: Number,
        required: true,
    },
    isActive: {
        type: Boolean,
        default: false,
    },
    description: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
})

// Validate that end year is greater than start year
academicSessionSchema.pre("validate", function (next) {
    if (this.endYear <= this.startYear) {
        this.invalidate("endYear", "End year must be greater than start year")
    }
    next()
})

module.exports = mongoose.model("AcademicSession", academicSessionSchema)

