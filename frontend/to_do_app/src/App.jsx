import { Route, Routes } from 'react-router';
import { Toaster } from 'react-hot-toast';

import HomePage from './pages/HomePage'
import CreatePage from './pages/CreatePage';
import DetailPage from './pages/DetailPage';
import EnhancedFaceLogin from './components/EnhancedFaceLogin';
import EnhancedNotesInterface from './components/EnhancedNotesInterface';
import ErrorBoundary from './components/ErrorBoundary';
import PerformanceMonitor from './components/PerformanceMonitor';
import ApiTest from './components/ApiTest';
import { UserProvider, useUser } from './context/UserContext';

const AppContent = () => {
    const { isAuthenticated, user, login, register, logout } = useUser();

    if (!isAuthenticated) {
        return (
            <div>
                <ApiTest />
                <EnhancedFaceLogin onLogin={login} onRegister={register} />
            </div>
        );
    }

    // For the main route, use the enhanced interface
    return (
        <Routes>
            <Route path="/" element={<EnhancedNotesInterface user={user} onLogout={logout} />} />
            <Route path="/legacy" element={
                <div className='relative h-full w-full'>
                    <div className="absolute inset-0 -z-10 h-full w-full items-center px-5 py-24 [background:radial-gradient(125%_125%_at_50%_10%,#000_60%,#CC5500_100%)]" />
                    <Routes>
                        <Route path="/legacy" element={<HomePage />} />
                        <Route path="/legacy/create" element={<CreatePage />} />
                        <Route path="/legacy/notes/:id" element={<DetailPage />} />
                    </Routes>
                </div>
            } />
            <Route path="/create" element={<CreatePage />} />
            <Route path="/notes/:id" element={<DetailPage />} />
        </Routes>
    );
};

const App = () => {
    return (
        <ErrorBoundary>
            <UserProvider>
                <AppContent />
                <Toaster 
                    position="top-right"
                    toastOptions={{
                        duration: 4000,
                        style: {
                            background: '#363636',
                            color: '#fff',
                            borderRadius: '8px',
                            fontSize: '14px',
                        },
                        success: {
                            iconTheme: {
                                primary: '#10B981',
                                secondary: '#fff',
                            },
                        },
                        error: {
                            iconTheme: {
                                primary: '#EF4444',
                                secondary: '#fff',
                            },
                        },
                    }}
                />
                <PerformanceMonitor />
            </UserProvider>
        </ErrorBoundary>
    );
};

export default App;
