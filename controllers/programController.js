const Program = require("../models/Program")
const Department = require("../models/Department")
const ProgramSemester = require("../models/ProgramSemester")
const AcademicSession = require("../models/AcademicSession")

// Create a new program
exports.createProgram = async (req, res) => {
  try {
    const { name, code, department, duration, totalCreditHours, shift, description, totalSemesters } = req.body

    // Check if department exists
    const departmentExists = await Department.findById(department)
    if (!departmentExists) {
      return res.status(404).json({ message: "Department not found" })
    }

    // Check if program code already exists in the department
    const existingProgram = await Program.findOne({
      code,
      department,
    })

    if (existingProgram) {
      return res.status(400).json({
        message: "Program with this code already exists in this department",
      })
    }

    // Validate total semesters
    if (!totalSemesters || totalSemesters < 1) {
      return res.status(400).json({
        message: "Total semesters must be at least 1",
      })
    }

    const program = new Program({
      name,
      code,
      department,
      duration,
      totalCreditHours,
      shift,
      description,
      totalSemesters: totalSemesters || duration * 2, // Default to 2 semesters per year
    })

    await program.save()

    // Get active academic session
    const activeSession = await AcademicSession.findOne({ isActive: true })

    if (activeSession) {
      // Create program semesters automatically for the active session
      const programSemesters = []
      for (let i = 1; i <= totalSemesters; i++) {
        const programSemester = new ProgramSemester({
          program: program._id,
          academicSession: activeSession._id,
          semesterNumber: i,
          isActive: i === 1, // First semester is active by default
        })
        await programSemester.save()
        programSemesters.push(programSemester)
      }

      res.status(201).json({
        success: true,
        data: {
          program,
          semesters: programSemesters,
          academicSession: activeSession,
        },
        message: "Program created successfully with semesters for the active academic session",
      })
    } else {
      res.status(201).json({
        success: true,
        data: {
          program,
        },
        message: "Program created successfully. No active academic session found to create semesters.",
      })
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server Error" })
  }
}

// Get all programs
exports.getAllPrograms = async (req, res) => {
  try {
    const programs = await Program.find().populate("department", "name code")

    res.status(200).json({
      success: true,
      count: programs.length,
      data: programs,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server Error" })
  }
}

// Get programs by department
exports.getProgramsByDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params

    // Check if department exists
    const departmentExists = await Department.findById(departmentId)
    if (!departmentExists) {
      return res.status(404).json({ message: "Department not found" })
    }

    const programs = await Program.find({ department: departmentId }).populate("department", "name code")

    res.status(200).json({
      success: true,
      count: programs.length,
      data: programs,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server Error" })
  }
}

// Get program by ID
exports.getProgramById = async (req, res) => {
  try {
    const program = await Program.findById(req.params.id).populate("department", "name code")

    if (!program) {
      return res.status(404).json({ message: "Program not found" })
    }

    // Get program semesters for all academic sessions
    const semesters = await ProgramSemester.find({ program: program._id })
        .populate("academicSession", "name startYear endYear")
        .populate("courses", "name code creditHours")
        .sort({ academicSession: -1, semesterNumber: 1 })

    // Group semesters by academic session
    const semestersBySession = {}
    semesters.forEach((semester) => {
      const sessionId = semester.academicSession._id.toString()
      if (!semestersBySession[sessionId]) {
        semestersBySession[sessionId] = {
          academicSession: semester.academicSession,
          semesters: [],
        }
      }
      semestersBySession[sessionId].semesters.push(semester)
    })

    res.status(200).json({
      success: true,
      data: {
        program,
        semestersBySession: Object.values(semestersBySession),
      },
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server Error" })
  }
}

// Update program
exports.updateProgram = async (req, res) => {
  try {
    const { name, code, department, duration, totalCreditHours, shift, description, totalSemesters } = req.body

    // Check if program exists
    let program = await Program.findById(req.params.id)

    if (!program) {
      return res.status(404).json({ message: "Program not found" })
    }

    // If department is being changed, check if it exists
    if (department && department !== program.department.toString()) {
      const departmentExists = await Department.findById(department)
      if (!departmentExists) {
        return res.status(404).json({ message: "Department not found" })
      }
    }

    // Check if updated code conflicts with existing programs in the same department
    if (code !== program.code || department !== program.department.toString()) {
      const existingProgram = await Program.findOne({
        _id: { $ne: req.params.id },
        code,
        department: department || program.department,
      })

      if (existingProgram) {
        return res.status(400).json({
          message: "Program with this code already exists in this department",
        })
      }
    }

    program = await Program.findByIdAndUpdate(
        req.params.id,
        {
          name,
          code,
          department,
          duration,
          totalCreditHours,
          shift,
          description,
          totalSemesters,
        },
        { new: true, runValidators: true },
    ).populate("department", "name code")

    res.status(200).json({
      success: true,
      data: program,
      message: "Program updated successfully",
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server Error" })
  }
}

// Delete program
exports.deleteProgram = async (req, res) => {
  try {
    const program = await Program.findById(req.params.id)

    if (!program) {
      return res.status(404).json({ message: "Program not found" })
    }

    // Check if program has any student enrollments
    const StudentEnrollment = require("../models/StudentEnrollment")
    const enrollmentsCount = await StudentEnrollment.countDocuments({ program: program._id })

    if (enrollmentsCount > 0) {
      return res.status(400).json({
        message: "Cannot delete program: It has student enrollments",
      })
    }

    // Delete all program semesters
    await ProgramSemester.deleteMany({ program: program._id })

    await program.deleteOne()

    res.status(200).json({
      success: true,
      message: "Program and all its semesters deleted successfully",
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server Error" })
  }
}

// Create program semesters for a specific academic session
exports.createProgramSemestersForSession = async (req, res) => {
  try {
    const { programId, academicSessionId } = req.params

    // Check if program exists
    const program = await Program.findById(programId)
    if (!program) {
      return res.status(404).json({ message: "Program not found" })
    }

    // Check if academic session exists
    const academicSession = await AcademicSession.findById(academicSessionId)
    if (!academicSession) {
      return res.status(404).json({ message: "Academic session not found" })
    }

    // Check if semesters already exist for this program and session
    const existingSemesters = await ProgramSemester.find({
      program: programId,
      academicSession: academicSessionId,
    })

    if (existingSemesters.length > 0) {
      return res.status(400).json({
        message: "Program semesters already exist for this academic session",
      })
    }

    // Create program semesters
    const programSemesters = []
    for (let i = 1; i <= program.totalSemesters; i++) {
      const programSemester = new ProgramSemester({
        program: programId,
        academicSession: academicSessionId,
        semesterNumber: i,
        isActive: i === 1, // First semester is active by default
      })
      await programSemester.save()
      programSemesters.push(programSemester)
    }

    res.status(201).json({
      success: true,
      data: {
        programSemesters,
        academicSession,
      },
      message: `Created ${programSemesters.length} semesters for program in academic session ${academicSession.name}`,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server Error" })
  }
}

