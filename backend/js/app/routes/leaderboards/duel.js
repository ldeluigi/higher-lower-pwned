const express = require("express");
const { validationResult, query } = require("express-validator");
const score = require("../../model/score").schema;
const scoreToDto = require("../../model/score").toDto;
const router = express.Router();
const periodTools = require("../../helpers/period");
const limitTools = require("../../helpers/limit");

router.get(
    "/duel",
    [
        periodTools.checkPeriod(query("period")),
        limitTools.checkLimit(query("limit"))
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const queryLimit = req.query.limit || limitTools.limit;
        const queryPeriod = req.query.period || periodTools.default;
        const minMax = periodTools.periods[queryPeriod];
        const result = await score
            .find({
                end: {
                    $gte: minMax[0],
                    $lte: minMax[1],
                },
                mode: /^duel\.(win|lost)$/
            })
            .limit(parseInt(queryLimit))
            .sort({
                score: "desc",
                end: "desc"
            })
            .populate('user');
        if (result === null) {
            return res.status(400).json({ errors: ["Score query error."] });
        }
        let mappedScores = result.map(s => {
            if (s.user !== undefined && s.user !== null) {
                return scoreToDto(s, s.user.username);
            }
            return scoreToDto(s);
        });
        res.json({
            data: mappedScores,
        });
    }
);

module.exports = router;
