const express = require("express");
const { getMyVoterProfile, getMyCandateProfile, getMyAdminProfile } = require("../controllers/profiles")
const { authUser, authCandidate, authAdmin } = require("../middleware/jwt")

const router = express.Router();

router.get("/profile/voter/my-profile", authUser,  getMyVoterProfile)
router.get("/profile/candidate/my-profile",authCandidate, getMyCandateProfile)
router.get("/profile/administrator/my-profile",authAdmin, getMyAdminProfile)

module.exports = router;
