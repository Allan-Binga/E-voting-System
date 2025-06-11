const client = require("../config/db");

//Fetch Voters
const getVoters = async (req, res) => {
  try {
    // Fetch candidates
    const candidatesQuery = "SELECT * FROM candidates";
    const candidatesResult = await client.query(candidatesQuery);

    // Fetch users
    const usersQuery = "SELECT * FROM users";
    const usersResult = await client.query(usersQuery);

    return res.status(200).json({
      message: "Fetched voters, candidates, and users.",
      candidates: candidatesResult.rows,
      users: usersResult.rows,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
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

module.exports = { getVoters, getCandidates, getAdmins };
