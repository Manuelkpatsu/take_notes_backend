const sgMail = require('@sendgrid/mail')
require('dotenv').config()

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

async function sendVerificationEmail (email, token) {
    try {
        let message = `<p>Please use the below token to verify your email address:</p>
                       <p><code>${token}</code></p>`

        await sgMail.send({
            to: email,
            from: 'enartey992@gmail.com',
            subject: 'Registering Account - Verify Email',
            html: `<h4>Verify Email</h4>
                   <p>Thanks for registering!</p>
                   ${message}`
        })
        return { error: false }
    } catch (error) {
        console.error(error)
        return {
            error: true,
            message: "Cannot send email",
        }
    }
}

async function sendPasswordResetEmail (email, token) {
    try {
        let message = `<p>Please use the below token to reset your password:</p>
                       <p><code>${token}</code></p>`

        await sgMail.send({
            to: email,
            from: 'enartey992@gmail.com',
            subject: 'Reset Password',
            html: `<h4>Reset Your Password</h4>
                   ${message}`
        })
        return { error: false }
    } catch (error) {
        console.error(error)
        return {
            error: true,
            message: "Cannot send email",
        }
    }
}

module.exports = {
    sendVerificationEmail,
    sendPasswordResetEmail
}
