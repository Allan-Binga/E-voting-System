const client = require("../config/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

function euclideanDistance(arr1, arr2) {
  if (arr1.length !== arr2.length) return Infinity;

  let sum = 0;
  for (let i = 0; i < arr1.length; i++) {
    const diff = arr1[i] - arr2[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

const registerCandidate = async (req, res) => {
  const { firstName, lastName, email, biometricData, faculty } = req.body;

  if (!firstName || !lastName || !email || !biometricData || !faculty) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const nameRegex = /^[A-Za-z][A-Za-z'\-]{2,}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

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

  // Faculty code mapping
  const facultyCodes = {
    "Business & Economics": "BUS",
    "Engineering & Technology": "ENG",
    "Science & Technology": "SCT",
    "Computing & Information Technology": "CIT",
    "Social Sciences & Technology": "SST",
    "Media & Communication": "MCS",
  };

  const facultyCode = facultyCodes[faculty];
  if (!facultyCode) {
    return res.status(400).json({ message: "Invalid faculty selection." });
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

    const buffer = Buffer.from(new Float32Array(biometricData).buffer);

    // Insert candidate without admission number
    const insertCandidateQuery = `
      INSERT INTO candidates (first_name, last_name, email, faculty, biometric_data)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING candidate_id
    `;
    const insertResult = await client.query(insertCandidateQuery, [
      firstName,
      lastName,
      email,
      faculty,
      buffer,
    ]);

    const candidateId = insertResult.rows[0].candidate_id;
    const admissionNumber = `CAND-${facultyCode}-${candidateId}-2025`;

    // Update candidate with generated admission number
    const updateAdmissionQuery = `
      UPDATE candidates
      SET registration_number = $1
      WHERE candidate_id = $2
    `;
    await client.query(updateAdmissionQuery, [admissionNumber, candidateId]);

    res
      .status(201)
      .json({ message: "Successful registration", admissionNumber });
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
      { expiresIn: "2h" }
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

//Update candidate
const updateCandidate = async (req, res) => {
  try {
  } catch (error) {}
};

//Delete Candidate
const deleteCandidate = async (req, res) => {
  try {
  } catch (error) {}
};

//Apply for a position -Delegates or Executive
const applyPosition = async (req, res) => {
  const candidateId = req.candidateId;

  const { positionContested, manifesto, facultyRepresented } = req.body;
  try {
  } catch (error) {}
};

module.exports = {
  registerCandidate,
  loginCandidate,
  updateCandidate,
  deleteCandidate,
  applyPosition,
};
