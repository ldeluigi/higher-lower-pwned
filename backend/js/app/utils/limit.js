const { query } = require("express-validator");
const genericTools = require("./generic");

const DEFAULTLIMIT = 50;

module.exports = {
  returnLimitFromReq: (req) => {
    return genericTools.getOrElse(req.query.limit, DEFAULTLIMIT);
  },

  checkLimit: query("limit")
    .optional({ nullable: true })
    .isInt({ min: 1, max: 1000 })
    .trim(),
};
