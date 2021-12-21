const Joi = require("joi")
const Note = require('../models/note.model')
const User = require('../models/user.model')

// validate note schema
const noteSchema = Joi.object().keys({
    title: Joi.string().required().min(5),
    content: Joi.string().required().min(10),
    color: Joi.number()
})

exports.CreateNote = async (req, res) => {
    try {
        const result = noteSchema.validate(req.body)
        if (result.error) {
            console.error(result.error.message)
            return res.json({
                error: true,
                status: 400,
                message: result.error.message
            })
        }
        const id = req.decoded.id
        const user = await User.findOne({ _id: id })
        if (!user) {
            return res.status(404).json({
                error: true,
                message: "Sorry, the user does not exist."
            })
        }

        result.value.userId = user._id

        const newNote = new Note(result.value)
        await newNote.save()

        return res.status(201).json({
            success: true,
            message: "Note created successfully.",
            note: newNote
        })
    } catch (error) {
        return res.status(500).json({
            error: true,
            message: "Note couldn't be created."
        })
    }
}

exports.GetAllNotesByUser = async (req, res) => {
    const currentPage = +req.query.page || 1
    const perPage = +req.query.size || 10
    const offset = (currentPage - 1) * perPage
    const id = req.decoded.id

    try {
        const user = await User.findOne({ _id: id })
        if (!user) {
            return res.send({
                error: true,
                message: "Sorry, the user does not exist."
            })
        }

        const totalItems = await Note.find({ userId: user._id }).countDocuments()
        const notes = await Note.find({ userId: user._id })
            .sort({ createdAt: -1 })
            .skip(offset)
            .limit(perPage)

        const totalPages = Math.ceil(totalItems / perPage)
        
        return res.status(200).json({
            success: true,
            notes: notes,
            totalItems: totalItems,
            totalPages: totalPages,
            message: 'Fetched posts successfully.',
        })
    } catch (error) {
        return res.status(500).json({
            error: true,
            message: "Error occurred while fetching notes."
        })
    }
}

exports.GetNote = async (req, res) => {
    const id = req.params.id

    try {
        const note = await Note.findOne({ _id: id })

        if (!note) {
            return res.status(404).json({
                error: true,
                message: "Sorry, the note was not found."
            })
        }

        res.status(200).send(note)
    } catch (error) {
        return res.status(500).json({
            error: true,
            message: "Error fetching note."
        })
    }
}

exports.UpdateNote = async (req, res) => {
    const id = req.params.id

    try {
        const result = noteSchema.validate(req.body)
        if (result.error) {
            console.error(result.error.message)
            return res.json({
                error: true,
                status: 400,
                message: result.error.message
            })
        }

        const note = await Note.findOne({ _id: id })

        if (!note) {
            return res.status(404).json({
                error: true,
                message: "Sorry, the note was not found."
            })
        }
        
        if (note.userId.toString() !== req.decoded.id) {
            return res.status(403).json({
                error: true,
                message: "Not authorized!"
            })
        }

        note.title = result.value.title
        note.content = result.value.content
        note.color = result.value.color
        
        await note.save()

        res.status(200).json({
            success: true,
            message: 'Note updated successfully.',
            note: note
        })
    } catch (error) {
        return res.status(500).json({
            error: true,
            message: "Error occurred while updating note."
        })
    }
}

exports.DeleteNote = async (req, res) => {
    const id = req.params.id

    try {
        const note = await Note.findById(id);

        if (!note) {
            return res.status(404).json({
                error: true,
                message: "Sorry, the note was not found."
            })
        }

        if (note.userId.toString() !== req.decoded.id) {
            return res.status(403).json({
                error: true,
                message: "Not authorized!"
            })
        }

        await Note.findByIdAndRemove(id)

        res.status(200).json({
            success: true,
            message: `Note with id: ${id} successfully deleted.`
        })
    } catch (error) {
        return res.status(500).json({
            error: true,
            message: "Sorry, Note couldn't be deleted."
        })
    }
}

