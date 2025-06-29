// Simple test script to verify backend connectivity
const testBackend = async () => {
    try {
        console.log('🧪 Testing backend connectivity...');
        
        // Test basic connectivity
        const testResponse = await fetch('http://localhost:5000/api/test');
        if (testResponse.ok) {
            const testData = await testResponse.json();
            console.log('✅ Backend test endpoint working:', testData.message);
        } else {
            console.log('❌ Backend test endpoint failed');
            return;
        }

        // Test user registration endpoint (without actual data)
        const registerResponse = await fetch('http://localhost:5000/api/users/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                // Empty body to test validation
            }),
        });
        
        const registerData = await registerResponse.json();
        console.log('📝 Registration endpoint response:', registerData.message);

        // Test authentication endpoint (without actual data)
        const authResponse = await fetch('http://localhost:5000/api/users/authenticate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                // Empty body to test validation
            }),
        });
        
        const authData = await authResponse.json();
        console.log('🔐 Authentication endpoint response:', authData.message);

        console.log('🎉 Backend connectivity test completed!');
        
    } catch (error) {
        console.error('❌ Backend test failed:', error.message);
        console.log('💡 Make sure the backend server is running on http://localhost:5000');
    }
};

// Run the test
testBackend();