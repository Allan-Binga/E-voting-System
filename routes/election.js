const express = require("express");
const { createGeneralElection , getElections} = require("../controllers/election");
const { authAdmin } = require("../middleware/jwt");

const router = express.Router();

//Routes
router.post("/create-general-election", authAdmin, createGeneralElection);
router.get("/get-elections", getElections)

module.exports = router;
