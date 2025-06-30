# 🎭 Facial Recognition To-Do Application

A modern, secure to-do list application that uses advanced facial recognition for user authentication. Each user's tasks are personalized and accessible only through face recognition login.

![App Screenshot](https://via.placeholder.com/800x400/1e40af/ffffff?text=Facial+Recognition+Todo+App)

## ✨ Features

- **🔐 Facial Recognition Authentication**: Secure login using face-api.js
- **📝 Personal Task Management**: Each user has their own private to-do list
- **📹 Real-time Face Detection**: Live camera feed with face detection feedback
- **📱 Responsive Design**: Works seamlessly on desktop and mobile devices
- **🔒 Secure Data Storage**: Face descriptors are encrypted and stored securely
- **⚡ Fast Performance**: Optimized for quick face recognition and smooth UX
- **🎨 Modern UI**: Beautiful, intuitive interface with smooth animations

## 🛠 Tech Stack

### Frontend
- **React 19** - Modern React with latest features
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **face-api.js** - Face recognition and detection
- **React Router** - Client-side routing
- **React Hot Toast** - Beautiful notifications

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - API protection

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB database (local or cloud)
- Webcam/Camera access
- Modern web browser with WebRTC support

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/dark-sriram/facial-reco-to-do.git
cd facial-reco-to-do
```

### 2. Install Dependencies
```bash
npm run install-all
```

### 3. Environment Setup
Create environment files:

**Backend (.env in backend folder):**
```env
MONGO_URI=your_mongodb_connection_string
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token
```

**Frontend (.env in frontend/to_do_app folder):**
```env
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=Facial Recognition Todo
VITE_NODE_ENV=development
```

### 4. Start Development Servers
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## 📖 Usage Guide

### First Time Setup
1. **Allow Camera Permissions**: Grant camera access when prompted
2. **Wait for Models**: Face recognition models will load automatically
3. **Register Account**: 
   - Click "Register" tab
   - Enter your name
   - Position your face in the camera frame
   - Click "Register Face"

### Logging In
1. **Switch to Login**: Click the "Login" tab
2. **Face Recognition**: Look at the camera and click "Login with Face"
3. **Access Granted**: System recognizes your face and logs you in

### Managing Tasks
- **Add Tasks**: Click the "+" button to create new tasks
- **Edit Tasks**: Click on any task to edit it
- **Delete Tasks**: Use the delete button to remove tasks
- **Privacy**: All tasks are private to your account

## 🌐 Deployment

### Heroku Deployment

1. **Create Heroku App**:
```bash
heroku create your-app-name
```

2. **Set Environment Variables**:
```bash
heroku config:set MONGO_URI=your_mongodb_uri
heroku config:set NODE_ENV=production
heroku config:set UPSTASH_REDIS_REST_URL=your_redis_url
heroku config:set UPSTASH_REDIS_REST_TOKEN=your_redis_token
```

3. **Deploy**:
```bash
git push heroku main
```

### Vercel Deployment (Frontend)

1. **Install Vercel CLI**:
```bash
npm i -g vercel
```

2. **Deploy Frontend**:
```bash
cd frontend/to_do_app
vercel --prod
```

### Railway Deployment (Backend)

1. **Connect Repository**: Link your GitHub repo to Railway
2. **Set Environment Variables**: Add all backend env vars
3. **Deploy**: Railway will automatically deploy

### Manual Server Deployment

1. **Build Application**:
```bash
npm run build
```

2. **Set Production Environment**:
```bash
export NODE_ENV=production
```

3. **Start Server**:
```bash
npm start
```

## 🔒 Security Features

- **Encrypted Face Data**: Face descriptors stored as encrypted numerical arrays
- **No Image Storage**: Actual face images are never stored
- **Rate Limiting**: API protection against abuse
- **CORS Protection**: Secure cross-origin requests
- **Input Validation**: All inputs are validated and sanitized
- **Environment Variables**: Sensitive data stored securely

## 🌍 Browser Compatibility

| Browser | Version | Status |
|---------|---------|--------|
| Chrome  | 60+     | ✅ Full Support |
| Firefox | 55+     | ✅ Full Support |
| Safari  | 11+     | ✅ Full Support |
| Edge    | 79+     | ✅ Full Support |

## 🔧 Troubleshooting

### Camera Issues
- ✅ Ensure camera permissions are granted
- ✅ Check if camera is being used by another application
- ✅ Try refreshing the page
- ✅ Test in different browsers

### Face Recognition Issues
- ✅ Ensure good lighting conditions
- ✅ Face the camera directly
- ✅ Remove glasses if causing glare
- ✅ Try different angles
- ✅ Ensure only one face is visible

### Connection Issues
- ✅ Check if backend server is running
- ✅ Verify MongoDB connection
- ✅ Check network connectivity
- ✅ Verify environment variables

### Performance Issues
- ✅ Close unnecessary browser tabs
- ✅ Ensure stable internet connection
- ✅ Clear browser cache
- ✅ Update browser to latest version

## 📊 API Endpoints

### User Routes
- `POST /api/users/register` - Register new user
- `POST /api/users/authenticate` - Authenticate user
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID

### Notes Routes
- `GET /api/notes` - Get all notes for user
- `POST /api/notes` - Create new note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

### Health Check
- `GET /api/health` - Server health status

## 🤝 Contributing

1. **Fork the Repository**
2. **Create Feature Branch**: `git checkout -b feature/amazing-feature`
3. **Commit Changes**: `git commit -m 'Add amazing feature'`
4. **Push to Branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [face-api.js](https://github.com/justadudewhohacks/face-api.js) for face recognition
- [React](https://reactjs.org/) for the amazing framework
- [Tailwind CSS](https://tailwindcss.com/) for beautiful styling
- [MongoDB](https://www.mongodb.com/) for reliable data storage

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Troubleshooting](#-troubleshooting) section
2. Search existing [Issues](https://github.com/dark-sriram/facial-reco-to-do/issues)
3. Create a new issue with detailed information

---

Made with ❤️ by [SRIRAM](https://github.com/dark-sriram)