const Course = require("../models/Course")
const Department = require("../models/Department")
const Program = require("../models/Program")

// Create a new course
exports.createCourse = async (req, res) => {
  try {
    const { name, code, creditHours, department, programs, description, prerequisites } = req.body

    // Check if department exists
    const departmentExists = await Department.findById(department)
    if (!departmentExists) {
      return res.status(404).json({ message: "Department not found" })
    }

    // Check if course code already exists in the department
    const existingCourse = await Course.findOne({
      code,
      department,
    })

    if (existingCourse) {
      return res.status(400).json({
        message: "Course with this code already exists in this department",
      })
    }

    // Validate programs if provided
    if (programs && programs.length > 0) {
      const programsExist = await Program.find({
        _id: { $in: programs },
        department,
      })

      if (programsExist.length !== programs.length) {
        return res.status(400).json({
          message: "One or more programs do not exist in the specified department",
        })
      }
    }

    // Validate prerequisites if provided
    if (prerequisites && prerequisites.length > 0) {
      const prerequisitesExist = await Course.find({
        _id: { $in: prerequisites },
      })

      if (prerequisitesExist.length !== prerequisites.length) {
        return res.status(400).json({
          message: "One or more prerequisites do not exist",
        })
      }
    }

    const course = new Course({
      name,
      code,
      creditHours,
      department,
      programs: programs || [],
      description,
      prerequisites: prerequisites || [],
    })

    await course.save()

    res.status(201).json({
      success: true,
      data: course,
      message: "Course created successfully",
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server Error" })
  }
}

// Get all courses
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate("department", "name code")
      .populate("programs", "name code")
      .populate("prerequisites", "name code")

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server Error" })
  }
}

// Get courses by department
exports.getCoursesByDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params

    // Check if department exists
    const departmentExists = await Department.findById(departmentId)
    if (!departmentExists) {
      return res.status(404).json({ message: "Department not found" })
    }

    const courses = await Course.find({ department: departmentId })
      .populate("department", "name code")
      .populate("programs", "name code")
      .populate("prerequisites", "name code")

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server Error" })
  }
}

// Get courses by program
exports.getCoursesByProgram = async (req, res) => {
  try {
    const { programId } = req.params

    // Check if program exists
    const programExists = await Program.findById(programId)
    if (!programExists) {
      return res.status(404).json({ message: "Program not found" })
    }

    const courses = await Course.find({ programs: programId })
      .populate("department", "name code")
      .populate("programs", "name code")
      .populate("prerequisites", "name code")

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server Error" })
  }
}

// Get course by ID
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("department", "name code")
      .populate("programs", "name code")
      .populate("prerequisites", "name code")

    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }

    res.status(200).json({
      success: true,
      data: course,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server Error" })
  }
}

// Update course
exports.updateCourse = async (req, res) => {
  try {
    const { name, code, creditHours, department, programs, description, prerequisites } = req.body

    // Check if course exists
    let course = await Course.findById(req.params.id)

    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }

    // If department is being changed, check if it exists
    if (department && department !== course.department.toString()) {
      const departmentExists = await Department.findById(department)
      if (!departmentExists) {
        return res.status(404).json({ message: "Department not found" })
      }
    }

    // Check if updated code conflicts with existing courses in the same department
    if (code !== course.code || department !== course.department.toString()) {
      const existingCourse = await Course.findOne({
        _id: { $ne: req.params.id },
        code,
        department: department || course.department,
      })

      if (existingCourse) {
        return res.status(400).json({
          message: "Course with this code already exists in this department",
        })
      }
    }

    // Validate programs if provided
    if (programs && programs.length > 0) {
      const deptId = department || course.department
      const programsExist = await Program.find({
        _id: { $in: programs },
        department: deptId,
      })

      if (programsExist.length !== programs.length) {
        return res.status(400).json({
          message: "One or more programs do not exist in the specified department",
        })
      }
    }

    // Validate prerequisites if provided
    if (prerequisites && prerequisites.length > 0) {
      const prerequisitesExist = await Course.find({
        _id: { $in: prerequisites },
      })

      if (prerequisitesExist.length !== prerequisites.length) {
        return res.status(400).json({
          message: "One or more prerequisites do not exist",
        })
      }
    }

    course = await Course.findByIdAndUpdate(
      req.params.id,
      {
        name,
        code,
        creditHours,
        department,
        programs,
        description,
        prerequisites,
      },
      { new: true, runValidators: true },
    )
      .populate("department", "name code")
      .populate("programs", "name code")
      .populate("prerequisites", "name code")

    res.status(200).json({
      success: true,
      data: course,
      message: "Course updated successfully",
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server Error" })
  }
}

// Delete course
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)

    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }

    await course.deleteOne()

    res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server Error" })
  }
}

