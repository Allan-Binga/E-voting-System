const express = require("express");
const {applyDelegates, applyExecutive, approveApplication, rejectApplication, getApplications, getMyApplications} = require("../controllers/application")
const {authCandidate, authAdmin, authUser} = require("../middleware/jwt")

const router = express.Router();

router.post("/apply-delegates", authCandidate, applyDelegates)
router.post("/apply-executive", authCandidate, applyExecutive)
router.put("/approve-application", authAdmin, approveApplication)
router.put("/reject-application", authAdmin, rejectApplication)
router.get("/all-applications", getApplications)
router.get("/my-applications",authCandidate, getMyApplications)

module.exports = router;
