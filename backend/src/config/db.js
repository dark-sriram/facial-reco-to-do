import mongoose from 'mongoose';

export const connectDB = async () => {
    try {
        // Set mongoose options for better connection handling
        const options = {
            serverSelectionTimeoutMS: 10000, // 10 seconds
            socketTimeoutMS: 45000, // 45 seconds
            maxPoolSize: 10,
            minPoolSize: 1,
            maxIdleTimeMS: 30000,
            bufferCommands: false,
        };

        console.log('🔄 Connecting to MongoDB...');
        console.log('📍 Connection URI:', process.env.MONGO_URI ? 'URI provided' : 'URI missing');
        
        const conn = await mongoose.connect(process.env.MONGO_URI, options);
        
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log(`📊 Database: ${conn.connection.name}`);
        console.log(`🔗 Connection State: ${conn.connection.readyState}`);
        
        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err);
        });
        
        mongoose.connection.on('disconnected', () => {
            console.warn('⚠️  MongoDB disconnected');
        });
        
        mongoose.connection.on('reconnected', () => {
            console.log('🔄 MongoDB reconnected');
        });
        
        return conn;
    } catch (error) {
        console.error("❌ MongoDB Connection Error:", error.message);
        
        // Provide helpful error messages
        if (error.message.includes('ECONNREFUSED')) {
            console.error('💡 Troubleshooting tips:');
            console.error('   1. Check if MongoDB Atlas cluster is running');
            console.error('   2. Verify network connectivity');
            console.error('   3. Check if IP address is whitelisted in MongoDB Atlas');
            console.error('   4. Verify connection string credentials');
        }
        
        if (error.message.includes('authentication failed')) {
            console.error('💡 Authentication failed - check username/password in connection string');
        }
        
        if (error.message.includes('timeout')) {
            console.error('💡 Connection timeout - check network connectivity and firewall settings');
        }
        
        // In development, continue without database for testing
        if (process.env.NODE_ENV === 'development') {
            console.warn('⚠️  Running in development mode without database connection');
            console.warn('⚠️  Some features may not work properly');
            return null;
        }
        
        process.exit(1);
    }
};
