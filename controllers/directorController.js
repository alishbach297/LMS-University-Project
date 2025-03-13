const User = require("../models/User")
const Department = require("../models/Department")
const bcrypt = require("bcrypt")

// Register a new director
exports.registerDirector = async (req, res) => {
    try {
        const { name, email, password, departmentId } = req.body

        // Check if user already exists
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" })
        }

        // Check if department exists
        if (departmentId) {
            const department = await Department.findById(departmentId)
            if (!department) {
                return res.status(404).json({ message: "Department not found" })
            }

            // Check if department already has a director
            if (department.director) {
                return res.status(400).json({
                    message: "Department already has a director assigned",
                })
            }
        }

        // Create user with Director role
        const hashedPassword = await bcrypt.hash(password, 10)
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role: "Director",
        })

        await newUser.save()

        // Assign director to department if provided
        if (departmentId) {
            await Department.findByIdAndUpdate(departmentId, { director: newUser._id }, { runValidators: true })
        }

        res.status(201).json({
            success: true,
            message: "Director registered successfully",
            data: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                departmentId: departmentId || null,
            },
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Server Error" })
    }
}

// Get all directors
exports.getAllDirectors = async (req, res) => {
    try {
        const directors = await User.find({ role: "Director" }).select("-password")

        // Get department information for each director
        const directorsWithDepartments = await Promise.all(
            directors.map(async (director) => {
                const department = await Department.findOne({ director: director._id }).select("name code")

                return {
                    ...director.toObject(),
                    department: department || null,
                }
            }),
        )

        res.status(200).json({
            success: true,
            count: directorsWithDepartments.length,
            data: directorsWithDepartments,
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Server Error" })
    }
}

// Get director by ID
exports.getDirectorById = async (req, res) => {
    try {
        const director = await User.findOne({
            _id: req.params.id,
            role: "Director",
        }).select("-password")

        if (!director) {
            return res.status(404).json({ message: "Director not found" })
        }

        // Get department information
        const department = await Department.findOne({ director: director._id }).select("name code")

        res.status(200).json({
            success: true,
            data: {
                ...director.toObject(),
                department: department || null,
            },
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Server Error" })
    }
}

// Update director
exports.updateDirector = async (req, res) => {
    try {
        const { name, email, departmentId } = req.body

        // Check if director exists
        const director = await User.findOne({
            _id: req.params.id,
            role: "Director",
        })

        if (!director) {
            return res.status(404).json({ message: "Director not found" })
        }

        // Check if email is already used by another user
        if (email && email !== director.email) {
            const existingUser = await User.findOne({
                _id: { $ne: req.params.id },
                email,
            })

            if (existingUser) {
                return res.status(400).json({ message: "Email already in use" })
            }
        }

        // Update user information
        await User.findByIdAndUpdate(req.params.id, { name, email }, { runValidators: true })

        // Handle department assignment
        if (departmentId) {
            // Check if department exists
            const department = await Department.findById(departmentId)
            if (!department) {
                return res.status(404).json({ message: "Department not found" })
            }

            // Check if department already has a different director
            if (department.director && department.director.toString() !== req.params.id) {
                return res.status(400).json({
                    message: "Department already has a director assigned",
                })
            }

            // Remove director from any previously assigned department
            await Department.updateMany({ director: req.params.id }, { $unset: { director: "" } })

            // Assign to new department
            await Department.findByIdAndUpdate(departmentId, { director: req.params.id }, { runValidators: true })
        }

        // Get updated director data
        const updatedDirector = await User.findById(req.params.id).select("-password")

        const department = await Department.findOne({ director: req.params.id }).select("name code")

        res.status(200).json({
            success: true,
            message: "Director updated successfully",
            data: {
                ...updatedDirector.toObject(),
                department: department || null,
            },
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Server Error" })
    }
}
// Delete a director
exports.deleteDirector = async (req, res) => {
    try {
        const directorId = req.params.id;

        // Check if director exists
        const director = await User.findOne({ _id: directorId, role: "Director" });
        if (!director) {
            return res.status(404).json({ message: "Director not found" });
        }

        // Remove director from assigned department (if any)
        await Department.updateMany({ director: directorId }, { $unset: { director: "" } });

        // Delete the director
        await User.findByIdAndDelete(directorId);

        res.status(200).json({ success: true, message: "Director deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Assign director to department
exports.assignDirectorToDepartment = async (req, res) => {
    try {
        const { directorId, departmentId } = req.params

        // Check if director exists
        const director = await User.findOne({
            _id: directorId,
            role: "Director",
        })

        if (!director) {
            return res.status(404).json({ message: "Director not found" })
        }

        // Check if department exists
        const department = await Department.findById(departmentId)
        if (!department) {
            return res.status(404).json({ message: "Department not found" })
        }

        // Check if department already has a director
        if (department.director && department.director.toString() !== directorId) {
            return res.status(400).json({
                message: "Department already has a director assigned",
            })
        }

        // Remove director from any previously assigned department
        await Department.updateMany({ director: directorId }, { $unset: { director: "" } })

        // Assign director to department
        department.director = directorId
        await department.save()

        res.status(200).json({
            success: true,
            message: "Director assigned to department successfully",
            data: {
                director: {
                    id: director._id,
                    name: director.name,
                    email: director.email,
                },
                department: {
                    id: department._id,
                    name: department.name,
                    code: department.code,
                },
            },
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Server Error" })
    }
}

// Remove director from department
exports.removeDirectorFromDepartment = async (req, res) => {
    try {
        const { departmentId } = req.params

        // Check if department exists
        const department = await Department.findById(departmentId)
        if (!department) {
            return res.status(404).json({ message: "Department not found" })
        }

        // Check if department has a director
        if (!department.director) {
            return res.status(400).json({
                message: "Department does not have a director assigned",
            })
        }

        // Store director info before removing
        const directorId = department.director

        // Remove director from department
        department.director = undefined
        await department.save()

        res.status(200).json({
            success: true,
            message: "Director removed from department successfully",
            data: {
                departmentId,
                directorId,
            },
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Server Error" })
    }
}

