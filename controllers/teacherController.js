const User = require("../models/User")
// const CourseOffering = require("../config/CourseOffering")
// const CourseRegistration = require("../config/CourseRegistration")
const bcrypt = require("bcrypt")

// Register a new teacher
exports.registerTeacher = async (req, res) => {
  try {
    const { name, email, password } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" })
    }

    // Create user with Teacher role
    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: "Teacher",
    })

    await newUser.save()

    res.status(201).json({
      success: true,
      message: "Teacher registered successfully",
      data: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server Error" })
  }
}

// Get all teachers
exports.getAllTeachers = async (req, res) => {
  try {
    const teachers = await User.find({ role: "Teacher" }).select("-password")

    res.status(200).json({
      success: true,
      count: teachers.length,
      data: teachers,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server Error" })
  }
}

// Get teacher by ID
exports.getTeacherById = async (req, res) => {
  try {
    const teacher = await User.findOne({
      _id: req.params.id,
      role: "Teacher",
    }).select("-password")

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" })
    }

    res.status(200).json({
      success: true,
      data: teacher,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server Error" })
  }
}

// Update teacher
exports.updateTeacher = async (req, res) => {
  try {
    const { name, email } = req.body

    // Check if teacher exists
    const teacher = await User.findOne({
      _id: req.params.id,
      role: "Teacher",
    })

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" })
    }

    // Check if email is already used by another user
    if (email && email !== teacher.email) {
      const existingUser = await User.findOne({
        _id: { $ne: req.params.id },
        email,
      })

      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" })
      }
    }

    const updatedTeacher = await User.findByIdAndUpdate(
      req.params.id,
      { name, email },
      { new: true, runValidators: true },
    ).select("-password")

    res.status(200).json({
      success: true,
      message: "Teacher updated successfully",
      data: updatedTeacher,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server Error" })
  }
}
//
// // Get teacher's assigned courses
// exports.getTeacherCourses = async (req, res) => {
//   try {
//     const { teacherId } = req.params
//
//     // Check if teacher exists
//     const teacher = await User.findOne({
//       _id: teacherId,
//       role: "Teacher",
//     })
//
//     if (!teacher) {
//       return res.status(404).json({ message: "Teacher not found" })
//     }
//
//     const courseOfferings = await CourseOffering.find({ teacher: teacherId })
//       .populate("course", "name code creditHours")
//       .populate("semester", "name year")
//       .populate("program", "name code")
//
//     res.status(200).json({
//       success: true,
//       count: courseOfferings.length,
//       data: courseOfferings,
//     })
//   } catch (error) {
//     console.error(error)
//     res.status(500).json({ message: "Server Error" })
//   }
// }
//
// // Get students enrolled in teacher's course
// exports.getCourseStudents = async (req, res) => {
//   try {
//     const { teacherId, courseOfferingId } = req.params
//
//     // Check if teacher exists
//     const teacher = await User.findOne({
//       _id: teacherId,
//       role: "Teacher",
//     })
//
//     if (!teacher) {
//       return res.status(404).json({ message: "Teacher not found" })
//     }
//
//     // Check if course offering exists and is assigned to this teacher
//     const courseOffering = await CourseOffering.findOne({
//       _id: courseOfferingId,
//       teacher: teacherId,
//     })
//
//     if (!courseOffering) {
//       return res.status(404).json({
//         message: "Course offering not found or not assigned to this teacher",
//       })
//     }
//
//     // Get all students registered for this course offering
//     const registrations = await CourseRegistration.find({
//       courseOffering: courseOfferingId,
//     })
//       .populate("student", "name email")
//       .populate({
//         path: "courseOffering",
//         populate: { path: "course", select: "name code" },
//       })
//
//     const students = registrations.map((reg) => ({
//       student: reg.student,
//       registrationDate: reg.registrationDate,
//       enrollmentStatus: reg.enrollmentStatus,
//       grade: reg.grade,
//     }))
//
//     res.status(200).json({
//       success: true,
//       count: students.length,
//       data: students,
//     })
//   } catch (error) {
//     console.error(error)
//     res.status(500).json({ message: "Server Error" })
//   }
// }
//
// // Update student grades
// exports.updateStudentGrades = async (req, res) => {
//   try {
//     const { teacherId, courseOfferingId } = req.params
//     const { grades } = req.body
//
//     // Check if teacher exists
//     const teacher = await User.findOne({
//       _id: teacherId,
//       role: "Teacher",
//     })
//
//     if (!teacher) {
//       return res.status(404).json({ message: "Teacher not found" })
//     }
//
//     // Check if course offering exists and is assigned to this teacher
//     const courseOffering = await CourseOffering.findOne({
//       _id: courseOfferingId,
//       teacher: teacherId,
//     })
//
//     if (!courseOffering) {
//       return res.status(404).json({
//         message: "Course offering not found or not assigned to this teacher",
//       })
//     }
//
//     // Validate grades
//     if (!grades || !Array.isArray(grades) || grades.length === 0) {
//       return res.status(400).json({ message: "Grades are required" })
//     }
//
//     const updatedRegistrations = []
//
//     // Update each student's grade
//     for (const gradeInfo of grades) {
//       const { studentId, grade } = gradeInfo
//
//       // Check if student is registered for this course
//       const registration = await CourseRegistration.findOne({
//         student: studentId,
//         courseOffering: courseOfferingId,
//       })
//
//       if (!registration) {
//         return res.status(404).json({
//           message: `Student with ID ${studentId} is not registered for this course`,
//         })
//       }
//
//       // Update grade
//       registration.grade = grade
//
//       // If grade is assigned, mark as completed
//       if (grade && grade !== "") {
//         registration.enrollmentStatus = "Completed"
//       }
//
//       await registration.save()
//       updatedRegistrations.push(registration)
//     }
//
//     res.status(200).json({
//       success: true,
//       message: "Grades updated successfully",
//       data: updatedRegistrations,
//     })
//   } catch (error) {
//     console.error(error)
//     res.status(500).json({ message: "Server Error" })
//   }
// }
//
