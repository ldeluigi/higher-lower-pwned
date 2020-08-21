const { check } = require("express-validator");
module.exports = {
  DEFAULTLIMIT: 50,

  checkLimit: check("limit")
    .optional({ nullable: true })
    .isInt({ min: 1, max: 1000 })
    .trim(),
};
