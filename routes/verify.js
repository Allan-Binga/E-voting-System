const express = require("express");
const { verifyOTP, resendOTP } = require("../controllers/verify");

const router = express.Router();

router.post("/verify-OTP", verifyOTP);
router.post("/resend-OTP", resendOTP);

module.exports = router;
