import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high'],
            default: 'medium',
        },
        completed: {
            type: Boolean,
            default: false,
        },
        dueDate: {
            type: Date,
            required: false,
        },
    },
    { timestamps: true }
);

const Note = mongoose.model('Note', noteSchema);

export default Note;
