const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
require('./config/db')

const userRouter = require('./routes/user.routes')
const noteRouter = require('./routes/note.routes')

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan('combined'))

app.use("/api/v1/users", userRouter)
app.use("/api/v1/notes", noteRouter)

module.exports = app
