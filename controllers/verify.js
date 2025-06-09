const client = require("../config/db");
const jwt = require("jsonwebtoken");
const { sendOTPEmail } = require("./emailService");

//Verify OTP
const verifyOTP = async (req, res) => {
  //Check if a user is logged in
  if (req.cookies?.userVotingSession) {
    return res.status(400).json({ message: "You are already logged in." });
  }

  const { otp } = req.body;

  if (!otp) {
    return res.status(403).json({
      message: "An OTP is required.",
    });
  }

  try {
    // Check if the OTP exists
    const otpQuery = `SELECT * FROM otps WHERE otp_code = $1`;
    const otpResult = await client.query(otpQuery, [otp]);

    if (otpResult.rows.length === 0) {
      return res.status(404).json({ message: "Invalid OTP" });
    }

    const otpRecord = otpResult.rows[0];

    // Check expiry
    const now = new Date();
    const expiry = new Date(otpRecord.expires_at);

    if (now > expiry) {
      return res
        .status(401)
        .json({ message: "This OTP has expired. Please request a new OTP." });
    }

    // Increment attempt
    const updatedAttempts = otpRecord.attempts + 1;
    const updateAttemptsQuery = `
      UPDATE otps SET attempts = $1 WHERE otp_code = $2
    `;
    await client.query(updateAttemptsQuery, [updatedAttempts, otp]);

    // Mark OTP as verified (optional, if you're tracking this)
    await client.query(`UPDATE otps SET verified = true WHERE otp_code = $1`, [
      otp,
    ]);

    // Fetch user
    const userQuery = `SELECT * FROM users WHERE user_id = $1`;
    const userResult = await client.query(userQuery, [otpRecord.user_id]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = userResult.rows[0];

    // Create token
    const token = jwt.sign(
      {
        id: user.user_id,
        email: user.email,
        name: `${user.first_name} ${user.last_name}`,
      },
      process.env.JWT_SECRET || "defaultSecret",
      { expiresIn: "2h" }
    );

    res.cookie("userVotingSession", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Login successful via OTP",
      voter: {
        id: user.user_id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//Resend OTP
const resendOTP = async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: "Email is required." });
  try {
    const userResult = await client.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    const user = userResult.rows[0];
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

    // Insert new OTP
    await client.query(
      `INSERT INTO otps (user_id, otp_code, expires_at) VALUES ($1, $2, $3)`,
      [user.user_id, otp, expiresAt]
    );

    //Send OTP
    await sendOTPEmail(email, otp);

    return res.status(200).json({ message: "OTP resent to email." });
  } catch (error) {
    console.error("Resend OTP error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

//Verify Candidate OTP
const verifyCandidateOTP = async (req, res) => {
  const { otp } = req.body;
  //Check if a candidate is logged in
  if (req.cookies?.candidateVotingSession) {
    return res.status(400).json({ message: "You are already logged in." });
  }

  if (!otp) {
    return res.status(403).json({
      message: "An OTP is required.",
    });
  }

  try {
    // Check if the OTP exists
    const otpQuery = `SELECT * FROM otps WHERE otp_code = $1`;
    const otpResult = await client.query(otpQuery, [otp]);

    if (otpResult.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Invalid OTP. Please try again." });
    }

    const otpRecord = otpResult.rows[0];

    // Check expiry
    const now = new Date();
    const expiry = new Date(otpRecord.expires_at);

    if (now > expiry) {
      return res
        .status(401)
        .json({ message: "This OTP has expired. Please request a new OTP." });
    }

    // Increment attempt
    const updatedAttempts = otpRecord.attempts + 1;
    const updateAttemptsQuery = `
      UPDATE otps SET attempts = $1 WHERE otp_code = $2
    `;
    await client.query(updateAttemptsQuery, [updatedAttempts, otp]);

    // Mark OTP as verified (optional, if you're tracking this)
    await client.query(`UPDATE otps SET verified = true WHERE otp_code = $1`, [
      otp,
    ]);

    // Fetch candidate
    const candidateQuery = `SELECT * FROM candidates WHERE candidate_id = $1`;
    const candidateResult = await client.query(candidateQuery, [
      otpRecord.candidate_id,
    ]);

    if (candidateResult.rows.length === 0) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    const candidate = candidateResult.rows[0];

    // Create token
    const token = jwt.sign(
      {
        id: candidate.candidate_id,
        email: candidate.email,
        name: `${candidate.first_name} ${candidate.last_name}`,
      },
      process.env.JWT_SECRET || "defaultSecret",
      { expiresIn: "2h" }
    );

    res.cookie("candidateVotingSession", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Login successful via OTP",
      voter: {
        id: candidate.candidate_id,
        email: candidate.email,
      },
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//Resend OTP
const resendCandidateOTP = async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: "Email is required." });
  try {
    const candidateResult = await client.query(
      "SELECT * FROM candidates WHERE email = $1",
      [email]
    );

    if (candidateResult.rows.length === 0) {
      return res.status(404).json({ message: "Candidate not found." });
    }

    const candidate = candidateResult.rows[0];
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

    // Insert new OTP
    await client.query(
      `INSERT INTO otps (candidate_id, otp_code, expires_at) VALUES ($1, $2, $3)`,
      [candidate.candidate_id, otp, expiresAt]
    );

    //Send OTP
    await sendOTPEmail(email, otp);

    return res.status(200).json({ message: "OTP resent to email." });
  } catch (error) {
    console.error("Resend OTP error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = {
  verifyOTP,
  resendOTP,
  verifyCandidateOTP,
  resendCandidateOTP,
};
