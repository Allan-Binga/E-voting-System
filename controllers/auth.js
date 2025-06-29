const client = require("../config/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { sendOTPEmail, sendWelcomeEmail } = require("./emailService");

// Register Voter
const registerVoter = async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    faculty,
    biometricData,
    registrationNumber,
    password,
  } = req.body;

  if (
    !firstName ||
    !lastName ||
    !email ||
    !faculty ||
    !biometricData ||
    !registrationNumber ||
    !password
  ) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const nameRegex = /^[A-Za-z][A-Za-z'\-]{2,}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const regNoRegex = /^[A-Z]{3}-\d{3}-\d{3}\/\d{4}$/;

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

  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email address." });
  }

  if (!regNoRegex.test(registrationNumber)) {
    return res.status(400).json({
      message:
        "Invalid registration number format. Use format: CIT-123-123/2025",
    });
  }

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      message:
        "Password must be at least 8 characters long, include one uppercase letter, one lowercase letter, one number, and one special character.",
    });
  }

  const facultyCodes = {
    "Business and Economics": "BUS",
    "Engineering and Technology": "ENG",
    "Science and Technology": "SCT",
    "Computing and Information Technology": "CIT",
    "Social Sciences and Technology": "SST",
    "Media and Communication": "MCS",
  };

  const facultyCode = facultyCodes[faculty];
  if (!facultyCode) {
    return res.status(400).json({ message: "Invalid faculty selection." });
  }

  const regPrefix = registrationNumber.split("/")[0].split("-")[0];
  if (regPrefix !== facultyCode) {
    return res.status(400).json({
      message: `Registration number prefix (${regPrefix}) does not match selected faculty code (${facultyCode}).`,
    });
  }

  try {
    // Check if email already exists
    const checkUserQuery = "SELECT * FROM users WHERE email = $1";
    const existingUser = await client.query(checkUserQuery, [email]);

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ message: "User already exists." });
    }

    // Validate biometric data format
    if (
      !Array.isArray(biometricData) ||
      biometricData.some((val) => typeof val !== "number")
    ) {
      return res
        .status(400)
        .json({ message: "Invalid biometric data format." });
    }

    const newEmbedding = new Float32Array(biometricData);
    const buffer = Buffer.from(newEmbedding.buffer);

    // 🔐 Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Insert user including hashed password
    const insertUserQuery = `
      INSERT INTO users (
        first_name,
        last_name,
        email,
        faculty,
        biometric_data,
        registration_number,
        password,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING user_id
    `;
    const insertResult = await client.query(insertUserQuery, [
      firstName,
      lastName,
      email,
      faculty,
      buffer,
      registrationNumber,
      hashedPassword,
      "Active",
    ]);

    const userId = insertResult.rows[0].user_id;

    await sendWelcomeEmail(firstName, lastName, email);

    res
      .status(201)
      .json({ message: "Successful registration", registrationNumber });
  } catch (error) {
    console.error("User registration error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Login Voter
const loginVoter = async (req, res) => {
  const { email, password } = req.body;
  // console.log(email)
  // console.log(password)

  // Input validation
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required." });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email address." });
  }

  try {
    // Fetch user by email
    const getUserQuery = "SELECT * FROM users WHERE email = $1";
    const result = await client.query(getUserQuery, [email]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    const user = result.rows[0];

    // Compare password with hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.user_id,
        email: user.email,
        name: `${user.first_name} ${user.last_name}`,
      },
      process.env.JWT_SECRET || "defaultSecret",
      { expiresIn: "24h" }
    );

    // Set the cookie
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
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

//Login Voter with OTP
const loginWithOTP = async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: "Email is required." });

  try {
    //Check if user exists
    const userResult = await client.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    const user = userResult.rows[0];

    //Generate 6-Digit OTP
    const otp = Math.floor(100000 + Math.random() * 90000).toString();

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

    // Insert OTP into Database
    await client.query(
      `INSERT INTO otps (user_id, otp_code, expires_at, verified) VALUES ($1, $2, $3, $4)`,
      [user.user_id, otp, expiresAt, "false"]
    );

    //Send OTP
    await sendOTPEmail(email, otp);

    return res.status(200).json({ message: "OTP sent to email." });
  } catch (error) {
    console.error("OTP Login Error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

//Logout Voter
const logoutVoter = async (req, res) => {
  try {
    if (!req.cookies?.userVotingSession) {
      return res.status(409).json({ message: "You are not logged in." });
    }
    res.clearCookie("userVotingSession");
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Voter logout Error:", error);
    res.status(500).json({ message: "Error occurred during logout." });
  }
};

// Register Administrator
const registerAdmin = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  // Verify required fields
  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }
  const nameRegex = /^[A-Za-z][A-Za-z'\-]{2,}$/;

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
  // Email Format Validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format." });
  }

  // Password Strength Validation
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      message:
        "Password must be at least 8 characters long, include one uppercase letter, one lowercase letter, one number, and one special character.",
    });
  }

  try {
    // Check if admin already exists
    const checkAdminQuery = `SELECT * FROM admins WHERE email = $1`;
    const existingAdmin = await client.query(checkAdminQuery, [email]);

    if (existingAdmin.rows.length > 0) {
      return res.status(409).json({ message: "Email already registered." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new admin
    const insertQuery = `
      INSERT INTO admins (first_name, last_name, email, password)
      VALUES ($1, $2, $3, $4)
      RETURNING id, first_name, last_name, email;
    `;

    const result = await client.query(insertQuery, [
      firstName,
      lastName,
      email,
      hashedPassword,
    ]);

    res.status(201).json({
      message: "Administrator registered successfully.",
      admin: result.rows[0],
    });
  } catch (error) {
    console.error("Admin Registration Error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

//Login Administrator
const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  if (req.cookies?.adminVotingSession) {
    return res.status(400).json({ message: "You are already logged in." });
  }
  try {
    //Check if Admin exists
    const checkAdminQuery = "SELECT * FROM admins WHERE email = $1";
    const admin = await client.query(checkAdminQuery, [email]);

    if (admin.rows.length === 0) {
      return res
        .status(401)
        .json({ message: "Invalid credentials. Please try again." });
    }

    //Verify Password
    const isPasswordValid = await bcrypt.compare(
      password,
      admin.rows[0].password
    );

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    //Create JWT
    const adminToken = jwt.sign(
      {
        id: admin.rows[0].id,
        role: "Administrator",
        email: admin.rows[0].email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    //Set Cookie
    res.cookie("adminVotingSession", adminToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Login successful",
      admin: {
        id: admin.rows[0].id,
        email: admin.rows[0].email,
      },
    });
  } catch (error) {
    console.error("Admin login error", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Admin Logout
const logoutAdmin = async (req, res) => {
  try {
    if (!req.cookies?.adminVotingSession) {
      return res.status(400).json({ message: "You are not logged in." });
    }

    res.clearCookie("adminVotingSession");
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Admin Logout Error:", error);
    res.status(500).json({ message: "Error occurred during logout." });
  }
};

module.exports = {
  registerVoter,
  loginVoter,
  loginWithOTP,
  registerAdmin,
  loginAdmin,
  logoutVoter,
  logoutAdmin,
};
