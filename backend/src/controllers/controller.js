import Note from '../model/Note.js';
import { db } from '../config/dbAdapter.js';

export async function getAll(req, res) {
    try {
        console.log('GET /notes request received');
        console.log('Query params:', req.query);
        const { userId } = req.query;
        
        console.log('Requested userId:', userId);
        console.log('Database type:', db.getDatabaseType());
        console.log('Using mock DB:', global.usingMockDb);
        
        if (!userId) {
            console.log('No userId provided');
            return res.status(400).json({ message: 'User ID is required' });
        }

        console.log('Calling db.findNotes with query:', { userId });
        const notes = await db.findNotes({ userId });
        console.log(`Found ${notes.length} notes for user ${userId}`);
        console.log('Notes:', notes);
        
        res.status(200).json(notes);
    } catch (error) {
        console.error('Error in getAll controller:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}

export async function getnotebyid(req, res) {
    try {
        console.log('GET /notes/:id request received for ID:', req.params.id);
        
        const note = await db.findNoteById(req.params.id);
        if (!note) {
            console.log('Note not found for ID:', req.params.id);
            return res.status(404).json({ message: 'Note not found' });
        }
        
        console.log('Note found:', note.title);
        res.status(200).json(note);
    } catch (error) {
        console.error('Error in getnotebyid controller:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export async function createAll(req, res) {
    try {
        console.log('POST /notes request received');
        const { title, content, userId, priority, dueDate } = req.body;
        
        console.log('Create note data:', { title, content, userId, priority, dueDate });
        
        if (!title || !content) {
            console.log('Missing title or content');
            return res.status(400).json({ message: 'Title and content are required' });
        }
        
        if (!userId) {
            console.log('Missing userId');
            return res.status(400).json({ message: 'User ID is required' });
        }

        const newNote = await db.createNote({ 
            title, 
            content, 
            userId,
            priority: priority || 'medium',
            dueDate: dueDate || null,
            completed: false
        });

        console.log('Note created successfully:', newNote._id || newNote.id);
        
        res.status(201).json({ 
            message: 'Task created successfully!',
            note: newNote
        });
    } catch (error) {
        console.error('Error in createAll controller:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export async function putALL(req, res) {
    try {
        console.log('PUT /notes/:id request received for ID:', req.params.id);
        const { title, content, priority, completed, dueDate } = req.body;
        
        console.log('Update data:', { title, content, priority, completed, dueDate });
        
        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (content !== undefined) updateData.content = content;
        if (priority !== undefined) updateData.priority = priority;
        if (completed !== undefined) updateData.completed = completed;
        if (dueDate !== undefined) updateData.dueDate = dueDate;
        
        const result = await db.updateNote(
            { _id: req.params.id },
            { $set: updateData }
        );
        
        if (result.modifiedCount === 0) {
            console.log('Note not found for update:', req.params.id);
            return res.status(404).json({ message: 'Note not found' });
        }

        const updatedNote = await db.findNoteById(req.params.id);
        console.log('Note updated successfully:', updatedNote._id || updatedNote.id);
        res.status(200).json(updatedNote);
    } catch (error) {
        console.error('Error in putAll controller:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export async function deleteAll(req, res) {
    try {
        console.log('DELETE /notes/:id request received for ID:', req.params.id);
        
        const result = await db.deleteNote({ _id: req.params.id });
        if (result.deletedCount === 0) {
            console.log('Note not found for deletion:', req.params.id);
            return res.status(404).json({ message: 'Note not found' });
        }

        console.log('Note deleted successfully:', req.params.id);
        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Error in deleteAll controller:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}