const jwt = require('jsonwebtoken')

// Protect routes
exports.protect = async (req, res, next) => {
  try {
    let token
    
    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1]
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' })
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    // Add user to request
    req.user = {
      userId: decoded.userId,
      role: decoded.role
    }

    next()
  } catch (error) {
    res.status(401).json({ message: 'Not authorized, token failed' })
  }
}

// Authorize by role
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `User role ${req.user.role} is not authorized to access this route` 
      })
    }
    next()
  }
}
