const client = require("../config/db");

// General Election Creation
const createGeneralElection = async (req, res) => {
  const { title, startTime, endTime } = req.body;

  try {
    // Validate required fields
    if (!title || !startTime || !endTime) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate that endTime is exactly 24 hours after startTime
    const start = new Date(startTime);
    const end = new Date(endTime);
    const timeDifference = end - start;
    const twentyFourHoursInMs = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    if (timeDifference !== twentyFourHoursInMs) {
      return res
        .status(400)
        .json({ message: "Election duration must be exactly 24 hours" });
    }

    const query = `
      INSERT INTO elections (title, start_time, end_time)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const values = [title, startTime, endTime];

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

//Create Positions - Delegates
const createDelegatePositions = async (req, res) => {
  const { positionName, numberOfSlots } = req.body;
  try {
  } catch (error) {}
};

//Create Positions - Executive
const createExecutivePositions = async (req, res) => {
  const {positionName, numberOfSlots} = req.body
  try {
  } catch (error) {}
};

module.exports = {
  createGeneralElection,
  createDelegatePositions,
  createExecutivePositions,
};
