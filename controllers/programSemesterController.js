const ProgramSemester = require("../models/ProgramSemester")
const Program = require("../models/Program")
const Course = require("../models/Course")
const AcademicSession = require("../models/AcademicSession")

// Get all program semesters
exports.getAllProgramSemesters = async (req, res) => {
  try {
    const programSemesters = await ProgramSemester.find()
        .populate("program", "name code")
        .populate("academicSession", "name startYear endYear")
        .populate("courses", "name code creditHours")

    res.status(200).json({
      success: true,
      count: programSemesters.length,
      data: programSemesters,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server Error" })
  }
}

// Get program semesters by program
exports.getProgramSemestersByProgram = async (req, res) => {
  try {
    const { programId } = req.params

    // Validate program
    const programExists = await Program.findById(programId)
    if (!programExists) {
      return res.status(404).json({ message: "Program not found" })
    }

    const programSemesters = await ProgramSemester.find({ program: programId })
        .populate("program", "name code")
        .populate("academicSession", "name startYear endYear")
        .populate("courses", "name code creditHours")
        .sort({ academicSession: -1, semesterNumber: 1 })

    res.status(200).json({
      success: true,
      count: programSemesters.length,
      data: programSemesters,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server Error" })
  }
}

// Get program semesters by academic session
exports.getProgramSemestersBySession = async (req, res) => {
  try {
    const { programId, sessionId } = req.params

    // Validate program
    const programExists = await Program.findById(programId)
    if (!programExists) {
      return res.status(404).json({ message: "Program not found" })
    }

    // Validate academic session
    const sessionExists = await AcademicSession.findById(sessionId)
    if (!sessionExists) {
      return res.status(404).json({ message: "Academic session not found" })
    }

    const programSemesters = await ProgramSemester.find({
      program: programId,
      academicSession: sessionId,
    })
        .populate("program", "name code")
        .populate("academicSession", "name startYear endYear")
        .populate("courses", "name code creditHours")
        .sort({ semesterNumber: 1 })

    res.status(200).json({
      success: true,
      count: programSemesters.length,
      data: programSemesters,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server Error" })
  }
}

// Get active program semester
exports.getActiveProgramSemester = async (req, res) => {
  try {
    const { programId, sessionId } = req.params

    // Validate program
    const programExists = await Program.findById(programId)
    if (!programExists) {
      return res.status(404).json({ message: "Program not found" })
    }

    // Build query
    const query = {
      program: programId,
      isActive: true,
    }

    // Add academic session to query if provided
    if (sessionId) {
      // Validate academic session
      const sessionExists = await AcademicSession.findById(sessionId)
      if (!sessionExists) {
        return res.status(404).json({ message: "Academic session not found" })
      }

      query.academicSession = sessionId
    }

    const programSemester = await ProgramSemester.findOne(query)
        .populate("program", "name code")
        .populate("academicSession", "name startYear endYear")
        .populate("courses", "name code creditHours")

    if (!programSemester) {
      return res.status(404).json({
        message: "No active semester found for this program" + (sessionId ? " and academic session" : ""),
      })
    }

    res.status(200).json({
      success: true,
      data: programSemester,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server Error" })
  }
}

// Get program semester by ID
exports.getProgramSemesterById = async (req, res) => {
  try {
    const programSemester = await ProgramSemester.findById(req.params.id)
        .populate("program", "name code")
        .populate("academicSession", "name startYear endYear")
        .populate("courses", "name code creditHours")

    if (!programSemester) {
      return res.status(404).json({ message: "Program semester not found" })
    }

    res.status(200).json({
      success: true,
      data: programSemester,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server Error" })
  }
}

// Set active semester for a program
exports.setActiveSemester = async (req, res) => {
  try {
    const { id } = req.params

    // Check if program semester exists
    const programSemester = await ProgramSemester.findById(id)
    if (!programSemester) {
      return res.status(404).json({ message: "Program semester not found" })
    }

    // Deactivate all semesters for this program and academic session
    await ProgramSemester.updateMany(
        {
          program: programSemester.program,
          academicSession: programSemester.academicSession,
        },
        { isActive: false },
    )

    // Activate the specified semester
    programSemester.isActive = true
    await programSemester.save()

    res.status(200).json({
      success: true,
      message: `Semester ${programSemester.semesterNumber} is now active for this program and academic session`,
      data: programSemester,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server Error" })
  }
}

// Add courses to program semester
exports.addCoursesToSemester = async (req, res) => {
  try {
    const { id } = req.params
    const { courses } = req.body

    // Check if program semester exists
    const programSemester = await ProgramSemester.findById(id)
    if (!programSemester) {
      return res.status(404).json({ message: "Program semester not found" })
    }

    // Validate courses
    if (!courses || !Array.isArray(courses) || courses.length === 0) {
      return res.status(400).json({ message: "Courses are required" })
    }

    // Check if courses exist and belong to the program
    const validCourses = await Course.find({
      _id: { $in: courses },
      programs: programSemester.program,
    })

    if (validCourses.length !== courses.length) {
      return res.status(400).json({
        message: "One or more courses do not exist or are not assigned to this program",
      })
    }

    // Add courses to program semester (avoid duplicates)
    const existingCourses = programSemester.courses.map((c) => c.toString())
    const newCourses = courses.filter((c) => !existingCourses.includes(c))

    if (newCourses.length === 0) {
      return res.status(400).json({
        message: "All specified courses are already assigned to this semester",
      })
    }

    programSemester.courses = [...existingCourses, ...newCourses]
    await programSemester.save()

    const updatedSemester = await ProgramSemester.findById(id)
        .populate("program", "name code")
        .populate("academicSession", "name startYear endYear")
        .populate("courses", "name code creditHours")

    res.status(200).json({
      success: true,
      message: "Courses added to semester successfully",
      data: updatedSemester,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server Error" })
  }
}

// Remove courses from program semester
exports.removeCoursesFromSemester = async (req, res) => {
  try {
    const { id } = req.params
    const { courses } = req.body

    // Check if program semester exists
    const programSemester = await ProgramSemester.findById(id)
    if (!programSemester) {
      return res.status(404).json({ message: "Program semester not found" })
    }

    // Validate courses
    if (!courses || !Array.isArray(courses) || courses.length === 0) {
      return res.status(400).json({ message: "Courses are required" })
    }

    // Remove courses from program semester
    programSemester.courses = programSemester.courses.filter((c) => !courses.includes(c.toString()))

    await programSemester.save()

    const updatedSemester = await ProgramSemester.findById(id)
        .populate("program", "name code")
        .populate("academicSession", "name startYear endYear")
        .populate("courses", "name code creditHours")

    res.status(200).json({
      success: true,
      message: "Courses removed from semester successfully",
      data: updatedSemester,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server Error" })
  }
}

// Copy courses from one academic session to another
exports.copyCoursesBetweenSessions = async (req, res) => {
  try {
    const { programId, sourceSessionId, targetSessionId } = req.params

    // Validate program
    const program = await Program.findById(programId)
    if (!program) {
      return res.status(404).json({ message: "Program not found" })
    }

    // Validate source session
    const sourceSession = await AcademicSession.findById(sourceSessionId)
    if (!sourceSession) {
      return res.status(404).json({ message: "Source academic session not found" })
    }

    // Validate target session
    const targetSession = await AcademicSession.findById(targetSessionId)
    if (!targetSession) {
      return res.status(404).json({ message: "Target academic session not found" })
    }

    // Check if target session has semesters for this program
    const targetSemesters = await ProgramSemester.find({
      program: programId,
      academicSession: targetSessionId,
    })

    if (targetSemesters.length === 0) {
      return res.status(404).json({
        message: "No semesters found for the target academic session. Create semesters first.",
      })
    }

    // Get source semesters with courses
    const sourceSemesters = await ProgramSemester.find({
      program: programId,
      academicSession: sourceSessionId,
    }).sort({ semesterNumber: 1 })

    if (sourceSemesters.length === 0) {
      return res.status(404).json({
        message: "No semesters found for the source academic session",
      })
    }

    // Copy courses from source to target semesters
    const updates = []

    for (const sourceSemester of sourceSemesters) {
      // Find matching target semester by semester number
      const targetSemester = targetSemesters.find((s) => s.semesterNumber === sourceSemester.semesterNumber)

      if (targetSemester && sourceSemester.courses.length > 0) {
        targetSemester.courses = [...sourceSemester.courses]
        await targetSemester.save()
        updates.push({
          semesterNumber: targetSemester.semesterNumber,
          courseCount: sourceSemester.courses.length,
        })
      }
    }

    res.status(200).json({
      success: true,
      message: `Courses copied from ${sourceSession.name} to ${targetSession.name}`,
      data: {
        updates,
        sourceSession,
        targetSession,
      },
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server Error" })
  }
}

