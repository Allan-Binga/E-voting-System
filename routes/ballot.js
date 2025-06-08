const express = require("express")
const {getBallot} = require("../controllers/ballot")

const router = express.Router()

router.get("/all-ballots", getBallot)

module.exports = router