const express = require("express");
const { voteNow, voteAsCandidate } = require("../controllers/vote");
const { authUser, authCandidate } = require("../middleware/jwt");

const router = express.Router();

router.post("/user/vote-now", authUser, voteNow);
router.post("/candidate/vote-now", authCandidate, voteAsCandidate);

module.exports = router;
