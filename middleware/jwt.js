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

module.exports = { authUser };
