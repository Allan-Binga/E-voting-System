const client = require("../config/db");

// General Election Creation
const createGeneralElection = async (req, res) => {
  const { title, description, startDate, endDate, status } = req.body;

  try {
    // Validate required fields
    if (!title || !description || !startDate || !endDate || !status) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate that endDate is exactly 24 hours after startDate
    const start = new Date(startDate);
    const end = new Date(endDate);

    const query = `
      INSERT INTO elections (title, description, start_date, end_date, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [title, description, start, end, status];

    const result = await client.query(query, values);

    res.status(201).json({
      message: "Election created successfully",
      election: result.rows[0],
    });
  } catch (error) {
    console.error("Error creating election:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//Get General Elections
const getElections = async (req, res) => {
  try {
    const electionsQuery = "SELECT * FROM elections";
    const electionResult = await client.query(electionsQuery);

    return res.status(200).json({
      message: "Elections retrieved successfully.",
      elections: electionResult.rows,
    });
  } catch (error) {
    console.error("Error fetching elections:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//Delete elections
const deleteElections = async (req, res) => {
  try {
    
  } catch (error) {
    
  }
}

module.exports = {
  getElections,
  createGeneralElection,
  deleteElections,
};
