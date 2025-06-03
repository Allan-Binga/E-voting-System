const client = require("../config/db");
const jwt = require("jsonwebtoken");

//Register Voter
const registerVoter = async (req, res) => {
  const { firstName, lastName, email, biometricData } = req.body;

  //Verify Required Fields
  if (!firstName || !lastName || !email) {
    return res.status(400).json({ message: "All fields are required." });
  }

  // Define regex patterns
  const nameRegex = /^[A-Za-z][A-Za-z'\-]{2,}$/; // At least 3 characters, letters, apostrophes, hyphens
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/; // Basic email structure

  // Validate name format
  if (!nameRegex.test(firstName)) {
    return res.status(400).json({
      message:
        "First name must be at least 3 characters and contain only valid characters.",
    });
  }
  if (!nameRegex.test(lastName)) {
    return res.status(400).json({
      message:
        "Last name must be at least 3 characters and contain only valid characters.",
    });
  }

  // Validate email format
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email address." });
  }
  try {
    //Check if user already exists
    const checkUserQuery = "SELECT * FROM users WHERE email = $1";
    const existingUser = await client.query(checkUserQuery, [email]);

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        message: "User already exists.",
      });
    }

    //Insert User
    const insertUserQuery = `INSERT INTO users(first_name, last_name, email, biometric_data, status) values ($1, $2, $3, $4, $5) RETURNING id, first_name, last_name, email, biometric_data, status`;

    const newUser = await client.query(insertUserQuery, [
      firstName,
      lastName,
      email,
      biometricData,
      "Active",
    ]);

    // const userId = newUser.rows[0].user_id

    res.status(201).json({ message: "Successful registration" });
  } catch (error) {
    console.error("User registration error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {registerVoter}