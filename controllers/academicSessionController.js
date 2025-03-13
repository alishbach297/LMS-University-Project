const AcademicSession = require("../models/AcademicSession")

// Create a new academic session
exports.createAcademicSession = async (req, res) => {
    try {
        const { name, startYear, endYear, isActive, description } = req.body

        // Check if session already exists
        const existingSession = await AcademicSession.findOne({ name })
        if (existingSession) {
            return res.status(400).json({
                message: "Academic session with this name already exists",
            })
        }

        // If setting this session as active, deactivate all other sessions
        if (isActive) {
            await AcademicSession.updateMany({}, { isActive: false })
        }

        const academicSession = new AcademicSession({
            name,
            startYear,
            endYear,
            isActive: isActive || false,
            description,
        })

        await academicSession.save()

        res.status(201).json({
            success: true,
            data: academicSession,
            message: "Academic session created successfully",
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Server Error" })
    }
}

// Get all academic sessions
exports.getAllAcademicSessions = async (req, res) => {
    try {
        const academicSessions = await AcademicSession.find().sort({ startYear: -1 })

        res.status(200).json({
            success: true,
            count: academicSessions.length,
            data: academicSessions,
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Server Error" })
    }
}

// Get active academic session
exports.getActiveAcademicSession = async (req, res) => {
    try {
        const academicSession = await AcademicSession.findOne({ isActive: true })

        if (!academicSession) {
            return res.status(404).json({ message: "No active academic session found" })
        }

        res.status(200).json({
            success: true,
            data: academicSession,
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Server Error" })
    }
}

// Get academic session by ID
exports.getAcademicSessionById = async (req, res) => {
    try {
        const academicSession = await AcademicSession.findById(req.params.id)

        if (!academicSession) {
            return res.status(404).json({ message: "Academic session not found" })
        }

        res.status(200).json({
            success: true,
            data: academicSession,
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Server Error" })
    }
}

// Update academic session
exports.updateAcademicSession = async (req, res) => {
    try {
        const { name, startYear, endYear, isActive, description } = req.body

        // Check if academic session exists
        let academicSession = await AcademicSession.findById(req.params.id)
        if (!academicSession) {
            return res.status(404).json({ message: "Academic session not found" })
        }

        // Check if updated name conflicts with existing sessions
        if (name && name !== academicSession.name) {
            const existingSession = await AcademicSession.findOne({
                _id: { $ne: req.params.id },
                name,
            })

            if (existingSession) {
                return res.status(400).json({
                    message: "Academic session with this name already exists",
                })
            }
        }

        // If setting this session as active, deactivate all other sessions
        if (isActive && !academicSession.isActive) {
            await AcademicSession.updateMany({ _id: { $ne: req.params.id } }, { isActive: false })
        }

        academicSession = await AcademicSession.findByIdAndUpdate(
            req.params.id,
            { name, startYear, endYear, isActive, description },
            { new: true, runValidators: true },
        )

        res.status(200).json({
            success: true,
            data: academicSession,
            message: "Academic session updated successfully",
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Server Error" })
    }
}

// Delete academic session
exports.deleteAcademicSession = async (req, res) => {
    try {
        const academicSession = await AcademicSession.findById(req.params.id)

        if (!academicSession) {
            return res.status(404).json({ message: "Academic session not found" })
        }

        // Check if session is being used by any program semesters
        const ProgramSemester = require("../models/ProgramSemester")
        const semestersUsingSession = await ProgramSemester.countDocuments({
            academicSession: req.params.id,
        })

        if (semestersUsingSession > 0) {
            return res.status(400).json({
                message: "Cannot delete: This academic session is being used by program semesters",
            })
        }

        // Check if session is being used by any student enrollments
        const StudentEnrollment = require("../models/StudentEnrollment")
        const enrollmentsUsingSession = await StudentEnrollment.countDocuments({
            academicSession: req.params.id,
        })

        if (enrollmentsUsingSession > 0) {
            return res.status(400).json({
                message: "Cannot delete: This academic session is being used by student enrollments",
            })
        }

        await academicSession.deleteOne()

        res.status(200).json({
            success: true,
            message: "Academic session deleted successfully",
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Server Error" })
    }
}

