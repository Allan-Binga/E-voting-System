const express = require("express");
const {getVoters, getCandidates, getAdmins} = require("../controllers/users")

const router = express.Router();

router.get("/voters", getVoters)
router.get("/candidates", getCandidates)
router.get("/administrators", getAdmins)

module.exports = router;
