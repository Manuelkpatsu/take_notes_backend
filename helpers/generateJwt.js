const jwt = require('jsonwebtoken')
require('dotenv').config()

const options = {
    expiresIn: "365d"
}

async function generateJwt(email, userId) {
    try {
        const payload = { email: email, id: userId }
        const token = await jwt.sign(payload, process.env.JWT_SECRET, options)
        return { tokenError: false, token: token }
    } catch (tokenError) {
        return { tokenError: true }
    }
}

module.exports = { generateJwt }
