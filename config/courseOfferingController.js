const CourseOffering = require("./CourseOffering")
const Course = require("../models/Course")
const Program = require("../models/Program")
const Semester = require("../models/Semester")
const ProgramSemester = require("../models/ProgramSemester")
const User = require("../models/User")

// Create a new course offering
exports.createCourseOffering = async (req, res) => {
  try {
    const { course, academicSemester, programSemester, program, shift, teacher, maxStudents, schedule } = req.body

    // Validate course
    const courseExists = await Course.findById(course)
    if (!courseExists) {
      return res.status(404).json({ message: "Course not found" })
    }

    // Validate academic semester
    const academicSemesterExists = await Semester.findById(academicSemester)
    if (!academicSemesterExists) {
      return res.status(404).json({ message: "Academic semester not found" })
    }

    // Validate program semester
    const programSemesterExists = await ProgramSemester.findById(programSemester)
    if (!programSemesterExists) {
      return res.status(404).json({ message: "Program semester not found" })
    }

    // Check if program semester belongs to the specified program
    if (programSemesterExists.program.toString() !== program) {
      return res.status(400).json({
        message: "Program semester does not belong to the specified program",
      })
    }

    // Check if course is part of the program semester
    if (!programSemesterExists.courses.includes(course)) {
      return res.status(400).json({
        message: "Course is not part of the program semester",
      })
    }

    // Validate program
    const programExists = await Program.findById(program)
    if (!programExists) {
      return res.status(404).json({ message: "Program not found" })
    }

    // Check if program supports the shift
    if (programExists.shift !== "Both" && programExists.shift !== shift) {
      return res.status(400).json({
        message: `Program does not support ${shift} shift`,
      })
    }

    // Validate teacher if provided
    if (teacher) {
      const teacherExists = await User.findOne({
        _id: teacher,
        role: "Teacher",
      })

      if (!teacherExists) {
        return res.status(404).json({ message: "Teacher not found" })
      }
    }

    // Check if course is already offered for this program semester and shift
    const existingOffering = await CourseOffering.findOne({
      course,
      programSemester,
      shift,
    })

    if (existingOffering) {
      return res.status(400).json({
        message: "Course is already offered for this program semester and shift",
      })
    }

    const courseOffering = new CourseOffering({
      course,
      academicSemester,
      programSemester,
      program,
      shift,
      teacher,
      maxStudents,
      schedule,
    })

    await courseOffering.save()

    res.status(201).json({
      success: true,
      data: courseOffering,
      message: "Course offering created successfully",
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server Error" })
  }
}

// Get all course offerings
exports.getAllCourseOfferings = async (req, res) => {
  try {
    const courseOfferings = await CourseOffering.find()
        .populate("course", "name code creditHours")
        .populate("academicSemester", "name year")
        .populate("programSemester", "semesterNumber")
        .populate("program", "name code")
        .populate("teacher", "name email")

    res.status(200).json({
      success: true,
      count: courseOfferings.length,
      data: courseOfferings,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server Error" })
  }
}

// Get course offerings by academic semester
exports.getCourseOfferingsByAcademicSemester = async (req, res) => {
  try {
    const { semesterId } = req.params

    // Validate semester
    const semesterExists = await Semester.findById(semesterId)
    if (!semesterExists) {
      return res.status(404).json({ message: "Academic semester not found" })
    }

    const courseOfferings = await CourseOffering.find({ academicSemester: semesterId })
        .populate("course", "name code creditHours")
        .populate("academicSemester", "name year")
        .populate("programSemester", "semesterNumber")
        .populate("program", "name code")
        .populate("teacher", "name email")

    res.status(200).json({
      success: true,
      count: courseOfferings.length,
      data: courseOfferings,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server Error" })
  }
}

// Get course offerings by program semester
exports.getCourseOfferingsByProgramSemester = async (req, res) => {
  try {
    const { programSemesterId } = req.params

    // Validate program semester
    const programSemesterExists = await ProgramSemester.findById(programSemesterId)
    if (!programSemesterExists) {
      return res.status(404).json({ message: "Program semester not found" })
    }

    const courseOfferings = await CourseOffering.find({ programSemester: programSemesterId })
        .populate("course", "name code creditHours")
        .populate("academicSemester", "name year")
        .populate("programSemester", "semesterNumber")
        .populate("program", "name code")
        .populate("teacher", "name email")

    res.status(200).json({
      success: true,
      count: courseOfferings.length,
      data: courseOfferings,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server Error" })
  }
}

// Get course offerings by program
exports.getCourseOfferingsByProgram = async (req, res) => {
  try {
    const { programId } = req.params

    // Validate program
    const programExists = await Program.findById(programId)
    if (!programExists) {
      return res.status(404).json({ message: "Program not found" })
    }

    const courseOfferings = await CourseOffering.find({ program: programId })
        .populate("course", "name code creditHours")
        .populate("academicSemester", "name year")
        .populate("programSemester", "semesterNumber")
        .populate("program", "name code")
        .populate("teacher", "name email")

    res.status(200).json({
      success: true,
      count: courseOfferings.length,
      data: courseOfferings,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server Error" })
  }
}

// Get course offerings by teacher
exports.getCourseOfferingsByTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params

    // Validate teacher
    const teacherExists = await User.findOne({
      _id: teacherId,
      role: "Teacher",
    })

    if (!teacherExists) {
      return res.status(404).json({ message: "Teacher not found" })
    }

    const courseOfferings = await CourseOffering.find({ teacher: teacherId })
        .populate("course", "name code creditHours")
        .populate("academicSemester", "name year")
        .populate("programSemester", "semesterNumber")
        .populate("program", "name code")
        .populate("teacher", "name email")

    res.status(200).json({
      success: true,
      count: courseOfferings.length,
      data: courseOfferings,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server Error" })
  }
}

// Get course offering by ID
exports.getCourseOfferingById = async (req, res) => {
  try {
    const courseOffering = await CourseOffering.findById(req.params.id)
        .populate("course", "name code creditHours")
        .populate("academicSemester", "name year")
        .populate("programSemester", "semesterNumber")
        .populate("program", "name code")
        .populate("teacher", "name email")

    if (!courseOffering) {
      return res.status(404).json({ message: "Course offering not found" })
    }

    res.status(200).json({
      success: true,
      data: courseOffering,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server Error" })
  }
}

// Update course offering
exports.updateCourseOffering = async (req, res) => {
  try {
    const { course, academicSemester, programSemester, program, shift, teacher, maxStudents, schedule } = req.body

    // Check if course offering exists
    let courseOffering = await CourseOffering.findById(req.params.id)

    if (!courseOffering) {
      return res.status(404).json({ message: "Course offering not found" })
    }

    // Validate course if provided
    if (course && course !== courseOffering.course.toString()) {
      const courseExists = await Course.findById(course)
      if (!courseExists) {
        return res.status(404).json({ message: "Course not found" })
      }
    }

    // Validate academic semester if provided
    if (academicSemester && academicSemester !== courseOffering.academicSemester.toString()) {
      const academicSemesterExists = await Semester.findById(academicSemester)
      if (!academicSemesterExists) {
        return res.status(404).json({ message: "Academic semester not found" })
      }
    }

    // Validate program semester if provided
    if (programSemester && programSemester !== courseOffering.programSemester.toString()) {
      const programSemesterExists = await ProgramSemester.findById(programSemester)
      if (!programSemesterExists) {
        return res.status(404).json({ message: "Program semester not found" })
      }

      // Check if program semester belongs to the specified program
      const programToCheck = program || courseOffering.program.toString()
      if (programSemesterExists.program.toString() !== programToCheck) {
        return res.status(400).json({
          message: "Program semester does not belong to the specified program",
        })
      }

      // Check if course is part of the program semester
      const courseToCheck = course || courseOffering.course.toString()
      if (!programSemesterExists.courses.includes(courseToCheck)) {
        return res.status(400).json({
          message: "Course is not part of the program semester",
        })
      }
    }

    // Validate program if provided
    if (program && program !== courseOffering.program.toString()) {
      const programExists = await Program.findById(program)
      if (!programExists) {
        return res.status(404).json({ message: "Program not found" })
      }

      // Check if program supports the shift
      const shiftToCheck = shift || courseOffering.shift
      if (programExists.shift !== "Both" && programExists.shift !== shiftToCheck) {
        return res.status(400).json({
          message: `Program does not support ${shiftToCheck} shift`,
        })
      }
    }

    // Validate teacher if provided
    if (teacher && teacher !== courseOffering.teacher?.toString()) {
      const teacherExists = await User.findOne({
        _id: teacher,
        role: "Teacher",
      })

      if (!teacherExists) {
        return res.status(404).json({ message: "Teacher not found" })
      }
    }

    // Check if updated course offering conflicts with existing ones
    if (
        course !== courseOffering.course.toString() ||
        programSemester !== courseOffering.programSemester.toString() ||
        shift !== courseOffering.shift
    ) {
      const existingOffering = await CourseOffering.findOne({
        _id: { $ne: req.params.id },
        course: course || courseOffering.course,
        programSemester: programSemester || courseOffering.programSemester,
        shift: shift || courseOffering.shift,
      })

      if (existingOffering) {
        return res.status(400).json({
          message: "Course is already offered for this program semester and shift",
        })
      }
    }

    courseOffering = await CourseOffering.findByIdAndUpdate(
        req.params.id,
        {
          course,
          academicSemester,
          programSemester,
          program,
          shift,
          teacher,
          maxStudents,
          schedule,
        },
        { new: true, runValidators: true },
    )
        .populate("course", "name code creditHours")
        .populate("academicSemester", "name year")
        .populate("programSemester", "semesterNumber")
        .populate("program", "name code")
        .populate("teacher", "name email")

    res.status(200).json({
      success: true,
      data: courseOffering,
      message: "Course offering updated successfully",
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server Error" })
  }
}

// Delete course offering
exports.deleteCourseOffering = async (req, res) => {
  try {
    const courseOffering = await CourseOffering.findById(req.params.id)

    if (!courseOffering) {
      return res.status(404).json({ message: "Course offering not found" })
    }

    await courseOffering.deleteOne()

    res.status(200).json({
      success: true,
      message: "Course offering deleted successfully",
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server Error" })
  }
}

