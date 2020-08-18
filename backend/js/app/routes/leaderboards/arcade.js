const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

router.get("/arcade", (req, res) => {
  res.json({ data: "Hello World" });
});

module.exports = router;
