const client = require("../config/db");
const { sendWinnerEmail } = require("./emailService");

//Tally Results
const tallyResults = async (req, res) => {
  try {
    // Query to aggregate votes by election_id and candidate_id
    const voteQuery = `
  SELECT election_id, candidate_id, COUNT(*) as total_votes
  FROM votes
  WHERE election_id IS NOT NULL
  GROUP BY election_id, candidate_id
`;

    const voteResults = await client.query(voteQuery);

    // Clear existing results to avoid duplicates or stale data
    await client.query("DELETE FROM results");

    // Insert aggregated results into the results table
    for (const row of voteResults.rows) {
      const insertQuery = `
        INSERT INTO results (election_id, candidate_id, total_votes)
        VALUES ($1, $2, $3)
        RETURNING result_id
      `;
      await client.query(insertQuery, [
        row.election_id,
        row.candidate_id,
        row.total_votes,
      ]);
    }

    res.status(200).json({ message: "Results tallied successfully" });
  } catch (error) {
    console.error("Error tallying results:", error);
    res.status(500).json({ error: "Failed to tally results" });
  }
};

// Get Results
const getResults = async (req, res) => {
  try {
    // Check if election_id is provided (e.g., via query parameter)
    const electionId = req.query.election_id || null;

    // Query to fetch results with concatenated candidate names and email
    const resultsQuery = `
      SELECT 
        r.result_id,
        r.election_id,
        r.candidate_id,
        c.first_name || ' ' || c.last_name AS candidate_name,
        c.email AS candidate_email,
        r.total_votes
      FROM results r
      JOIN candidates c ON r.candidate_id = c.candidate_id
      ${electionId ? "WHERE r.election_id = $1" : ""}
      ORDER BY r.election_id, r.total_votes DESC
    `;

    const queryParams = electionId ? [electionId] : [];
    const result = await client.query(resultsQuery, queryParams);

    // Aggregate votes by candidate_name to determine the winner and track email
    const voteTotals = result.rows.reduce((acc, row) => {
      const { candidate_name, total_votes, candidate_email } = row;
      if (!acc[candidate_name]) {
        acc[candidate_name] = { votes: 0, email: candidate_email };
      }
      acc[candidate_name].votes += total_votes;
      return acc;
    }, {});

    // Find the winner (candidate with the highest total votes)
    let winner = null;
    let winnerEmail = null;
    let maxVotes = -1;
    for (const [candidate, { votes, email }] of Object.entries(voteTotals)) {
      if (votes > maxVotes) {
        maxVotes = votes;
        winner = candidate;
        winnerEmail = email;
      }
    }

    return res.status(200).json({
      message: "Results retrieved successfully.",
      results: result.rows,
      winner: winner || "No winner determined",
    });
  } catch (error) {
    console.error("Error fetching results:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Announce Winner
const announceWinner = async (req, res) => {
  const { electionId } = req.body;

  // Validate electionId
  if (!electionId) {
    return res.status(400).json({ message: "Election ID is required." });
  }

  try {
    // Check if winner email has already been sent for this election
    const checkEmailSentQuery = `
      SELECT winner_email_sent
      FROM elections
      WHERE id = $1
    `;
    const checkResult = await client.query(checkEmailSentQuery, [electionId]);

    if (checkResult.rows.length > 0 && checkResult.rows[0].winner_email_sent) {
      return res
        .status(400)
        .json({ message: "Winner email already sent for this election" });
    }

    // Query to fetch results with concatenated candidate names and email
    const resultsQuery = `
      SELECT 
        r.result_id,
        r.election_id,
        r.candidate_id,
        c.first_name || ' ' || c.last_name AS candidate_name,
        c.email AS candidate_email,
        r.total_votes
      FROM results r
      JOIN candidates c ON r.candidate_id = c.candidate_id
      WHERE r.election_id = $1
      ORDER BY r.total_votes DESC
    `;

    const result = await client.query(resultsQuery, [electionId]);

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "No results found for this election" });
    }

    // Aggregate votes by candidate_name to determine the winner and track email
    const voteTotals = result.rows.reduce((acc, row) => {
      const { candidate_name, total_votes, candidate_email } = row;
      if (!acc[candidate_name]) {
        acc[candidate_name] = { votes: 0, email: candidate_email };
      }
      acc[candidate_name].votes += total_votes;
      return acc;
    }, {});

    // Find the winner (candidate with the highest total votes)
    let winner = null;
    let winnerEmail = null;
    let maxVotes = -1;
    for (const [candidate, { votes, email }] of Object.entries(voteTotals)) {
      if (votes > maxVotes) {
        maxVotes = votes;
        winner = candidate;
        winnerEmail = email;
      }
    }

    if (!winner || !winnerEmail) {
      return res
        .status(404)
        .json({ message: "No winner determined for this election" });
    }

    // Send winner email
    await sendWinnerEmail(winnerEmail, winner);

    // Update the election record to mark winner email as sent
    const updateEmailSentQuery = `
      UPDATE elections
      SET winner_email_sent = TRUE
      WHERE id = $1
    `;
    await client.query(updateEmailSentQuery, [electionId]);

    return res.status(200).json({
      message: "Winner announced and email sent successfully",
      winner: winner,
    });
  } catch (error) {
    console.error("Error announcing winner:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { tallyResults, getResults, announceWinner };
