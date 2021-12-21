const express = require('express')
const router = express.Router()

const cleanBody = require('../middleware/cleanbody')
const { auth } = require('../middleware/auth')
const NoteController = require('../controllers/note.controller')

router.post("/create-note", cleanBody, auth, NoteController.CreateNote)

router.get("/", auth, NoteController.GetAllNotesByUser)

router.get("/:id", auth, NoteController.GetNote)

router.patch("/:id", cleanBody, auth, NoteController.UpdateNote)

router.delete("/:id", auth, NoteController.DeleteNote)

module.exports = router
