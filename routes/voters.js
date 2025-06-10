const express = require("express");
const { updateVoter, deleteVoter } = require("../controllers/voters");

const router = express.Router();

router.patch("/update-voter/:voterId", updateVoter);
router.delete("/deactivate-voter/:voterId", deleteVoter);

module.exports = router;
