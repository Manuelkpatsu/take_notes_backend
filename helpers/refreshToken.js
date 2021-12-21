const { v4: uuidv4 } = require('uuid')

async function createRefreshToken() {
    try {
        let expiredAt = new Date()

        expiredAt.setSeconds(
            expiredAt.getSeconds() + 604800 // 168hrs/ 7days
        )

        let _token = uuidv4()

        return { 
            tokenError: false, 
            refreshToken: _token,
            refreshTokenExpiryDate: expiredAt.getTime()
        }
    } catch (error) {
        return { tokenError: true }
    }
}

async function verifyExpiration(user) {
    if (user.refreshTokenExpiryDate.getTime() < new Date().getTime()) {
        return true;
    } else {
        return false;
    }
}

module.exports = { createRefreshToken, verifyExpiration }
