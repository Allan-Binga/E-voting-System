const express = require("express");
const { voteNow } = require("../controllers/vote");
const { authUser } = require("../middleware/jwt");

const router = express.Router();

router.post("/user/vote-now", authUser, voteNow);

module.exports = router;
