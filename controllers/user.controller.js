const Joi = require("joi")
const User = require('../models/user.model')
const { generateJwt } = require('../helpers/generateJwt')
const { 
    sendVerificationEmail, 
    sendPasswordResetEmail 
} = require('../helpers/mailer')

// validate user schema
const userSchema = Joi.object().keys({
    email: Joi.string().email({ minDomainSegments: 2 }).required(),
    username: Joi.string().required(),
    password: Joi.string().required().min(7),
    confirmPassword: Joi.string().valid(Joi.ref("password")).required(),
})

exports.Signup = async (req, res) => {
    try {
        const result = userSchema.validate(req.body)
        if (result.error) {
            console.error(result.error.message)
            return res.status(400).json({
                error: true,
                message: result.error.message
            })
        }

        // Check if the email has been already registered.
        var user = await User.findOne({
            email: result.value.email
        })

        if (user) {
            return res.status(409).json({
                error: true,
                message: "Email is already in use"
            })
        }

        const hash = await User.hashPassword(result.value.password)

        delete result.value.confirmPassword
        result.value.password = hash

        let code = Math.floor(100000 + Math.random() * 900000);

        const sendCode = await sendVerificationEmail(result.value.email, code)

        if (sendCode.error) {
            return res.status(500).json({
                error: true,
                message: "Couldn't send verification email."
            })
        }
        result.value.emailToken = code;

        const newUser = new User(result.value)
        await newUser.save()

        return res.status(201).json({
            success: true,
            message: "Registration Successful. A verification code has been sent to your email. Kindly verify your account."
        })
    } catch (error) {
        console.error("signup-error", error)
        return res.status(500).json({
            error: true,
            message: "Registration Unsuccessful"
        })
    }
}

exports.ActivateAccount = async (req, res) => {
    try {
        const { email, code } = req.body
        if (!email || !code) {
            return res.status(400).json({
                error: true,
                message: "Please make a valid request"
            })
        }
        const user = await User.findOne({
            email: email,
            emailToken: code
        })

        if (!user) {
            return res.status(400).json({
                error: true,
                message: "Invalid details"
            })
        } else {
            if (user.active) {
                return res.status(400).json({
                    error: true,
                    message: "Account already activated"
                })
            }

            user.emailToken = null;
            user.active = true;

            await user.save();

            return res.status(200).json({
                success: true,
                message: "Account successfully activated"
            })
        }
    } catch (error) {
        console.error("account-activation-error", error)
        return res.status(500).json({
            error: true,
            message: error.message
        })
    }
}

exports.Login = async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({
                error: true,
                message: "Cannot authorize user."
            })
        }

        // 1. Find if any account with that email exists in DB
        const user = await User.findOne({ email: email })

        // NOT FOUND - Throw error
        if (!user) {
            return res.status(404).json({
                error: true,
                message: "Account not found"
            })
        }

        // 2. Throw error if account is not activated
        if (!user.active) {
            return res.status(400).json({
                error: true,
                message: "You must verify your email to activate your account"
            })
        }

        // 3. Verify the password is valid
        const isValid = await User.comparePasswords(password, user.password)

        if (!isValid) {
            return res.status(400).json({
                error: true,
                message: "Invalid credentials"
            })
        }

        // Generate Access token
        const { error, token } = await generateJwt(user.email, user._id)
        if (error) {
            return res.status(500).json({
                error: true,
                message: "Couldn't create access token. Please try again later"
            })
        }
        user.accessToken = token

        await user.save()

        // Success
        return res.status(200).json({
            userId: user._id,
            email: user.email,
            username: user.username,
            accessToken: token
        })
    } catch (error) {
        console.error("Login error", err)
        return res.status(500).json({
            error: true,
            message: "Couldn't login. Please try again later."
        })
    }
}

exports.ForgotPassword = async (req, res) => {
    try {
        const { email } = req.body
        if (!email) {
            return res.status(400).json({
                status: 400,
                error: true,
                message: "Cannot be processed"
            })
        }
        const user = await User.findOne({
            email: email
        })
        if (!user) {
            return res.status(404).json({
                error: true,
                message: "Sorry, the user does not exist."
            })
        }

        let code = Math.floor(100000 + Math.random() * 900000)
        let response = await sendPasswordResetEmail(user.email, code)

        if (response.error) {
            return res.status(500).json({
                error: true,
                message: "Couldn't send mail. Please try again later."
            })
        }

        user.resetPasswordToken = code

        await user.save()

        return res.status(200).json({
            success: true,
            message: "We have sent you an email to reset your password."
        })
    } catch (error) {
        console.error("forgot-password-error", error)
        return res.status(500).json({
            error: true,
            message: error.message
        })
    }
}

exports.ResetPassword = async (req, res) => {
    try {
        const { token, newPassword, confirmPassword } = req.body
        if (!token || !newPassword || !confirmPassword) {
            return res.status(403).json({
                error: true,
                message:
                    "Couldn't process request. Please provide all mandatory fields"
            })
        }
        const user = await User.findOne({
            resetPasswordToken: req.body.token
        })
        if (!user) {
            return res.status(403).json({
                error: true,
                message: "Password reset token is invalid.",
            })
        }
        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                error: true,
                message: "Passwords do not match."
            })
        }

        const hash = await User.hashPassword(req.body.newPassword)
        user.password = hash;
        user.resetPasswordToken = null;

        await user.save()

        return res.status(200).json({
            success: true,
            message: "Password changed successfully."
        })
    } catch (error) {
        console.error("reset-password-error", error)
        return res.status(500).json({
            error: true,
            message: error.message
        })
    }
}

exports.Logout = async (req, res) => {
    try {
        const { id } = req.decoded

        let user = await User.findOne({ _id: id })

        user.accessToken = null

        await user.save()

        return res.status(200).json({ 
            success: true, 
            message: "User logged out successfully."
        })
    } catch (error) {
        console.error("user-logout-error", error)
        return res.status(500).json({
            error: true,
            message: error.message
        })
    }
}

exports.CurrentUser = async (req, res) => {
    try {
        const { id } = req.decoded

        const user = await User
            .findOne({ _id: id })
            .select(["-password", "-accessToken", "-resetPasswordToken", "-emailToken"])
        
        if (!user) {
            return res.status(404).json({
                error: true,
                message: "Sorry, the user was not found."
            })
        }

        return res.status(200).json({
            success: true,
            user: user
        })
    } catch (error) {
        return res.status(500).json({
            error: true,
            message: error.message
        })
    }
}
