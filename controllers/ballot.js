const client = require("../config/db");

//Get Ballots
const getBallot = async (req, res) => {
  try {
    //Ballot Query
    const ballotQuery = "SELECT * FROM ballot";
    const ballotResult = await client.query(ballotQuery);

    return res.status(200).json({
      message: "Ballot retrieved.",
      ballots: ballotResult.rows,
    });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { getBallot };
