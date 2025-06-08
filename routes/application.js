const express = require("express");
const {applyDelegates, applyExecutive, approveApplication} = require("../controllers/application")
const {authCandidate, authAdmin} = require("../middleware/jwt")

const router = express.Router();

router.post("/apply-delegates", authCandidate, applyDelegates)
router.post("/apply-executive", authCandidate, applyExecutive)
router.put("/approve-application", authAdmin, approveApplication)

module.exports = router;
