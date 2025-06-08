const express = require("express");
const { getPositions } = require("../controllers/positions");

const router = express.Router();

router.get("/all-positions", getPositions);

module.exports = router;
