import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
    Plus, 
    Search, 
    Filter, 
    Edit3, 
    Trash2, 
    Check, 
    X, 
    Calendar, 
    AlertCircle,
    CheckCircle,
    Clock,
    User,
    LogOut,
    RefreshCw
} from 'lucide-react';
import { API_BASE_URL } from '../config/api';

const EnhancedNotesInterface = ({ user, onLogout }) => {
    
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterPriority, setFilterPriority] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingNote, setEditingNote] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        priority: 'medium',
        dueDate: ''
    });

    // Fetch notes
    const fetchNotes = async () => {
        try {
            setLoading(true);
            
            // Check if user object is valid
            if (!user || (!user.id && !user._id)) {
                console.error('Invalid user object:', user);
                toast.error('User not properly authenticated');
                return;
            }
            
            const userId = user.id || user._id;
            const url = `${API_BASE_URL}/api/notes?userId=${userId}`;
            

            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            
            if (response.ok) {
                const data = await response.json();
                setNotes(data);
            } else {
                toast.error('Failed to fetch notes');
            }
        } catch (error) {
            console.error('Error fetching notes:', error);
            toast.error('Network error while fetching notes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotes();
    }, [user]);

    // Create or update note
    const handleSaveNote = async () => {
        if (!formData.title.trim() || !formData.content.trim()) {
            toast.error('Title and content are required');
            return;
        }

        try {
            const url = editingNote 
                ? `${API_BASE_URL}/api/notes/${editingNote._id || editingNote.id}`
                : `${API_BASE_URL}/api/notes`;
            
            const method = editingNote ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    userId: user.id || user._id
                }),
            });

            if (response.ok) {
                toast.success(editingNote ? 'Note updated!' : 'Note created!');
                setShowCreateForm(false);
                setEditingNote(null);
                setFormData({ title: '', content: '', priority: 'medium', dueDate: '' });
                fetchNotes();
            } else {
                const error = await response.json();
                toast.error(error.message || 'Failed to save note');
            }
        } catch (error) {
            console.error('Error saving note:', error);
            toast.error('Network error while saving note');
        }
    };

    // Delete note
    const handleDeleteNote = async (noteId) => {
        if (!confirm('Are you sure you want to delete this note?')) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/notes/${noteId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                toast.success('Note deleted!');
                fetchNotes();
            } else {
                toast.error('Failed to delete note');
            }
        } catch (error) {
            console.error('Error deleting note:', error);
            toast.error('Network error while deleting note');
        }
    };

    // Toggle note completion
    const handleToggleComplete = async (note) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/notes/${note._id || note.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    completed: !note.completed
                }),
            });

            if (response.ok) {
                toast.success(note.completed ? 'Task marked as incomplete' : 'Task completed!');
                fetchNotes();
            } else {
                toast.error('Failed to update note');
            }
        } catch (error) {
            console.error('Error updating note:', error);
            toast.error('Network error while updating note');
        }
    };

    // Start editing
    const handleEditNote = (note) => {
        setEditingNote(note);
        setFormData({
            title: note.title,
            content: note.content,
            priority: note.priority || 'medium',
            dueDate: note.dueDate ? new Date(note.dueDate).toISOString().split('T')[0] : ''
        });
        setShowCreateForm(true);
    };

    // Filter notes
    const filteredNotes = notes.filter(note => {
        const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            note.content.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesPriority = filterPriority === 'all' || note.priority === filterPriority;
        
        const matchesStatus = filterStatus === 'all' || 
                            (filterStatus === 'completed' && note.completed) ||
                            (filterStatus === 'pending' && !note.completed);
        
        return matchesSearch && matchesPriority && matchesStatus;
    });

    // Get priority color
    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'text-red-600 bg-red-100';
            case 'medium': return 'text-yellow-600 bg-yellow-100';
            case 'low': return 'text-green-600 bg-green-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    // Get priority icon
    const getPriorityIcon = (priority) => {
        switch (priority) {
            case 'high': return AlertCircle;
            case 'medium': return Clock;
            case 'low': return CheckCircle;
            default: return Clock;
        }
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    return (
        <div className="min-h-screen bg-slate-300">
            {/* Header */}
            <div className="bg-slate-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center space-x-4">
                            <h1 className="text-4xl font-bold text-gray-900">
                                     My To-do
                            </h1>
                            <div className="flex items-center space-x-2 text-sm text-black">
                                <User className="w-4 h-4" />
                                <span>{user.name}</span>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={fetchNotes}
                                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Refresh"
                            >
                                <RefreshCw className="w-5 h-5" />
                            </button>
                            <button
                                onClick={onLogout}
                                className="flex items-center space-x-2 px-4 py-2 text-red-700 hover:text-orange-700 hover:bg-white rounded-lg transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Controls */}
                <div className="mb-8 space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search notes..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-white focus:border-transparent"
                            />
                        </div>

                        {/* Filters */}
                        <div className="flex gap-2">
                            <select
                                value={filterPriority}
                                onChange={(e) => setFilterPriority(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-white focus:border-transparent"
                            >
                                <option value="all">All Priorities</option>
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>
                            </select>

                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-white focus:border-transparent"
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>

                        {/* Add Note Button */}
                        <button
                            onClick={() => {
                                setShowCreateForm(true);
                                setEditingNote(null);
                                setFormData({ title: '', content: '', priority: 'medium', dueDate: '' });
                            }}
                            className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-black text-white rounded-lg transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            <span>Add Task</span>
                        </button>
                    </div>
                </div>

                {/* Create/Edit Form */}
                {showCreateForm && (
                    <div className="mb-8 bg-white text-black rounded-xl shadow-sm border p-6">
                        <h2 className="text-xl font-semibold mb-4">
                            {editingNote ? 'Edit Task' : 'Create New Task'}
                        </h2>
                        
                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="Task title..."
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-2 border text-slate-300 border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-950 focus:border-gray-800"
                            />
                            
                            <textarea
                                placeholder="Task description..."
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                rows={4}
                                className="w-full px-4 py-2 border text-slate-300 border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent resize-none"
                            />
                            
                            <div className="flex gap-4">
                                <select
                                    value={formData.priority}
                                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                    className="px-3 py-2 border border-gray-300 rounded-lg text-white focus:ring-2 focus:ring-black focus:border-transparent"
                                >
                                    <option value="low">Low Priority</option>
                                    <option value="medium">Medium Priority</option>
                                    <option value="high">High Priority</option>
                                </select>
                                
                                <input
                                    type="date"
                                    value={formData.dueDate}
                                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                    className="px-3 py-2 border text-white border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            
                            <div className="flex gap-3">
                                <button
                                    onClick={handleSaveNote}
                                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                                >
                                    <Check className="w-4 h-4" />
                                    <span>{editingNote ? 'Update' : 'Create'}</span>
                                </button>
                                
                                <button
                                    onClick={() => {
                                        setShowCreateForm(false);
                                        setEditingNote(null);
                                    }}
                                    className="flex items-center space-x-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                    <span>Cancel</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Notes List */}
                {loading ? (
                    <div className="text-center py-12">
                        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-600">Loading your tasks...</p>
                    </div>
                ) : filteredNotes.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">📝</div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">
                            {notes.length === 0 ? 'No tasks yet' : 'No matching tasks'}
                        </h3>
                        <p className="text-gray-600 mb-6">
                            {notes.length === 0 
                                ? 'Create your first task to get started!' 
                                : 'Try adjusting your search or filters.'
                            }
                        </p>
                        {notes.length === 0 && (
                            <button
                                onClick={() => setShowCreateForm(true)}
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                            >
                                Create Your First Task
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {filteredNotes.map((note) => {
                            const PriorityIcon = getPriorityIcon(note.priority);
                            const isOverdue = note.dueDate && new Date(note.dueDate) < new Date() && !note.completed;
                            
                            return (
                                <div
                                    key={note._id || note.id}
                                    className={`bg-white rounded-xl shadow-sm border p-6 transition-all hover:shadow-md ${
                                        note.completed ? 'opacity-75' : ''
                                    } ${isOverdue ? 'border-red-200 bg-red-50' : ''}`}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => handleToggleComplete(note)}
                                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                                    note.completed
                                                        ? 'bg-green-500 border-green-500 text-white'
                                                        : 'border-gray-300 hover:border-green-500'
                                                }`}
                                            >
                                                {note.completed && <Check className="w-3 h-3" />}
                                            </button>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(note.priority)}`}>
                                                <PriorityIcon className="w-3 h-3 inline mr-1" />
                                                {note.priority}
                                            </span>
                                        </div>
                                        
                                        <div className="flex space-x-1">
                                            <button
                                                onClick={() => handleEditNote(note)}
                                                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteNote(note._id || note.id)}
                                                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <h3 className={`font-semibold text-gray-900 mb-2 ${
                                        note.completed ? 'line-through text-gray-500' : ''
                                    }`}>
                                        {note.title}
                                    </h3>
                                    
                                    <p className={`text-gray-600 text-sm mb-3 ${
                                        note.completed ? 'line-through' : ''
                                    }`}>
                                        {note.content}
                                    </p>
                                    
                                    {note.dueDate && (
                                        <div className={`flex items-center space-x-1 text-xs ${
                                            isOverdue ? 'text-red-600' : 'text-gray-500'
                                        }`}>
                                            <Calendar className="w-3 h-3" />
                                            <span>Due: {formatDate(note.dueDate)}</span>
                                            {isOverdue && <span className="font-semibold">(Overdue)</span>}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Stats */}
                {notes.length > 0 && (
                    <div className="mt-8 bg-white rounded-xl shadow-sm border p-6">
                        <h3 className="text-lg font-semibold text-black mb-4"> Task Statistics</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">{notes.length}</div>
                                <div className="text-sm text-gray-600">Total Tasks</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">
                                    {notes.filter(n => n.completed).length}
                                </div>
                                <div className="text-sm text-gray-600">Completed</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-yellow-600">
                                    {notes.filter(n => !n.completed).length}
                                </div>
                                <div className="text-sm text-gray-600">Pending</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-red-600">
                                    {notes.filter(n => n.dueDate && new Date(n.dueDate) < new Date() && !n.completed).length}
                                </div>
                                <div className="text-sm text-gray-600">Overdue</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EnhancedNotesInterface;