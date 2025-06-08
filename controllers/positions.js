const client = require("../config/db");

//Get Positions
const getPositions = async (req, res) => {
  try {
    //Positions Query
    const positionsQuery = "SELECT * FROM positions";
    const positionsResult = await client.query(positionsQuery);

    return res.status(200).json({
      message: "Applications retrieved successfully.",
      positions: positionsResult.rows,
    });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { getPositions };
