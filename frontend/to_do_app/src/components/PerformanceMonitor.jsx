import React, { useState, useEffect } from 'react';
import { Activity, Wifi, WifiOff } from 'lucide-react';

const PerformanceMonitor = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [connectionSpeed, setConnectionSpeed] = useState('unknown');
    const [performanceMetrics, setPerformanceMetrics] = useState({
        memory: null,
        timing: null
    });

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Monitor connection speed
        if ('connection' in navigator) {
            const connection = navigator.connection;
            setConnectionSpeed(connection.effectiveType || 'unknown');
            
            const updateConnection = () => {
                setConnectionSpeed(connection.effectiveType || 'unknown');
            };
            
            connection.addEventListener('change', updateConnection);
            
            return () => {
                connection.removeEventListener('change', updateConnection);
            };
        }

        // Monitor performance
        if ('performance' in window && 'memory' in performance) {
            const updateMetrics = () => {
                setPerformanceMetrics({
                    memory: performance.memory,
                    timing: performance.timing
                });
            };
            
            updateMetrics();
            const interval = setInterval(updateMetrics, 5000);
            
            return () => clearInterval(interval);
        }

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const getConnectionColor = () => {
        if (!isOnline) return 'text-red-500';
        switch (connectionSpeed) {
            case '4g': return 'text-green-500';
            case '3g': return 'text-yellow-500';
            case '2g': return 'text-orange-500';
            case 'slow-2g': return 'text-red-500';
            default: return 'text-blue-500';
        }
    };

    const formatBytes = (bytes) => {
        if (!bytes) return 'N/A';
        const mb = bytes / (1024 * 1024);
        return `${mb.toFixed(1)}MB`;
    };

    // Only show in development mode
    if (import.meta.env.MODE !== 'development') {
        return null;
    }

    return (
        <div className="fixed bottom-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs font-mono z-50">
            <div className="flex items-center gap-2 mb-2">
                <Activity size={14} />
                <span>Performance Monitor</span>
            </div>
            
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
                    <span className={getConnectionColor()}>
                        {isOnline ? `Online (${connectionSpeed})` : 'Offline'}
                    </span>
                </div>
                
                {performanceMetrics.memory && (
                    <div>
                        <div>Memory: {formatBytes(performanceMetrics.memory.usedJSHeapSize)}</div>
                        <div>Limit: {formatBytes(performanceMetrics.memory.jsHeapSizeLimit)}</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PerformanceMonitor;