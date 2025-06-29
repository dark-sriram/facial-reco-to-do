import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        faceDescriptor: {
            type: [Number], // Array of numbers representing face encoding
            required: true,
        },
        profileImage: {
            type: String, // Base64 encoded image or file path
            required: false,
        },
    },
    { timestamps: true }
);

const User = mongoose.model('User', userSchema);

export default User;