const express = require("express")
const {registerVoter, loginVoter} = require("../controllers/auth")

const router = express.Router()

//Routes
router.post("/register-voter", registerVoter)
router.post("/login-voter", loginVoter)

module.exports = router