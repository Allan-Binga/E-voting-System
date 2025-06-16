const { Client } = require("pg");
const client = require("../config/db");

// General Election Creation
const createGeneralElection = async (req, res) => {
  const {
    title,
    description,
    startDate,
    endDate,
    status,
    delegatePositions,
    executivePositions,
  } = req.body;

  try {
    // Validate required fields
    if (
      !title ||
      !description ||
      !startDate ||
      !endDate ||
      !status ||
      !delegatePositions ||
      !executivePositions
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate that endDate is exactly 24 hours after startDate
    const start = new Date(startDate);
    const end = new Date(endDate);

    const query = `
      INSERT INTO elections (title, description, start_date, end_date, status, delegates, executives)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    const values = [
      title,
      description,
      start,
      end,
      status,
      delegatePositions,
      executivePositions,
    ];

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

//Update Election
const updateElection = async (req, res) => {
  const { electionId } = req.params;
  const {
    title,
    description,
    start_date,
    end_date,
    status,
    delegates,
    executives,
  } = req.body;

  try {
    //Collect only provided fields
    const fields = [];
    const values = [];
    let index = 1;

    if (title) {
      fields.push(`title = $${index++}`);
      values.push(title);
    }
    if (description) {
      fields.push(`description = $${index++}`);
      values.push(description);
    }
    if (start_date) {
      fields.push(`start_date = $${index++}`);
      values.push(start_date);
    }
    if (end_date) {
      fields.push(`end_date = $${index++}`);
      values.push(end_date);
    }
    if (status) {
      fields.push(`status = $${index++}`);
      values.push(status);
    }
    if (delegates) {
      fields.push(`delegates = $${index++}`);
      values.push(delegates);
    }
    if (executives) {
      fields.push(`executives = $${index++}`);
      values.push(executives);
    }

    if (fields.length === 0) {
      return res
        .status(400)
        .json({ message: "No fields provided for update." });
    }

    // Add electionId as the last value
    values.push(electionId);

    const updateQuery = `
    UPDATE elections
    SET ${fields.join(", ")}
    WHERE id = $${values.length}
    RETURNING *
    `;

    const result = await client.query(updateQuery, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Election not found." });
    }

    res.status(200).json({
      message: "Election updated successfully.",
      election: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating election:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

//Delete elections
const deleteElections = async (req, res) => {
  const { electionId } = req.params;

  try {
    //Check if election exists
    const checkQuery = "SELECT * FROM elections WHERE id = $1";
    const checkResult = await client.query(checkQuery, [electionId]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: "Election not found." });
    }

    // Delete candidate
    const deleteQuery = "DELETE FROM elections WHERE id = $1";
    await client.query(deleteQuery, [electionId]);

    return res.status(200).json({ message: "Election deleted successfully." });
  } catch (error) {
    console.error("Error deleting election.", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = {
  getElections,
  createGeneralElection,
  updateElection,
  deleteElections,
};
