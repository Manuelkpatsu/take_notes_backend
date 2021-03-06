const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
require('./config/db')

// Swagger
const swaggerUI = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');

const userRouter = require('./routes/user.routes')
const noteRouter = require('./routes/note.routes')

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan('combined'))

app.get('/', (req, res) => {
    res.send('<h1>Notes API</h1><a href="/api-docs">Documentation</a>');
});
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument));

app.use("/api/v1/users", userRouter)
app.use("/api/v1/notes", noteRouter)

module.exports = app
