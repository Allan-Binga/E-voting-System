const client = require("../config/db");

//Get User's/Voter's Profile
const getMyVoterProfile = async (req, res) => {
  const voterId = req.userId;
  try {
    const voterQuery =
      "SELECT user_id, first_name, last_name, email, faculty, registration_number, voting_status, biometric_data FROM users WHERE user_id = $1";
    const voterResult = await client.query(voterQuery, [voterId]);

    if (voterResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const voter = voterResult.rows[0];
    const biometricImageUrl = voter.captured_image
      ? `data:image/jpeg;base64,${voter.captured_image.toString("base64")}`
      : null;

    return res.status(200).json({
      message: "Profile fetched.",
      profile: { ...voter, biometricImageUrl },
    });
  } catch (error) {
    console.error("Error fetching voter profile:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//Get Candidate's Profile
const getMyCandateProfile = async (req, res) => {
  const candidateId = req.candidateId;
  try {
    //Voter's Profile
    const candidateQuery = "SELECT * FROM candidates WHERE candidate_id = $1";
    const candidateResult = await client.query(candidateQuery, [candidateId]);

    return res.status(200).json({
      message: "Profile fetched.",
      profile: candidateResult.rows,
    });
  } catch (error) {
    console.error("Error fetching candidate profile:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//Get Admin's Profile
const getMyAdminProfile = async (req, res) => {
  const adminId = req.adminId;
  try {
    //Voter's Profile
    const adminQuery = "SELECT * FROM admins WHERE id = $1";
    const adminResult = await client.query(adminQuery, [adminId]);

    return res.status(200).json({
      message: "Profile fetched.",
      profile: adminResult.rows,
    });
  } catch (error) {
    console.error("Error fetching administrator profile:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { getMyVoterProfile, getMyCandateProfile, getMyAdminProfile };
