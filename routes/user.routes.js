const express = require('express')
const router = express.Router()

const cleanBody = require('../middleware/cleanbody')
const { auth } = require('../middleware/auth')
const AuthController = require('../controllers/user.controller')

// Define endpoints
router.post("/signup", cleanBody, AuthController.Signup)

router.patch("/activate", cleanBody, AuthController.ActivateAccount)

router.post("/login", cleanBody, AuthController.Login)

router.patch("/forgot-password", cleanBody, AuthController.ForgotPassword)

router.patch("/reset-password", cleanBody, AuthController.ResetPassword)

router.get("/logout", auth, AuthController.Logout)

router.get("/currentUser", auth, AuthController.CurrentUser)

module.exports = router
