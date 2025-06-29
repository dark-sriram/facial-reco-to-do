import { useEffect } from 'react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import api from '../lib/axios';
import toast from 'react-hot-toast';
import { ArrowLeftIcon, LoaderIcon, Trash2Icon, Calendar, Flag, CheckCircle, Circle } from 'lucide-react';

const DetailPage = () => {
    const [note, setNote] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const navigate = useNavigate();

    const { id } = useParams();

    useEffect(() => {
        const fetchNote = async () => {
            try {
                const res = await api.get(`/notes/${id}`);
                setNote(res.data);
            } catch (error) {
                console.log('Error in fetching note', error);
                toast.error('Failed to fetch the note');
            } finally {
                setLoading(false);
            }
        };

        fetchNote();
    }, [id]);

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this task?'))
            return;

        try {
            await api.delete(`/notes/${id}`);
            toast.success('Task deleted');
            navigate('/');
        } catch (error) {
            console.log('Error deleting the task:', error);
            toast.error('Failed to delete task');
        }
    };

    const handleSave = async () => {
        if (!note?.title?.trim() || !note?.content?.trim()) {
            toast.error('Please add a title and description');
            return;
        }

        setSaving(true);

        try {
            await api.put(`/notes/${id}`, note);
            toast.success('Task updated successfully');
            navigate('/');
        } catch (error) {
            console.log('Error saving the task:', error);
            toast.error('Failed to update task');
        } finally {
            setSaving(false);
        }
    };

    const handleToggleComplete = async () => {
        try {
            const updatedNote = { ...note, completed: !note.completed };
            await api.put(`/notes/${id}`, updatedNote);
            setNote(updatedNote);
            toast.success(note.completed ? 'Task marked as incomplete' : 'Task completed!');
        } catch (error) {
            console.log('Error updating task status:', error);
            toast.error('Failed to update task status');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-base-200 flex items-center justify-center">
                <LoaderIcon className="animate-spin size-10" />
            </div>
        );
    }

    if (!note) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Task not found</h2>
                    <Link to="/" className="btn btn-primary">
                        Back to Tasks
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,,#CC5500_50%)]">
            <div className="container mx-auto px-4 py-8 ">
                <div className="max-w-2xl mx-auto ">
                    <div className="flex items-center justify-between mb-6 ">
                        <Link to="/" className="btn btn-ghost  hover:bg-zinc-950">
                            <ArrowLeftIcon className="h-5 w-5" />
                            Back to Tasks
                        </Link>
                        <div className="flex gap-2">
                            <button
                                onClick={handleToggleComplete}
                                className={`btn ${note?.completed ? 'btn-warning' : 'btn-success'}`}
                            >
                                {note?.completed ? (
                                    <>
                                        <Circle className="h-5 w-5" />
                                        Mark Incomplete
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="h-5 w-5" />
                                        Mark Complete
                                    </>
                                )}
                            </button>
                            <button
                                onClick={handleDelete}
                                className="btn btn-error btn-outline"
                            >
                                <Trash2Icon className="h-5 w-5" />
                                Delete Task
                            </button>
                        </div>
                    </div>

                    <div className="card bg-base-100">
                        <div className="card-body">
                            <div className="form-control mb-4">
                                <label className="label">
                                    <span className="label-text">Task Title</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Task title"
                                    className="input input-bordered"
                                    value={note?.title || ''}
                                    onChange={(e) =>
                                        setNote({
                                            ...note,
                                            title: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div className="form-control mb-4">
                                <label className="label">
                                    <span className="label-text">Description</span>
                                </label>
                                <textarea
                                    placeholder="Describe your task..."
                                    className="textarea textarea-bordered h-32"
                                    value={note?.content || ''}
                                    onChange={(e) =>
                                        setNote({
                                            ...note,
                                            content: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text flex items-center gap-2">
                                            <Flag className="size-4" />
                                            Priority
                                        </span>
                                    </label>
                                    <select 
                                        className="select select-bordered"
                                        value={note?.priority || 'medium'}
                                        onChange={(e) => setNote({
                                            ...note,
                                            priority: e.target.value,
                                        })}
                                    >
                                        <option value="low">Low Priority</option>
                                        <option value="medium">Medium Priority</option>
                                        <option value="high">High Priority</option>
                                    </select>
                                </div>

                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text flex items-center gap-2">
                                            <Calendar className="size-4" />
                                            Due Date
                                        </span>
                                    </label>
                                    <input 
                                        type="date"
                                        className="input input-bordered"
                                        value={note?.dueDate ? new Date(note.dueDate).toISOString().split('T')[0] : ''}
                                        onChange={(e) => setNote({
                                            ...note,
                                            dueDate: e.target.value || null,
                                        })}
                                    />
                                </div>
                            </div>

                            <div className="card-actions justify-end">
                                <button
                                    className="btn btn-primary"
                                    disabled={saving}
                                    onClick={handleSave}
                                >
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default DetailPage;
