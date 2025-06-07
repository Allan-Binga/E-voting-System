const express = require("express")
const {createGeneralElection, createDelegatePositions, createExecutivePositions} = require("../controllers/election")
const {authAdmin} = require("../middleware/jwt")

const router = express.Router()

//Routes
router.post("/create-general-election", authAdmin,createGeneralElection)
router.post("/create-delegates-election",authAdmin, createDelegatePositions)
router.post("/crete-executive-positions", authAdmin, createExecutivePositions)

module.exports = router