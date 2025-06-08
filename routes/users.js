const express = require("express");
const {getVoters} = require("../controllers/users")

const router = express.Router();

router.get("/voters", getVoters)

module.exports = router;
