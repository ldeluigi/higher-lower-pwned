const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const pwd = require("../../utils/password");
const config = require("../../../config/config");
const tokenSchema = require("../../model/token").schema;
const jwtTools = require("../../utils/jwt");

router.post(
    "/refresh",
    [
        check("token").notEmpty().bail().isJWT().bail().trim(),
        check("refresh").notEmpty().bail().isAlphanumeric().bail().trim(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            let token = req.body.token;
            let refreshToken = req.body.refresh;
            let tokenQuery = await tokenSchema.findOne({ token: refreshToken });
            if (tokenQuery === null) {
                return res.status(404).json({ errors: ["Refresh token not found."] });
            }
            if (tokenQuery.expire < new Date()) {
                await tokenSchema.deleteOne({ token: refreshToken });
                return res.status(400).json({
                    errors: ["Refresh token is expired. Repeat the login process."],
                });
            }
            let tokenPayload = jwt.verify(token, config.jwtSecret, {
                ignoreExpiration: true,
            });
            if (tokenPayload.refresh != tokenQuery.jwtRef) {
                return res.status(400).json({ errors: ["Invalid token references."] });
            }
            await tokenSchema.deleteOne({ _id: tokenQuery._id });
            //TODO: CHECK USER IS GOOD BEFORE PROCEDING WITH A REFRESH
            let userID = tokenPayload.id;
            let username = tokenPayload.username;
            //FOR NOW WE ARE USING OLD JWT DATA
            try {
                let { token, refresh } = await jwtTools.createJWT(userID, username);
                res.json({
                    data: {
                        id: username,
                        username: username,
                        token: token,
                        refresh: refresh
                    }
                });
            } catch (err) {
                res.status(400).json({ errors: [err.message] });
            }
        } catch (err) {
            res.status(400).json({ errors: [err.message] });
        }
    }
);

module.exports = router;
