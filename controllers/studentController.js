const User = require("../models/User")
const Program = require("../models/Program")
const ProgramSemester = require("../models/ProgramSemester")
const StudentEnrollment = require("../models/StudentEnrollment")
const CourseRegistration = require("../models/CourseRegistration")
const AcademicSession = require("../models/AcademicSession")
const bcrypt = require("bcrypt")

// Register a new student
exports.registerStudent = async (req, res) => {
  try {
    const { name, email, password, program, academicSession, shift, registrationNumber, rollNumber } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" })
    }

    // Check if registration number is already used
    const existingRegistration = await StudentEnrollment.findOne({ registrationNumber })
    if (existingRegistration) {
      return res.status(400).json({ message: "Registration number already exists" })
    }

    // Check if roll number is already used
    const existingRoll = await StudentEnrollment.findOne({ rollNumber })
    if (existingRoll) {
      return res.status(400).json({ message: "Roll number already exists" })
    }

    // Validate program
    const programExists = await Program.findById(program)
    if (!programExists) {
      return res.status(404).json({ message: "Program not found" })
    }

    // Validate academic session
    const sessionExists = await AcademicSession.findById(academicSession)
    if (!sessionExists) {
      return res.status(404).json({ message: "Academic session not found" })
    }

    // Check if program supports the shift
    if (programExists.shift !== "Both" && programExists.shift !== shift) {
      return res.status(400).json({
        message: `Program does not support ${shift} shift`,
      })
    }

    // Check if program has semesters for this academic session
    const programSemesters = await ProgramSemester.find({
      program,
      academicSession,
    })

    if (programSemesters.length === 0) {
      return res.status(400).json({
        message: "Program does not have semesters for the specified academic session",
      })
    }

    // Create user with Student role
    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: "Student",
    })

    await newUser.save()

    // Create student enrollment
    const enrollment = new StudentEnrollment({
      student: newUser._id,
      program,
      academicSession,
      shift,
      registrationNumber,
      rollNumber,
      currentSemester: 1, // Start with first semester
    })

    await enrollment.save()

    res.status(201).json({
      success: true,
      message: "Student registered successfully",
      data: {
        student: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
        enrollment: {
          program: enrollment.program,
          academicSession: enrollment.academicSession,
          shift: enrollment.shift,
          registrationNumber: enrollment.registrationNumber,
          rollNumber: enrollment.rollNumber,
          currentSemester: enrollment.currentSemester,
        },
      },
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server Error" })
  }
}

// Get all students
exports.getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: "Student" }).select("-password")

    const studentsWithEnrollment = await Promise.all(
        students.map(async (student) => {
          const enrollment = await StudentEnrollment.findOne({ student: student._id })
              .populate("program", "name code department")
              .populate("academicSession", "name startYear endYear")

          return {
            ...student.toObject(),
            enrollment: enrollment || null,
          }
        }),
    )

    res.status(200).json({
      success: true,
      count: studentsWithEnrollment.length,
      data: studentsWithEnrollment,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server Error" })
  }
}

