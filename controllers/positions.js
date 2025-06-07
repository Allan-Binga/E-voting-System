const client = require("../config/db");

// Apply for Delegates or Executive Position
const applyDelegatesAndExecutive = async (req, res) => {
  //Get candidateID from the candidate Middleware
  const candidateId = req.candidateId;
  const { positionContested, manifesto } = req.body;

  if (!candidateId || !positionContested || !manifesto) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    // Check if candidate already applied for this position
    const checkQuery = `
            SELECT * FROM applications 
            WHERE candidate_id = $1 AND position_contested = $2
        `;
    const existingApplication = await client.query(checkQuery, [
      candidateId,
      positionContested,
    ]);

    if (existingApplication.rows.length > 0) {
      return res
        .status(409)
        .json({ message: "You have already applied for this position." });
    }

    // Insert new application
    const insertQuery = `
            INSERT INTO applications 
            (candidate_id, position_contested, manifesto, approval_status, submitted_at)
            VALUES ($1, $2, $3, $4, NOW())
            RETURNING *
        `;
    const values = [candidateId, positionContested, manifesto, "pending"];

    const result = await client.query(insertQuery, values);

    res.status(201).json({
      message: "Application submitted successfully",
      application: result.rows[0],
    });
  } catch (error) {
    console.error("Application Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { applyDelegatesAndExecutive };
