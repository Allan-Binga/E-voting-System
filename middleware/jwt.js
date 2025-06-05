const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

//User ID middleware
const authUser = (req, res, next) => {
  try {
    const token = req.cookies.userVotingSession;
    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthoried. Please login as user." });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired user token." });
  }
};

//Admin ID middleware
const authAdmin = (req, res, next) => {
  try {
    const token = req.cookies.adminVotingSession;
    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized. Please login as an administrator" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.adminId = decoded.id;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired admin token." });
  }
};

module.exports = { authUser, authAdmin };
