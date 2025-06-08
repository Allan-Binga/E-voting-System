const express = require("express")
const {registerCandidate, loginCandidate, loginWithOTP, updateCandidate, deleteCandidate} = require("../controllers/candidates")

const router = express.Router()

//Routes
router.post("/auth/register-candidate", registerCandidate)
router.post("/auth/login-candidate", loginCandidate)
router.post("/auth/login/OTP", loginWithOTP)
router.put("/update-candidate/:id", updateCandidate)
router.delete("/delete-candidate/:id", deleteCandidate)

module.exports = router