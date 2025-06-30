/**
 * Database Adapter
 * Provides a unified interface for both MongoDB and Mock Database
 */

import User from '../model/User.js';
import Note from '../model/Note.js';
import { mockDb } from './mockDb.js';

class DatabaseAdapter {
    constructor() {
        this.isUsingMockDb = () => global.usingMockDb || false;
    }

    // User operations
    async createUser(userData) {
        if (this.isUsingMockDb()) {
            return await mockDb.users.create(userData);
        }
        const user = new User(userData);
        return await user.save();
    }

    async findUserById(id) {
        if (this.isUsingMockDb()) {
            return await mockDb.users.findById(id);
        }
        return await User.findById(id);
    }

    async findUserByName(name) {
        if (this.isUsingMockDb()) {
            return await mockDb.users.findOne({ name });
        }
        return await User.findOne({ name });
    }

    async findAllUsers() {
        if (this.isUsingMockDb()) {
            return await mockDb.users.find();
        }
        return await User.find();
    }

    async updateUser(query, update) {
        if (this.isUsingMockDb()) {
            return await mockDb.users.updateOne(query, update);
        }
        return await User.updateOne(query, update);
    }

    async deleteUser(query) {
        if (this.isUsingMockDb()) {
            return await mockDb.users.deleteOne(query);
        }
        return await User.deleteOne(query);
    }

    // Note operations
    async createNote(noteData) {
        if (this.isUsingMockDb()) {
            return await mockDb.notes.create(noteData);
        }
        const note = new Note(noteData);
        return await note.save();
    }

    async findNoteById(id) {
        if (this.isUsingMockDb()) {
            return await mockDb.notes.findById(id);
        }
        return await Note.findById(id);
    }

    async findNotes(query = {}) {
        if (this.isUsingMockDb()) {
            return await mockDb.notes.find(query);
        }
        return await Note.find(query);
    }

    async updateNote(query, update) {
        if (this.isUsingMockDb()) {
            return await mockDb.notes.updateOne(query, update);
        }
        return await Note.updateOne(query, update);
    }

    async deleteNote(query) {
        if (this.isUsingMockDb()) {
            return await mockDb.notes.deleteOne(query);
        }
        return await Note.deleteOne(query);
    }

    // Utility methods
    getDatabaseType() {
        return this.isUsingMockDb() ? 'Mock Database' : 'MongoDB';
    }

    async getStats() {
        if (this.isUsingMockDb()) {
            return mockDb.getStats();
        }
        
        try {
            const userCount = await User.countDocuments();
            const noteCount = await Note.countDocuments();
            return {
                users: userCount,
                notes: noteCount,
                database: 'MongoDB'
            };
        } catch (error) {
            return {
                users: 0,
                notes: 0,
                database: 'MongoDB (Error)',
                error: error.message
            };
        }
    }

    async healthCheck() {
        try {
            if (this.isUsingMockDb()) {
                const stats = mockDb.getStats();
                return {
                    status: 'healthy',
                    database: 'Mock Database',
                    stats
                };
            }
            
            // Try a simple query to check MongoDB connection
            await User.findOne().limit(1);
            const stats = await this.getStats();
            
            return {
                status: 'healthy',
                database: 'MongoDB',
                stats
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                database: this.getDatabaseType(),
                error: error.message
            };
        }
    }
}

// Export singleton instance
export const db = new DatabaseAdapter();
export default db;