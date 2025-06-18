const client = require("../config/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { sendOTPEmail } = require("./emailService");

function euclideanDistance(arr1, arr2) {
  if (arr1.length !== arr2.length) return Infinity;

  let sum = 0;
  for (let i = 0; i < arr1.length; i++) {
    const diff = arr1[i] - arr2[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

//Get All Candidates
const getCandidates = async (req, res) => {
  try {
    //Candidates
    const candidateQuery = "SELECT * FROM candidates";
    const candidateResult = await client.query(candidateQuery);

    return res.status(200).json({
      message: "Candidates retrieved.",
      candidates: candidateResult.rows,
    });
  } catch (error) {
    console.error("Error fetching candidates:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Register Candidate
const registerCandidate = async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    biometricData,
    faculty,
    registrationNumber,
  } = req.body;

  if (
    !firstName ||
    !lastName ||
    !email ||
    !biometricData ||
    !faculty ||
    !registrationNumber
  ) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const nameRegex = /^[A-Za-z][A-Za-z'\-]{2,}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const regNoRegex = /^[A-Z]{3}-\d{3}-\d{3}\/\d{4}$/; // e.g., CIT-123-123/2025

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

  // Faculty code mapping
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
    // Check if candidate already exists
    const checkCandidateQuery = "SELECT * FROM candidates WHERE email = $1";
    const existingCandidate = await client.query(checkCandidateQuery, [email]);

    if (existingCandidate.rows.length > 0) {
      return res.status(409).json({
        message: "Candidate already exists.",
      });
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

    const buffer = Buffer.from(new Float32Array(biometricData).buffer);

    // Insert candidate
    const insertCandidateQuery = `
      INSERT INTO candidates (first_name, last_name, email, faculty, biometric_data, registration_number, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING candidate_id
    `;
    const insertResult = await client.query(insertCandidateQuery, [
      firstName,
      lastName,
      email,
      faculty,
      buffer,
      registrationNumber,
      "Active",
    ]);

    res.status(201).json({ message: "Successful registration" });
  } catch (error) {
    console.error("Candidate registration error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Login Candidate
const loginCandidate = async (req, res) => {
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
    const getCandidateQuery = "SELECT * FROM candidates WHERE email = $1";
    const result = await client.query(getCandidateQuery, [email]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Candidate not found." });
    }

    const candidate = result.rows[0];

    // Convert stored biometric data from buffer to Float32Array
    const storedDescriptor = new Float32Array(
      candidate.biometric_data.buffer,
      candidate.biometric_data.byteOffset,
      candidate.biometric_data.length / Float32Array.BYTES_PER_ELEMENT
    );

    // Convert incoming descriptor to Float32Array
    const incomingDescriptor = new Float32Array(biometricData);

    // Compare using Euclidean distance
    const distance = euclideanDistance(storedDescriptor, incomingDescriptor);
    const THRESHOLD = 0.4; //

    if (distance > THRESHOLD) {
      return res
        .status(401)
        .json({ message: "Biometric authentication failed." });
    }

    // If match, generate JWT token
    const token = jwt.sign(
      {
        id: candidate.user_id,
        email: candidate.email,
        name: `${candidate.first_name} ${candidate.last_name}`,
      },
      process.env.JWT_SECRET || "defaultSecret",
      { expiresIn: "24h" }
    );

    //Set the cookie
    res.cookie("candidateVotingSession", token, {
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

//Login Candidate with OTP
const loginWithOTP = async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: "Email is required." });

  try {
    //Check if Candidate Exists
    const candidateResult = await client.query(
      "SELECT * FROM candidates WHERE email = $1",
      [email]
    );

    if (candidateResult.rows.length === 0) {
      return res.status(404).json({ message: "Candidate not found." });
    }

    const candidate = candidateResult.rows[0];

    //Generate 6-Digit OTP
    const otp = Math.floor(100000 + Math.random() * 90000).toString();

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

    //Insert OTP into DB
    await client.query(
      `INSERT INTO otps(candidate_id, otp_code, expires_at, verified) VALUES ($1, $2, $3, $4)`,
      [candidate.candidate_id, otp, expiresAt, "false"]
    );

    //Send OTP
    await sendOTPEmail(email, otp);

    res.status(200).json({ message: "OTP sent to email" });
  } catch (error) {
    console.error("OTP Login Error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

//Logout Candidate
const logoutCandidate = async (req, res) => {
  try {
    if (!req.cookies?.candidateVotingSession) {
      return res.status(409).json({ message: "You are not logged in." });
    }
    res.clearCookie("candidateVotingSession");
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Voter logout Error:", error);
    res.status(500).json({ message: "Error occurred during logout." });
  }
};

// Update Candidate
const updateCandidate = async (req, res) => {
  const { candidateId } = req.params;
  const { first_name, last_name, faculty, registration_number } = req.body;

  try {
    // Collect only provided fields
    const fields = [];
    const values = [];
    let index = 1;

    if (first_name) {
      fields.push(`first_name = $${index++}`);
      values.push(first_name);
    }
    if (last_name) {
      fields.push(`last_name = $${index++}`);
      values.push(last_name);
    }
    if (faculty) {
      fields.push(`faculty = $${index++}`);
      values.push(faculty);
    }
    if (registration_number) {
      fields.push(`registration_number = $${index++}`);
      values.push(registration_number);
    }

    if (fields.length === 0) {
      return res
        .status(400)
        .json({ message: "No fields provided for update." });
    }

    // Add candidateId as the last value
    values.push(candidateId);

    const updateQuery = `
      UPDATE candidates
      SET ${fields.join(", ")}
      WHERE candidate_id = $${values.length}
      RETURNING *
    `;

    const result = await client.query(updateQuery, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Candidate not found." });
    }

    res.status(200).json({
      message: "Candidate updated successfully.",
      candidate: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating candidate:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Delete Candidate
const deleteCandidate = async (req, res) => {
  const { candidateId } = req.params;

  try {
    // Check if candidate exists
    const checkQuery = "SELECT * FROM candidates WHERE candidate_id = $1";
    const checkResult = await client.query(checkQuery, [candidateId]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: "Candidate not found." });
    }

    // Step 1: Delete related votes
    const deleteVotesQuery = "DELETE FROM votes WHERE candidate_id = $1";
    await client.query(deleteVotesQuery, [candidateId]);

    // Step 2: Delete candidate
    const deleteCandidateQuery =
      "DELETE FROM candidates WHERE candidate_id = $1";
    await client.query(deleteCandidateQuery, [candidateId]);

    return res
      .status(200)
      .json({ message: "Candidate and related votes deleted successfully." });
  } catch (error) {
    console.error("Error deleting candidate:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = {
  getCandidates,
  registerCandidate,
  loginCandidate,
  loginWithOTP,
  logoutCandidate,
  updateCandidate,
  deleteCandidate,
};
