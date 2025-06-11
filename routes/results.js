const express = require("express");
const {
  getResults,
  tallyResults,
  announceWinner,
} = require("../controllers/results");

const router = express.Router();

router.post("/tally-results", tallyResults);
router.get("/all-results", getResults);
router.post("/announce-winner", announceWinner);

module.exports = router;
