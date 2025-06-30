import React from 'react';
import { Loader } from 'lucide-react';

const LoadingSpinner = ({ message = 'Loading...', size = 'md' }) => {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12'
    };

    return (
        <div className="flex flex-col items-center justify-center p-4">
            <Loader className={`animate-spin text-blue-500 ${sizeClasses[size]}`} />
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{message}</p>
        </div>
    );
};

export default LoadingSpinner;