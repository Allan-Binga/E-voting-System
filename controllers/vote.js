const client = require("../config/db");
const { sendVoteStatusEmail, sendOTPEmail } = require("./emailService");

function euclideanDistance(arr1, arr2) {
  if (arr1.length !== arr2.length) return Infinity;

  let sum = 0;
  for (let i = 0; i < arr1.length; i++) {
    const diff = arr1[i] - arr2[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

const generateOTP = () => {
  // Generate a 6-digit OTP
  return Math.floor(100000 + Math.random() * 900000).toString();
};

//Users to Vote
const voteNow = async (req, res) => {
  const user_id = req.userId;
  const { biometricData, candidateId } = req.body;

  if (!biometricData || !candidateId) {
    return res
      .status(400)
      .json({ message: "Biometric data is required to vote!" });
  }
  try {
    //Check if user exists
    const getUserQuery = "SELECT * FROM users WHERE user_id = $1";
    const result = await client.query(getUserQuery, [user_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Voter not found." });
    }

    const user = result.rows[0];
    const email = user.email;

    //Convert stored biometric data to FLoat32Array
    const storedDescriptor = new Float32Array(
      user.biometric_data.buffer,
      user.biometric_data.byteOffset,
      user.biometric_data.length / Float32Array.BYTES_PER_ELEMENT
    );

    //Float32Array
    const incomingDescriptor = new Float32Array(biometricData);

    //Compare using Euclidean Distance
    const distance = euclideanDistance(storedDescriptor, incomingDescriptor);
    const THRESHOLD = 0.4;

    if (distance > THRESHOLD) {
      return res.status(401).json({
        message: "Biometric Authentication Failed. Please try again.",
      });
    }

    //Check if user has voted
    if (user.voting_status === "Voted") {
      return res
        .status(403)
        .json({ message: "User has already participated in elections." });
    }

    //Record VOTE
    const insertVoteQuery = ` 
      INSERT INTO votes (user_id, candidate_id, vote_time)
      VALUES ($1, $2, NOW())
      RETURNING vote_id`;

    await client.query(insertVoteQuery, [user_id, candidateId]);

    //Update user voting status
    const updateStatusQuery = `UPDATE users SET voting_status = 'Voted' WHERE user_id = $1`;
    await client.query(updateStatusQuery, [user_id]);

    //Increment total_votes in BALLOTS
    const updateBallotQuery = `UPDATE ballot SET total_votes = total_votes + 1`;
    await client.query(updateBallotQuery);

    //Send voting email
    await sendVoteStatusEmail(email, "Voted");
    res.status(200).json({ message: "Vote cast successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Vote as a candidate
const voteAsCandidate = async (req, res) => {
  const voterId = req.candidateId;
  const { candidateId, voteType } = req.body;

  if (!candidateId || !voteType) {
    return res.status(400).json({
      message: "Candidate ID and vote type (delegate/executive) are required!",
    });
  }

  if (!["delegate", "executive"].includes(voteType)) {
    return res.status(400).json({
      message: "Invalid vote type. Must be 'delegate' or 'executive'.",
    });
  }

  try {
    // Check if voter exists
    const checkCandidateQuery = `
      SELECT delegate_voting_status, executive_voting_status 
      FROM candidates 
      WHERE candidate_id = $1
    `;
    const result = await client.query(checkCandidateQuery, [voterId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Voter not found." });
    }

    const voter = result.rows[0];

    if (voteType === "delegate") {
      // Count existing delegate votes
      const countDelegateVotesQuery = `
        SELECT COUNT(*) 
        FROM votes 
        WHERE voter_candidate_id = $1 AND vote_type = 'delegate'
      `;
      const delegateVoteResult = await client.query(countDelegateVotesQuery, [
        voterId,
      ]);

      const delegateVoteCount = parseInt(delegateVoteResult.rows[0].count, 10);
      if (delegateVoteCount >= 4) {
        return res.status(403).json({
          message: "You can only vote for up to 4 delegates.",
        });
      }
    } else {
      // Check if already voted for executive
      if (voter.executive_voting_status === "Voted") {
        return res
          .status(403)
          .json({ message: "You have already voted for an executive." });
      }
    }

    // Check if the candidate being voted for exists
    const checkCandidateExistsQuery = `
      SELECT * 
      FROM candidates 
      WHERE candidate_id = $1
    `;
    const candidateResult = await client.query(checkCandidateExistsQuery, [
      candidateId,
    ]);
    if (candidateResult.rows.length === 0) {
      return res.status(404).json({ message: "Candidate not found." });
    }

    // Update voting status (only for executive vote)
    if (voteType === "executive") {
      const updateVoteStatusQuery = `
        UPDATE candidates 
        SET executive_voting_status = 'Voted'
        WHERE candidate_id = $1
      `;
      await client.query(updateVoteStatusQuery, [voterId]);
    }

    // Record the vote
    const insertVoteQuery = `
      INSERT INTO votes (voter_candidate_id, candidate_id, vote_type, created_at)
      VALUES ($1, $2, $3, NOW())
    `;
    await client.query(insertVoteQuery, [voterId, candidateId, voteType]);

    return res.status(200).json({
      message: "Vote successfully recorded.",
    });
  } catch (error) {
    console.error("[VoteAsCandidate Error]", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = { voteNow, voteAsCandidate };
