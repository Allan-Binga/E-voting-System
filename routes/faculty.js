const express = require("express")
const {getFaculties} = require("../controllers/faculty")

const router = express.Router()

//Route
router.get("/get-faculties", getFaculties)

module.exports = router
