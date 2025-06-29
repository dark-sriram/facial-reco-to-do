@echo off
echo Starting Face Recognition To-Do App...

echo Starting Backend Server...
start cmd /k "cd backend && npm start"

timeout /t 3

echo Starting Frontend Server...
start cmd /k "cd frontend/to_do_app && npm run dev"

echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
pause