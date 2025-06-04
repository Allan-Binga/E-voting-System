const client = require("../config/db");
const jwt = require("jsonwebtoken");

function euclideanDistance(arr1, arr2) {
  if (arr1.length !== arr2.length) return Infinity;

  let sum = 0;
  for (let i = 0; i < arr1.length; i++) {
    const diff = arr1[i] - arr2[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

//Register Voter
const registerVoter = async (req, res) => {
  const { firstName, lastName, email, biometricData } = req.body;

  // Convert to Buffer (Float32 to bytes)
  const buffer = Buffer.from(new Float32Array(biometricData).buffer);

  //Verify Required Fields
  if (!firstName || !lastName || !email || !biometricData) {
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
    const insertUserQuery = `INSERT INTO users(first_name, last_name, email, biometric_data, status) values ($1, $2, $3, $4, $5) RETURNING user_id, first_name, last_name, email, biometric_data, status`;

    const newUser = await client.query(insertUserQuery, [
      firstName,
      lastName,
      email,
      buffer,
      "Active",
    ]);

    // const userId = newUser.rows[0].user_id

    res.status(201).json({ message: "Successful registration" });
  } catch (error) {
    console.error("User registration error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Login Voter
const loginVoter = async (req, res) => {
  const { email, biometricData } = req.body;

  if (!email || !biometricData) {
    return res
      .status(400)
      .json({ message: "Email and biometric data are required." });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email address." });
  }

  try {
    // Check if user exists
    const getUserQuery = "SELECT * FROM users WHERE email = $1";
    const result = await client.query(getUserQuery, [email]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    const user = result.rows[0];

    // Convert stored biometric data from buffer to Float32Array
    const storedDescriptor = new Float32Array(
      user.biometric_data.buffer,
      user.biometric_data.byteOffset,
      user.biometric_data.length / Float32Array.BYTES_PER_ELEMENT
    );

    // Convert incoming descriptor to Float32Array
    const incomingDescriptor = new Float32Array(biometricData);

    // Compare using Euclidean distance
    const distance = euclideanDistance(storedDescriptor, incomingDescriptor);
    const THRESHOLD = 0.4; // You can fine-tune this threshold

    if (distance > THRESHOLD) {
      return res
        .status(401)
        .json({ message: "Biometric authentication failed." });
    }

    // If match, generate JWT token
    const token = jwt.sign(
      {
        id: user.user_id,
        email: user.email,
        name: `${user.first_name} ${user.last_name}`,
      },
      process.env.JWT_SECRET || "defaultSecret",
      { expiresIn: "2h" }
    );

    //Set the cookie
    res.cookie("userVotingSession", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Login successful",
      voter: {
        id: user.user_id,
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = { registerVoter, loginVoter };
