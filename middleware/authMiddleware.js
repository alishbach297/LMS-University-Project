const jwt = require("jsonwebtoken")
const User = require("../models/User")

// Protect routes - verify token
exports.protect = async (req, res, next) => {
    try {
        let token

        // Get token from header
        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1]
        }

        // Check if token exists
        if (!token) {
            return res.status(401).json({ message: "Not authorized to access this route" })
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "sk_test_51N1v9ICmXVqoMpIro7NtDGZMRKr7G52eFnTBCUpigRRqQqRCS7xqkoKRr9b1vPVQ7sMcbjOT0qh57RqewdaeAyhA00tFVt7Uq7")

        // Check if user still exists
        const user = await User.findById(decoded.id)
        if (!user) {
            return res.status(401).json({ message: "User no longer exists" })
        }

        // Set user in request
        req.user = user
        next()
    } catch (error) {
        console.error(error)
        res.status(401).json({ message: "Not authorized to access this route" })
    }
}

// Restrict to specific roles
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        console.log(req.user.role)
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Role (${req.user.role}) is not authorized to access this route`,
            })
        }
        next()
    }
}

// Check if user is the teacher of the course or a Head
exports.isTeacherOrHead = async (req, res, next) => {
    try {
        const { teacherId, courseOfferingId } = req.params

        // If user is Head, allow access
        if (req.user.role === "Head") {
            return next()
        }

        // If user is not the teacher specified in the params, deny access
        if (req.user.role === "Teacher" && req.user._id.toString() !== teacherId) {
            return res.status(403).json({
                message: "You are not authorized to access this resource",
            })
        }

        next()
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Server Error" })
    }
}

