const mongoose = require('mongoose')
const bcrypt = require("bcryptjs")

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true
    },
    username: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 7
    },
    resetPasswordToken: {
        type: String,
        default: null
    },
    emailToken: {
        type: String,
        default: null
    },
    active: { 
        type: Boolean, 
        default: false 
    },
    accessToken: {
        type: String,
        default: null
    }
}, {
    timestamps: true
})

const User = mongoose.model('User', userSchema)
module.exports = User

module.exports.hashPassword = async (password) => {
    try {
        const salt = await bcrypt.genSalt(10)
        return await bcrypt.hash(password, salt)
    } catch (error) {
        throw new Error("Hashing failed", error)
    }
}

module.exports.comparePasswords = async (password, hashedPassword) => {
    try {
        return await bcrypt.compare(password, hashedPassword)
    } catch (error) {
        throw new Error("Comparison failed", error)
    }
}
