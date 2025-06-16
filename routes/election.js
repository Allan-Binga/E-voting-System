const express = require("express");
const { createGeneralElection , getElections, deleteElections, updateElection} = require("../controllers/election");
const { authAdmin } = require("../middleware/jwt");

const router = express.Router();

//Routes
router.post("/create-general-election", authAdmin, createGeneralElection);
router.get("/get-elections", getElections)
router.patch("/update-election/:electionId", updateElection)
router.delete("/delete-election/:electionId", deleteElections)

module.exports = router;
