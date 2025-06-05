const express = require("express")
const {registerVoter, loginVoter, registerAdmin, loginAdmin} = require("../controllers/auth")

const router = express.Router()

//Routes
router.post("/register-voter", registerVoter)
router.post("/login-voter", loginVoter)
router.post("/register-admin", registerAdmin)
router.post("/login-administrator", loginAdmin)

module.exports = router