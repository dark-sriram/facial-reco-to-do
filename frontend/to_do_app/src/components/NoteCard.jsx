import { PenSquareIcon, Trash2Icon } from 'lucide-react';
import { Link } from 'react-router';
import { formatDate } from '../lib/utils';
import api from '../lib/axios';
import toast from 'react-hot-toast';

const NoteCard = ({ notes, setnote }) => {
    const handleDelete = async (e, id) => {
        e.preventDefault();

        if (!window.confirm('note-aa delete pandriya')) return;

        try {
            await api.delete(`/notes/${id}`);
            setnote((prev) => prev.filter((notes) => notes._id !== id));
            toast.success('note is deleted Successfully');
        } catch (error) {
            console.log(error);
            toast.error('note not deleted');
        }
    };

    return (
        <Link
            to={`/notes/${notes._id}`}
            className="card bg-black hover:shadow-lg transition:all duration-200 border-t-4 border-solid border-orange-800"
        >
            <div className="card-body forced-color-adjust-auto">
                <h3 className="card-title text-base-content">{notes.title}</h3>
                <p className="text-base-content/70 line-clamp-3">
                    {notes.content}
                </p>
                <div className="card-actions justify-between items-center mt-4">
                    <span className="text-sm text-base-content/60">
                        {formatDate(new Date(notes.createdAt))}
                    </span>
                    <div className="flex items-center gap-1">
                        <PenSquareIcon className="size-4" />
                        <button
                            className="btn btn-ghost btn-xs text-error"
                            onClick={(e) => handleDelete(e, notes._id)}
                        >
                            <Trash2Icon className="size-4" />
                        </button>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default NoteCard;
