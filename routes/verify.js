const express = require("express");
const { verifyOTP, resendOTP , verifyCandidateOTP, resendCandidateOTP} = require("../controllers/verify");

const router = express.Router();

router.post("/verify-OTP", verifyOTP);
router.post("/resend-OTP", resendOTP);
router.post("/candidate/verify-OTP", verifyCandidateOTP)
router.post("/candidate/resend-OTP", resendCandidateOTP)

module.exports = router;
