const Semester = require("../models/Semester")

// Create a new semester
exports.createSemester = async (req, res) => {
  try {
    const { name, year, startDate, endDate, isActive } = req.body

    // Check if semester already exists in the same year
    const existingSemester = await Semester.findOne({ name, year })

    if (existingSemester) {
      return res.status(400).json({
        message: `${name} ${year} already exists`,
      })
    }

    // If setting this semester as active, deactivate all other semesters
    if (isActive) {
      await Semester.updateMany({}, { isActive: false })
    }

    const semester = new Semester({
      name,
      year,
      startDate,
      endDate,
      isActive: isActive || false,
    })

    await semester.save()

    res.status(201).json({
      success: true,
      data: semester,
      message: "Semester created successfully",
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server Error" })
  }
}

// Get all semesters
exports.getAllSemesters = async (req, res) => {
  try {
    const semesters = await Semester.find().sort({ year: -1, startDate: -1 })

    res.status(200).json({
      success: true,
      count: semesters.length,
      data: semesters,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server Error" })
  }
}

// Get active semester
exports.getActiveSemester = async (req, res) => {
  try {
    const semester = await Semester.findOne({ isActive: true })

    if (!semester) {
      return res.status(404).json({ message: "No active semester found" })
    }

    res.status(200).json({
      success: true,
      data: semester,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server Error" })
  }
}

// Get semester by ID
exports.getSemesterById = async (req, res) => {
  try {
    const semester = await Semester.findById(req.params.id)

    if (!semester) {
      return res.status(404).json({ message: "Semester not found" })
    }

    res.status(200).json({
      success: true,
      data: semester,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server Error" })
  }
}

// Update semester
// exports.updateSemester = async (req, res) => {
//   try {
//     const { name
//   }
// };

// Update semester
exports.updateSemester = async (req, res) => {
  try {
    const { name, year, startDate, endDate, isActive } = req.body;
    
    // Check if semester exists
    let semester = await Semester.findById(req.params.id);
    
    if (!semester) {
      return res.status(404).json({ message: "Semester not found" });
    }
    
    // Check if updated name and year conflict with existing semesters
    if (name !== semester.name || year !== semester.year) {
      const existingSemester = await Semester.findOne({
        _id: { $ne: req.params.id },
        name,
        year
      });
      
      if (existingSemester) {
        return res.status(400).json({ 
          message: `${name} ${year} already exists` 
        });
      }
    }
    
    // If setting this semester as active, deactivate all other semesters
    if (isActive && !semester.isActive) {
      await Semester.updateMany({ _id: { $ne: req.params.id } }, { isActive: false });
    }
    
    semester = await Semester.findByIdAndUpdate(
      req.params.id,
      { name, year, startDate, endDate, isActive },
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      data: semester,
      message: "Semester updated successfully"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Delete semester
exports.deleteSemester = async (req, res) => {
  try {
    const semester = await Semester.findById(req.params.id);
    
    if (!semester) {
      return res.status(404).json({ message: "Semester not found" });
    }
    
    await semester.deleteOne();
    
    res.status(200).json({
      success: true,
      message: "Semester deleted successfully"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

