const jwt = require("jsonwebtoken");
require("dotenv").config();

const User = require("../models/user.model")

async function auth(req, res, next) {
    const authorizationHeader = req.headers.authorization
    let result
    if (!authorizationHeader) {
        return res.status(401).json({
            error: true,
            message: "Not authorized!"
        })
    }

    const token = req.headers.authorization.split(" ")[1] // Bearer <token>
    const options = {
        expiresIn: "365d"
    }

    try {
        let user = await User.findOne({
            accessToken: token
        })

        if (!user) {
            result = {
                error: true,
                message: 'Authorization error',
            }
            return res.status(403).json(result)
        }

        result = jwt.verify(token, process.env.JWT_SECRET, options)

        if (!user._id === result.id) {
            result = {
                error: true,
                message: 'Invalid token',
            };
            return res.status(401).json(result)
        }

        req.decoded = result  // append the result in the "decoded" field of req
        next()
    } catch (error) {
        console.error(error)
        if (error.name === "TokenExpiredError") {
            result = {
                error: true,
                message: 'TokenExpired'
            };
        } else {
            result = {
                error: true,
                message: 'Authentication error'
            };
        }
        return res.status(403).json(result)
    }
}

module.exports = { auth }
