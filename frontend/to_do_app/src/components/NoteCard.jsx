import { PenSquareIcon, Trash2Icon, CheckCircle, Circle, Calendar, Flag } from 'lucide-react';
import { Link } from 'react-router';
import { formatDate } from '../lib/utils';
import api from '../lib/axios';
import toast from 'react-hot-toast';

const NoteCard = ({ notes, setnote }) => {
    const handleDelete = async (e, id) => {
        e.preventDefault();

        if (!window.confirm('Are you sure you want to delete this task?')) return;

        try {
            await api.delete(`/notes/${id}`);
            setnote((prev) => prev.filter((notes) => notes._id !== id));
            toast.success('Task deleted successfully');
        } catch (error) {
            console.log(error);
            toast.error('Failed to delete task');
        }
    };

    const handleToggleComplete = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            const response = await api.put(`/notes/${notes._id}`, {
                ...notes,
                completed: !notes.completed
            });
            
            setnote((prev) => 
                prev.map((note) => 
                    note._id === notes._id 
                        ? { ...note, completed: !note.completed }
                        : note
                )
            );
            
            toast.success(notes.completed ? 'Task marked as incomplete' : 'Task completed!');
        } catch (error) {
            console.log(error);
            toast.error('Failed to update task');
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'border-red-500';
            case 'medium': return 'border-orange-500';
            case 'low': return 'border-green-500';
            default: return 'border-orange-800';
        }
    };

    const getPriorityBadgeColor = (priority) => {
        switch (priority) {
            case 'high': return 'bg-red-100 text-red-800';
            case 'medium': return 'bg-orange-100 text-orange-800';
            case 'low': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className={`card bg-black hover:shadow-lg transition-all duration-200 border-t-4 border-solid ${getPriorityColor(notes.priority)} ${notes.completed ? 'opacity-75' : ''}`}>
            <div className="card-body">
                <div className="flex items-start justify-between mb-2">
                    <Link to={`/notes/${notes._id}`} className="flex-1">
                        <h3 className={`card-title text-base-content ${notes.completed ? 'line-through' : ''}`}>
                            {notes.title}
                        </h3>
                    </Link>
                    <button
                        onClick={handleToggleComplete}
                        className="btn btn-ghost btn-xs p-1"
                    >
                        {notes.completed ? (
                            <CheckCircle className="size-5 text-green-500" />
                        ) : (
                            <Circle className="size-5 text-gray-400" />
                        )}
                    </button>
                </div>

                <Link to={`/notes/${notes._id}`}>
                    <p className={`text-base-content/70 line-clamp-3 ${notes.completed ? 'line-through' : ''}`}>
                        {notes.content}
                    </p>
                </Link>

                <div className="flex items-center gap-2 mt-2">
                    <span className={`badge badge-sm ${getPriorityBadgeColor(notes.priority)} flex items-center gap-1`}>
                        <Flag className="size-3" />
                        {notes.priority}
                    </span>
                    {notes.dueDate && (
                        <span className="badge badge-sm bg-blue-100 text-blue-800 flex items-center gap-1">
                            <Calendar className="size-3" />
                            {formatDate(new Date(notes.dueDate))}
                        </span>
                    )}
                    {notes.completed && (
                        <span className="badge badge-sm bg-green-100 text-green-800">
                            Completed
                        </span>
                    )}
                </div>

                <div className="card-actions justify-between items-center mt-4">
                    <span className="text-sm text-base-content/60">
                        Created: {formatDate(new Date(notes.createdAt))}
                    </span>
                    <div className="flex items-center gap-1">
                        <Link to={`/notes/${notes._id}`}>
                            <button className="btn btn-ghost btn-xs">
                                <PenSquareIcon className="size-4" />
                            </button>
                        </Link>
                        <button
                            className="btn btn-ghost btn-xs text-error"
                            onClick={(e) => handleDelete(e, notes._id)}
                        >
                            <Trash2Icon className="size-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NoteCard;