// Get students by program
exports.getStudentsByProgram = async (req, res) => {
  try {
    const { programId } = req.params

    // Validate program
    const programExists = await Program.findById(programId)
    if (!programExists) {
      return res.status(404).json({ message: "Program not found" })
    }

    const enrollments = await StudentEnrollment.find({
      program: programId,
      status: "Active",
    })
        .populate("student", "-password")
        .populate("academicSession", "name startYear endYear")

    const students = enrollments.map((enrollment) => ({
      ...enrollment.student.toObject(),
      enrollment: {
        registrationNumber: enrollment.registrationNumber,
        rollNumber: enrollment.rollNumber,
        shift: enrollment.shift,
        currentSemester: enrollment.currentSemester,
        enrollmentDate: enrollment.enrollmentDate,
        academicSession: enrollment.academicSession,
      },
    }))

    res.status(200).json({
      success: true,
      count: students.length,
      data: students,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server Error" })
  }
}

// Get students by academic session
exports.getStudentsBySession = async (req, res) => {
  try {
    const { sessionId } = req.params

    // Validate session
    const sessionExists = await AcademicSession.findById(sessionId)
    if (!sessionExists) {
      return res.status(404).json({ message: "Academic session not found" })
    }

    const enrollments = await StudentEnrollment.find({
      academicSession: sessionId,
      status: "Active",
    })
        .populate("student", "-password")
        .populate("program", "name code department")

    const students = enrollments.map((enrollment) => ({
      ...enrollment.student.toObject(),
      enrollment: {
        program: enrollment.program,
        registrationNumber: enrollment.registrationNumber,
        rollNumber: enrollment.rollNumber,
        shift: enrollment.shift,
        currentSemester: enrollment.currentSemester,
        enrollmentDate: enrollment.enrollmentDate,
      },
    }))

    res.status(200).json({
      success: true,
      count: students.length,
      data: students,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server Error" })
  }
}

// Get student by ID
exports.getStudentById = async (req, res) => {
  try {
    const student = await User.findOne({
      _id: req.params.id,
      role: "Student",
    }).select("-password")

    if (!student) {
      return res.status(404).json({ message: "Student not found" })
    }

    const enrollment = await StudentEnrollment.findOne({ student: student._id })
        .populate("program", "name code department")
        .populate("academicSession", "name startYear endYear")

    res.status(200).json({
      success: true,
      data: {
        ...student.toObject(),
        enrollment: enrollment || null,
      },
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server Error" })
  }
}

// Update student
exports.updateStudent = async (req, res) => {
  try {
    const { name, email, program, academicSession, shift, currentSemester, status, rollNumber } = req.body

    // Check if student exists
    const student = await User.findOne({
      _id: req.params.id,
      role: "Student",
    })

    if (!student) {
      return res.status(404).json({ message: "Student not found" })
    }

    // Update user information if provided
    if (name || email) {
      // Check if email is already used by another user
      if (email && email !== student.email) {
        const existingUser = await User.findOne({
          _id: { $ne: req.params.id },
          email,
        })

        if (existingUser) {
          return res.status(400).json({ message: "Email already in use" })
        }
      }

      await User.findByIdAndUpdate(req.params.id, { name, email }, { runValidators: true })
    }

    // Update enrollment information if provided
    if (program || academicSession || shift || currentSemester || status || rollNumber) {
      let enrollment = await StudentEnrollment.findOne({ student: req.params.id })

      if (!enrollment) {
        return res.status(404).json({ message: "Student enrollment not found" })
      }

      // Check if roll number is already used
      if (rollNumber && rollNumber !== enrollment.rollNumber) {
        const existingRoll = await StudentEnrollment.findOne({
          student: { $ne: req.params.id },
          rollNumber,
        })

        if (existingRoll) {
          return res.status(400).json({ message: "Roll number already in use" })
        }
      }

      // Validate program if provided
      if (program && program !== enrollment.program.toString()) {
        const programExists = await Program.findById(program)
        if (!programExists) {
          return res.status(404).json({ message: "Program not found" })
        }

        // Check if program supports the shift
        const shiftToCheck = shift || enrollment.shift
        if (programExists.shift !== "Both" && programExists.shift !== shiftToCheck) {
          return res.status(400).json({
            message: `Program does not support ${shiftToCheck} shift`,
          })
        }
      }

      // Validate academic session if provided
      if (academicSession && academicSession !== enrollment.academicSession.toString()) {
        const sessionExists = await AcademicSession.findById(academicSession)
        if (!sessionExists) {
          return res.status(404).json({ message: "Academic session not found" })
        }

        // Check if program has semesters for this academic session
        const programId = program || enrollment.program
        const programSemesters = await ProgramSemester.find({
          program: programId,
          academicSession,
        })

        if (programSemesters.length === 0) {
          return res.status(400).json({
            message: "Program does not have semesters for the specified academic session",
          })
        }

        // Validate current semester against new program and session
        const semesterToCheck = currentSemester || enrollment.currentSemester
        const maxSemester = programSemesters.reduce((max, sem) => Math.max(max, sem.semesterNumber), 0)

        if (semesterToCheck > maxSemester) {
          return res.status(400).json({
            message: `Current semester ${semesterToCheck} exceeds available semesters (${maxSemester}) for this program and session`,
          })
        }
      } else if (currentSemester) {
        // Validate current semester against existing program and session
        const programSemesters = await ProgramSemester.find({
          program: enrollment.program,
          academicSession: enrollment.academicSession,
        })

        const maxSemester = programSemesters.reduce((max, sem) => Math.max(max, sem.semesterNumber), 0)

        if (currentSemester > maxSemester) {
          return res.status(400).json({
            message: `Current semester ${currentSemester} exceeds available semesters (${maxSemester}) for this program and session`,
          })
        }
      }

      enrollment = await StudentEnrollment.findOneAndUpdate(
          { student: req.params.id },
          { program, academicSession, shift, currentSemester, status, rollNumber },
          { new: true, runValidators: true },
      )
          .populate("program", "name code department")
          .populate("academicSession", "name startYear endYear")
    }

    // Get updated student data
    const updatedStudent = await User.findById(req.params.id).select("-password")

    const updatedEnrollment = await StudentEnrollment.findOne({ student: req.params.id })
        .populate("program", "name code department")
        .populate("academicSession", "name startYear endYear")

    res.status(200).json({
      success: true,
      message: "Student updated successfully",
      data: {
        ...updatedStudent.toObject(),
        enrollment: updatedEnrollment || null,
      },
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server Error" })
  }
}

// Register student for courses
exports.registerCourses = async (req, res) => {
  try {
    const { studentId } = req.params
    const { courses } = req.body

    // Check if student exists
    const student = await User.findOne({
      _id: studentId,
      role: "Student",
    })

    if (!student) {
      return res.status(404).json({ message: "Student not found" })
    }

    // Check if student is enrolled
    const enrollment = await StudentEnrollment.findOne({
      student: studentId,
      status: "Active",
    })

    if (!enrollment) {
      return res.status(404).json({ message: "Student enrollment not found or not active" })
    }

    // Validate courses
    if (!courses || !Array.isArray(courses) || courses.length === 0) {
      return res.status(400).json({ message: "Courses are required" })
    }

    // Get current semester for student
    const currentSemester = await ProgramSemester.findOne({
      program: enrollment.program,
      academicSession: enrollment.academicSession,
      semesterNumber: enrollment.currentSemester,
    }).populate("courses")

    if (!currentSemester) {
      return res.status(404).json({ message: "Current semester not found for this program and session" })
    }

    // Check if all courses are in the current semester
    const semesterCourseIds = currentSemester.courses.map((c) => c._id.toString())
    const invalidCourses = courses.filter((c) => !semesterCourseIds.includes(c))

    if (invalidCourses.length > 0) {
      return res.status(400).json({
        message: `Some courses are not part of the current semester: ${invalidCourses.join(", ")}`,
      })
    }

    // Check if student is already registered for any of these courses
    const existingRegistrations = await CourseRegistration.find({
      student: studentId,
      course: { $in: courses },
      semester: currentSemester._id,
    })

    if (existingRegistrations.length > 0) {
      const registeredCourses = existingRegistrations.map((r) => r.course.toString())
      return res.status(400).json({
        message: `Student is already registered for some courses: ${registeredCourses.join(", ")}`,
      })
    }

    // Register student for courses
    const registrations = []

    for (const courseId of courses) {
      const registration = new CourseRegistration({
        student: studentId,
        course: courseId,
        semester: currentSemester._id,
      })

      await registration.save()
      registrations.push(registration)
    }

    res.status(201).json({
      success: true,
      message: "Student registered for courses successfully",
      data: {
        registrations,
      },
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server Error" })
  }
}

// Get student's registered courses
exports.getStudentCourses = async (req, res) => {
  try {
    const { studentId } = req.params

    // Check if student exists
    const student = await User.findOne({
      _id: studentId,
      role: "Student",
    })

    if (!student) {
      return res.status(404).json({ message: "Student not found" })
    }

    const registrations = await CourseRegistration.find({ student: studentId })
        .populate("course", "name code creditHours")
        .populate({
          path: "semester",
          select: "semesterNumber academicSession",
          populate: {
            path: "academicSession",
            select: "name startYear endYear",
          },
        })

    res.status(200).json({
      success: true,
      count: registrations.length,
      data: registrations,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server Error" })
  }
}

// Promote student to next semester
exports.promoteStudent = async (req, res) => {
  try {
    const { studentId } = req.params

    // Check if student exists
    const student = await User.findOne({
      _id: studentId,
      role: "Student",
    })

    if (!student) {
      return res.status(404).json({ message: "Student not found" })
    }

    // Get student enrollment
    const enrollment = await StudentEnrollment.findOne({
      student: studentId,
      status: "Active",
    })

    if (!enrollment) {
      return res.status(404).json({ message: "Student enrollment not found or not active" })
    }

    // Check if next semester exists for this program and session
    const nextSemesterNumber = enrollment.currentSemester + 1
    const nextSemester = await ProgramSemester.findOne({
      program: enrollment.program,
      academicSession: enrollment.academicSession,
      semesterNumber: nextSemesterNumber,
    })

    if (!nextSemester) {
      return res.status(400).json({
        message: `Semester ${nextSemesterNumber} does not exist for this program and academic session`,
      })
    }

    // Update student's semester
    enrollment.currentSemester = nextSemesterNumber
    await enrollment.save()

    res.status(200).json({
      success: true,
      message: `Student promoted to semester ${enrollment.currentSemester}`,
      data: enrollment,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server Error" })
  }
}

