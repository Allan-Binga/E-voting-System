const client = require("../config/db");
const {sendVoteStatusEmail} = require("./emailService")

function euclideanDistance(arr1, arr2) {
  if (arr1.length !== arr2.length) return Infinity;

  let sum = 0;
  for (let i = 0; i < arr1.length; i++) {
    const diff = arr1[i] - arr2[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

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
    const updateBallotQuery = `UPDATE ballot SET totol_votes = total_votes + 1`;
    await client.query(updateBallotQuery);
    res.status(200).json({ message: "Vote cast successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = { voteNow };
