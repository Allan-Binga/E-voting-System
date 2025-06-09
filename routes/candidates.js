const express = require("express")
const {registerCandidate, loginCandidate, loginWithOTP, logoutCandidate, updateCandidate, deleteCandidate, getCandidates} = require("../controllers/candidates")
const { authAdmin } = require("../middleware/jwt")

const router = express.Router()

//Routes
router.post("/auth/register-candidate", registerCandidate)
router.post("/auth/login-candidate", loginCandidate)
router.post("/auth/login/OTP", loginWithOTP)
router.post("/auth/logout", logoutCandidate)
router.patch("/update-candidate/:candidateId", updateCandidate)
router.delete("/delete-candidate/:id", deleteCandidate)
router.get("/all-candidates", authAdmin,getCandidates)

module.exports = router