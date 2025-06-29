import { Route, Routes } from 'react-router';
import { Toaster } from 'react-hot-toast';

import HomePage from './pages/HomePage'
import CreatePage from './pages/CreatePage';
import DetailPage from './pages/DetailPage';
import FaceLoginFixed from './components/FaceLoginFixed';
import { UserProvider, useUser } from './context/UserContext';

const AppContent = () => {
    const { isAuthenticated, login, register } = useUser();

    if (!isAuthenticated) {
        return <FaceLoginFixed onLogin={login} onRegister={register} />;
    }

    return (
        <div className='relative h-full w-full'>
            <div className="absolute inset-0 -z-10 h-full w-full items-center px-5 py-24 [background:radial-gradient(125%_125%_at_50%_10%,#000_60%,#CC5500_100%)]" />
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/create" element={<CreatePage />} />
                <Route path="/notes/:id" element={<DetailPage />} />
            </Routes>
        </div>
    );
};

const App = () => {
    return (
        <UserProvider>
            <AppContent />
            <Toaster 
                position="top-right"
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: '#363636',
                        color: '#fff',
                    },
                }}
            />
        </UserProvider>
    );
};

export default App;
