const Department = require("../models/Department")
const User = require("../models/User")

// Create a new department
exports.createDepartment = async (req, res) => {
  try {
    const { name, code, description, director } = req.body

    // Check if department already exists
    const existingDepartment = await Department.findOne({
      $or: [{ name }, { code }],
    })

    if (existingDepartment) {
      return res.status(400).json({
        message: "Department with this name or code already exists",
      })
    }

    // Validate director if provided
    if (director) {
      const directorExists = await User.findOne({
        _id: director,
        role: "Director",
      })

      if (!directorExists) {
        return res.status(404).json({ message: "Director not found" })
      }
    }

    const department = new Department({
      name,
      code,
      description,
      director,
    })

    await department.save()

    res.status(201).json({
      success: true,
      data: department,
      message: "Department created successfully",
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server Error" })
  }
}

// Get all departments
exports.getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.find().populate("director", "name email")

    res.status(200).json({
      success: true,
      count: departments.length,
      data: departments,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server Error" })
  }
}

// Get department by ID
exports.getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id).populate("director", "name email")

    if (!department) {
      return res.status(404).json({ message: "Department not found" })
    }

    res.status(200).json({
      success: true,
      data: department,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server Error" })
  }
}

// Update department
exports.updateDepartment = async (req, res) => {
  try {
    const { name, code, description, director } = req.body

    // Check if department exists
    let department = await Department.findById(req.params.id)

    if (!department) {
      return res.status(404).json({ message: "Department not found" })
    }

    // Check if updated name or code conflicts with existing departments
    if (name !== department.name || code !== department.code) {
      const existingDepartment = await Department.findOne({
        _id: { $ne: req.params.id },
        $or: [{ name }, { code }],
      })

      if (existingDepartment) {
        return res.status(400).json({
          message: "Department with this name or code already exists",
        })
      }
    }

    // Validate director if provided
    if (director) {
      const directorExists = await User.findOne({
        _id: director,
        role: "Director",
      })

      if (!directorExists) {
        return res.status(404).json({ message: "Director not found" })
      }
    }

    department = await Department.findByIdAndUpdate(
        req.params.id,
        { name, code, description, director },
        { new: true, runValidators: true },
    ).populate("director", "name email")

    res.status(200).json({
      success: true,
      data: department,
      message: "Department updated successfully",
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server Error" })
  }
}

// Delete department
exports.deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id)

    if (!department) {
      return res.status(404).json({ message: "Department not found" })
    }

    await department.deleteOne()

    res.status(200).json({
      success: true,
      message: "Department deleted successfully",
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server Error" })
  }
}

