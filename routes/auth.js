const express = require("express")
const {registerVoter} = require("../controllers/auth")

const router = express.Router()

//Routes
router.post("/register-voter", registerVoter)

module.exports = router