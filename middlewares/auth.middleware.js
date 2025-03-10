import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const authenticate = async (req, res, next) => {
  try {
    let token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: "Authentication token is required" 
      });
    }

    token = token.split(" ")[1];
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid token format" 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).lean();
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    // Set user in request object
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: "Invalid or expired token",
      error: error.message 
    });
  }
};

export const authorize = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: "You don't have permission to access this resource" 
      });
    }
    next();
  };
};

