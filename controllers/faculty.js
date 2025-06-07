const client = require("../config/db");

const getFaculties = async (req, res) => {
  try {
    const result = await client.query("SELECT * FROM faculties ORDER BY id ASC");
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching faculties:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {getFaculties};
