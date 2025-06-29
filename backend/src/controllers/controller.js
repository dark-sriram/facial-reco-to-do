import Note from '../model/Note.js';

export async function getAll(req, res) {
    try {
        const note = await Note.find().sort({ createdAt: -1 });
        res.status(200).json(note);
    } catch (error) {
        console.error('error in getAll controller', error);
        res.status(500).json({ message: 'internal server issue' });
    }
}

export async function getnotebyid(req, res) {
    try {
        const note = await Note.findById(req.params.id);
        if (!note)
            return res.status(404).json({ message: 'cannot find the note' });
        res.status(200).json(note);
    } catch (error) {
        console.error('error in getnotebyid controller', error);
        res.status(500).json({ message: 'internal server issue' });
    }
}

export async function createAll(req, res) {
    try {
        const { title, content } = req.body;
        const newNote = new Note({ title, content });

        await newNote.save();
        res.status(201).json({ message: 'new note created successfully!!' });
    } catch (error) {
        console.error('error in createAll controller', error);
        res.status(500).json({ message: 'internal server issue' });
    }
}

export async function putALL(req, res) {
    try {
        const { title, content } = req.body;
        const updatednote = await Note.findByIdAndUpdate(
            req.params.id,
            { title, content },
            { new: true }
        );
        if (!updatednote)
            return res.status(404).json({ message: 'cannot find the note' });

        res.status(200).json(updatednote);
    } catch (error) {
        console.error('error in putAll controller', error);
        res.status(500).json({ message: 'internal server issue' });
    }
}

export async function deleteAll(req, res) {
    try {
        const deleteNote = await Note.findByIdAndDelete(req.params.id);
        if (!deleteNote)
            return res.status(404).json({ message: 'cannot find the note' });

        res.status(200).json({ message: 'note deleted successfully' });
    } catch (error) {
        console.error('error in deleteAll controller', error);
        res.status(500).json({ message: 'internal server issue' });
    }
}
