const client = require("../config/db");

//Update User
const updateVoter = async (req, res) => {
  const { voterId } = req.params;
  const { first_name, last_name, faculty, registration_number } = req.body;

  try {
    // Collect only provided fields
    const fields = [];
    const values = [];
    let index = 1;

    if (first_name) {
      fields.push(`first_name = $${index++}`);
      values.push(first_name);
    }
    if (last_name) {
      fields.push(`last_name = $${index++}`);
      values.push(last_name);
    }
    if (faculty) {
      fields.push(`faculty = $${index++}`);
      values.push(faculty);
    }
    if (registration_number) {
      fields.push(`registration_number = $${index++}`);
      values.push(registration_number);
    }

    if (fields.length === 0) {
      return res
        .status(400)
        .json({ message: "No fields provided for update." });
    }

    //Add voterId as the last value
    values.push(voterId);

    const updateQuery = `
      UPDATE users
      SET ${fields.join(", ")}
      WHERE user_id = $${values.length}
      RETURNING *
    `;

    const result = await client.query(updateQuery, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({
      message: "Voter updated successfully.",
      voter: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating candidate:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

//Delete Voter
const deleteVoter = async (req, res) => {
  const { voterId } = req.params;

  try {
    // Check if user exists
    const checkQuery = "SELECT * FROM users WHERE user_id = $1";
    const checkResult = await client.query(checkQuery, [voterId]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: "Voter not found." });
    }

    // Delete candidate
    const deleteQuery = "DELETE FROM users WHERE user_id = $1";
    await client.query(deleteQuery, [voterId]);

    return res.status(200).json({ message: "User deleted successfully." });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = { updateVoter, deleteVoter };
