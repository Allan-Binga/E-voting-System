const express = require("express")
const {registerVoter, loginVoter, registerAdmin, loginAdmin, logoutVoter, logoutAdmin} = require("../controllers/auth")

const router = express.Router()

//Routes
router.post("/voter/register-voter", registerVoter)
router.post("/voter/login-voter", loginVoter)
router.post("/voter/logout-voter", logoutVoter)
router.post("/administrator/register-admin", registerAdmin)
router.post("/administrator/login-admin", loginAdmin)
router.post("/administrator/logout-admin", logoutAdmin)

module.exports = router