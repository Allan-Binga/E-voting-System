const client = require("../config/db");

//Fetch Voters
const getVoters = async (req, res) => {
  try {
    //Voters
    const votersQuery = "SELECT * FROM users";
    const result = await client.query(votersQuery);

    return res.status(200).json({
      message: "Retrieved voters.",
      voters: result.rows,
    });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { getVoters };
