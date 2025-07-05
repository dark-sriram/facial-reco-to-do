import React, { useEffect } from 'react';
import { API_BASE_URL } from '../config/api';

const ApiTest = () => {
    useEffect(() => {
        console.log('=== API Configuration Debug ===');
        console.log('API_BASE_URL:', API_BASE_URL);
        console.log('import.meta.env:', import.meta.env);
        console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
        
        // Test fetch
        const testFetch = async () => {
            try {
                console.log('Testing fetch to:', `${API_BASE_URL}/api/health`);
                const response = await fetch(`${API_BASE_URL}/api/health`);
                console.log('Response status:', response.status);
                console.log('Response ok:', response.ok);
                const data = await response.json();
                console.log('Response data:', data);
            } catch (error) {
                console.error('Fetch test failed:', error);
            }
        };
        
        testFetch();
    }, []);

    return (
        <div style={{ padding: '20px', background: '#f0f0f0', margin: '20px' }}>
            <h3>API Configuration Test</h3>
            <p><strong>API_BASE_URL:</strong> {API_BASE_URL}</p>
            <p><strong>VITE_API_URL:</strong> {import.meta.env.VITE_API_URL}</p>
            <p>Check console for detailed logs</p>
        </div>
    );
};

export default ApiTest;