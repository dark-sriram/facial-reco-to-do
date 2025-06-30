/**
 * Mock Database for Development
 * Used when MongoDB is not available
 */

// In-memory storage
let users = [];
let notes = [];
let nextUserId = 1;
let nextNoteId = 1;

export const mockDb = {
    // User operations
    users: {
        async create(userData) {
            const user = {
                _id: nextUserId++,
                id: nextUserId - 1,
                ...userData,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            users.push(user);
            return user;
        },

        async findById(id) {
            return users.find(user => user._id == id || user.id == id);
        },

        async findOne(query) {
            return users.find(user => {
                return Object.keys(query).every(key => {
                    if (key === 'name') {
                        return user.name === query[key];
                    }
                    return user[key] === query[key];
                });
            });
        },

        async find() {
            return users;
        },

        async updateOne(query, update) {
            const user = await this.findOne(query);
            if (user) {
                Object.assign(user, update.$set || update, { updatedAt: new Date() });
                return { modifiedCount: 1 };
            }
            return { modifiedCount: 0 };
        },

        async deleteOne(query) {
            const index = users.findIndex(user => 
                Object.keys(query).every(key => user[key] === query[key])
            );
            if (index !== -1) {
                users.splice(index, 1);
                return { deletedCount: 1 };
            }
            return { deletedCount: 0 };
        }
    },

    // Note operations
    notes: {
        async create(noteData) {
            const note = {
                _id: nextNoteId++,
                id: nextNoteId - 1,
                ...noteData,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            notes.push(note);
            return note;
        },

        async findById(id) {
            return notes.find(note => note._id == id || note.id == id);
        },

        async find(query = {}) {
            let filteredNotes;
            
            if (Object.keys(query).length === 0) {
                filteredNotes = [...notes];
            } else {
                filteredNotes = notes.filter(note => {
                    return Object.keys(query).every(key => {
                        if (key === 'userId') {
                            return note.userId == query[key];
                        }
                        return note[key] === query[key];
                    });
                });
            }
            
            // Sort by createdAt descending (newest first)
            return filteredNotes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        },

        async updateOne(query, update) {
            const note = notes.find(note => {
                return Object.keys(query).every(key => {
                    if (key === '_id') {
                        return note._id == query[key] || note.id == query[key];
                    }
                    return note[key] === query[key];
                });
            });
            if (note) {
                Object.assign(note, update.$set || update, { updatedAt: new Date() });
                return { modifiedCount: 1 };
            }
            return { modifiedCount: 0 };
        },

        async deleteOne(query) {
            const index = notes.findIndex(note => {
                return Object.keys(query).every(key => {
                    if (key === '_id') {
                        return note._id == query[key] || note.id == query[key];
                    }
                    return note[key] === query[key];
                });
            });
            if (index !== -1) {
                notes.splice(index, 1);
                return { deletedCount: 1 };
            }
            return { deletedCount: 0 };
        }
    },

    // Utility functions
    async clearAll() {
        users = [];
        notes = [];
        nextUserId = 1;
        nextNoteId = 1;
        console.log('🗑️  Mock database cleared');
    },

    async seed() {
        // Add some sample data
        await this.users.create({
            name: 'Demo User',
            faceDescriptor: new Array(128).fill(0).map(() => Math.random())
        });

        await this.notes.create({
            title: 'Welcome to Facial Recognition Todo!',
            content: 'This is a demo note. You can create, edit, and delete notes after logging in with face recognition.',
            userId: 1,
            priority: 'medium'
        });

        console.log('🌱 Mock database seeded with sample data');
    },

    getStats() {
        return {
            users: users.length,
            notes: notes.length,
            totalMemoryUsage: JSON.stringify({ users, notes }).length
        };
    }
};

// Initialize with sample data
if (process.env.NODE_ENV === 'development') {
    mockDb.seed();
}