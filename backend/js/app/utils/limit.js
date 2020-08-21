const { query } = require("express-validator");

module.exports = {
  DEFAULTLIMIT: 50,

  checkLimit: query("limit")
    .optional({ nullable: true })
    .isInt({ min: 1, max: 1000 })
    .trim(),
};
