# 📝 Note Taking Application

A full-stack MERN (MongoDB, Express.js, React, Node.js) note-taking application that allows users to create, read, update, and delete notes with a modern and responsive user interface.

## ✨ Features

-   **Create Notes**: Add new notes with title and content
-   **View Notes**: Browse all notes in a card-based layout
-   **Edit Notes**: Update existing notes
-   **Delete Notes**: Remove notes with confirmation dialog
-   **Responsive Design**: Works seamlessly on desktop and mobile devices
-   **Real-time Feedback**: Toast notifications for user actions
-   **Rate Limiting**: API protection against abuse
-   **Modern UI**: Built with Tailwind CSS and DaisyUI components

## 🛠️ Tech Stack

### Frontend

-   **React 19.1.0** - Modern React with latest features
-   **Vite** - Fast build tool and development server
-   **React Router 7.6.2** - Client-side routing
-   **Tailwind CSS** - Utility-first CSS framework
-   **DaisyUI** - Tailwind CSS component library
-   **Lucide React** - Beautiful icons
-   **React Hot Toast** - Elegant notifications
-   **Axios** - HTTP client for API requests

### Backend

-   **Node.js** - JavaScript runtime
-   **Express.js** - Web application framework
-   **MongoDB** - NoSQL database
-   **Mongoose** - MongoDB object modeling
-   **CORS** - Cross-origin resource sharing
-   **Upstash Redis** - Rate limiting and caching
-   **dotenv** - Environment variable management

## 📁 Project Structure

```
note_taking_application/
├── frontend/
│   └── to_do_app/
│       ├── src/
│       │   ├── components/
│       │   │   ├── Navbar.jsx
│       │   │   ├── NoteCard.jsx
│       │   │   ├── NotesNotFound.jsx
│       │   │   └── rateLimitedui.jsx
│       │   ├── pages/
│       │   │   ├── CreatePage.jsx
│       │   │   ├── DetailPage.jsx
│       │   │   └── HomePage.jsx
│       │   ├── lib/
│       │   │   ├── axios.js
│       │   │   └── utils.js
│       │   ├── App.jsx
│       │   └── main.jsx
│       ├── package.json
│       └── vite.config.js
└── backend/
    └── src/
        ├── config/
        │   ├── db.js
        │   └── upstash.js
        ├── controllers/
        │   └── controller.js
        ├── middleware/
        │   └── rateLimiter.js
        ├── model/
        │   └── Note.js
        ├── routes/
        │   └── routesNotes.js
        ├── server.js
        └── package.json
```

## 🚀 Getting Started

### Prerequisites

-   Node.js (v16 or higher)
-   MongoDB database
-   Upstash Redis account (for rate limiting)

### Installation

1. **Clone the repository**

    ```bash
    git clone <repository-url>
    cd note_taking_application
    ```

2. **Backend Setup**

    ```bash
    cd backend
    npm install
    ```

3. **Frontend Setup**
    ```bash
    cd frontend/to_do_app
    npm install
    ```

### Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
PORT=5001
MONGODB_URI=your_mongodb_connection_string
UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token
```

### Running the Application

1. **Start the Backend Server**

    ```bash
    cd backend
    npm run dev
    ```

    The backend server will run on `http://localhost:5001`

2. **Start the Frontend Development Server**
    ```bash
    cd frontend/to_do_app
    npm run dev
    ```
    The frontend will run on `http://localhost:5173`

## 📡 API Endpoints

| Method | Endpoint         | Description         |
| ------ | ---------------- | ------------------- |
| GET    | `/api/notes`     | Get all notes       |
| GET    | `/api/notes/:id` | Get a specific note |
| POST   | `/api/notes`     | Create a new note   |
| PUT    | `/api/notes/:id` | Update a note       |
| DELETE | `/api/notes/:id` | Delete a note       |

## 🎨 UI Components

-   **Navbar**: Navigation header with branding
-   **NoteCard**: Individual note display component
-   **NotesNotFound**: Empty state component
-   **RateLimitedUI**: Rate limit exceeded notification

## 🔧 Development Scripts

### Frontend

-   `npm run dev` - Start development server
-   `npm run build` - Build for production
-   `npm run preview` - Preview production build
-   `npm run lint` - Run ESLint

### Backend

-   `npm run dev` - Start development server with nodemon
-   `npm start` - Start production server

## 🛡️ Security Features

-   **Rate Limiting**: Prevents API abuse using Upstash Redis
-   **CORS Configuration**: Restricts cross-origin requests
-   **Input Validation**: Server-side validation for note data

## 🎯 Future Enhancements

-   [ ] User authentication and authorization
-   [ ] Note categories and tags
-   [ ] Search functionality
-   [ ] Rich text editor
-   [ ] File attachments
-   [ ] Note sharing capabilities
-   [ ] Dark/Light theme toggle
-   [ ] Offline support with PWA

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

Created with ❤️ by SRIRAM

---

**Happy Note Taking! 📝✨**
