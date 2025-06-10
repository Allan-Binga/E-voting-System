const client = require("../config/db");

//Fetch Voters
const getVoters = async (req, res) => {
  try {
    //Voters
    const votersQuery = "SELECT * FROM users";
    const result = await client.query(votersQuery);

    return res.status(200).json({
      message: "Registered voters.",
      voters: result.rows,
    });
  } catch (error) {
    console.error("Error fetching voters:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//Fetch Candidates
const getCandidates = async (req, res) => {
  try {
    //Candidates
    const candidateQuery = "SELECT * FROM candidates";
    const result = await client.query(candidateQuery);
  } catch (error) {
    console.error("Error retrieving candidates.");
  }
};

//Fetch Administrators
const getAdmins = async (req, res) => {
  try {
    //Administrators
    const adminQuery = "SELECT * FROM admins";
    const result = await client.query(adminQuery);
  } catch (error) {
    console.error("Error fetching admins.");
  }
};

module.exports = { getVoters, getCandidates , getAdmins};
