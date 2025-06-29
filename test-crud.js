// CRUD Operations Test Script
const testCRUD = async () => {
    const baseURL = 'http://localhost:5000/api';
    
    // Mock user ID (you'll need to replace this with a real user ID from your database)
    const testUserId = '507f1f77bcf86cd799439011'; // Replace with actual user ID
    
    console.log('🧪 Testing CRUD Operations...\n');

    try {
        // Test 1: Create a new note
        console.log('1️⃣ Testing CREATE operation...');
        const createResponse = await fetch(`${baseURL}/notes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: 'Test Task',
                content: 'This is a test task created by the test script',
                userId: testUserId,
                priority: 'high',
                dueDate: '2024-12-31'
            }),
        });

        if (createResponse.ok) {
            const createData = await createResponse.json();
            console.log('✅ CREATE successful:', createData.message);
            const noteId = createData.note._id;
            
            // Test 2: Read all notes
            console.log('\n2️⃣ Testing READ ALL operation...');
            const readAllResponse = await fetch(`${baseURL}/notes?userId=${testUserId}`);
            if (readAllResponse.ok) {
                const notes = await readAllResponse.json();
                console.log(`✅ READ ALL successful: Found ${notes.length} notes`);
            } else {
                console.log('❌ READ ALL failed:', readAllResponse.status);
            }

            // Test 3: Read single note
            console.log('\n3️⃣ Testing READ SINGLE operation...');
            const readSingleResponse = await fetch(`${baseURL}/notes/${noteId}`);
            if (readSingleResponse.ok) {
                const note = await readSingleResponse.json();
                console.log('✅ READ SINGLE successful:', note.title);
            } else {
                console.log('❌ READ SINGLE failed:', readSingleResponse.status);
            }

            // Test 4: Update note
            console.log('\n4️⃣ Testing UPDATE operation...');
            const updateResponse = await fetch(`${baseURL}/notes/${noteId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: 'Updated Test Task',
                    content: 'This task has been updated',
                    priority: 'medium',
                    completed: true
                }),
            });

            if (updateResponse.ok) {
                const updateData = await updateResponse.json();
                console.log('✅ UPDATE successful:', updateData.title);
            } else {
                console.log('❌ UPDATE failed:', updateResponse.status);
            }

            // Test 5: Delete note
            console.log('\n5️⃣ Testing DELETE operation...');
            const deleteResponse = await fetch(`${baseURL}/notes/${noteId}`, {
                method: 'DELETE',
            });

            if (deleteResponse.ok) {
                const deleteData = await deleteResponse.json();
                console.log('✅ DELETE successful:', deleteData.message);
            } else {
                console.log('❌ DELETE failed:', deleteResponse.status);
            }

        } else {
            const errorData = await createResponse.json();
            console.log('❌ CREATE failed:', errorData.message);
        }

    } catch (error) {
        console.error('❌ Test failed with error:', error.message);
        console.log('\n💡 Make sure:');
        console.log('   - Backend server is running on http://localhost:5000');
        console.log('   - MongoDB is connected');
        console.log('   - Replace testUserId with a real user ID');
    }

    console.log('\n🎉 CRUD test completed!');
};

// Test backend connectivity first
const testBackendConnectivity = async () => {
    try {
        const response = await fetch('http://localhost:5000/api/test');
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Backend connectivity test passed:', data.message);
            return true;
        } else {
            console.log('❌ Backend connectivity test failed');
            return false;
        }
    } catch (error) {
        console.log('❌ Backend not reachable:', error.message);
        return false;
    }
};

// Run tests
const runTests = async () => {
    console.log('🚀 Starting CRUD Operations Test\n');
    
    const backendReady = await testBackendConnectivity();
    if (backendReady) {
        console.log('\n📝 Proceeding with CRUD tests...\n');
        await testCRUD();
    } else {
        console.log('\n❌ Cannot proceed with CRUD tests - backend not ready');
        console.log('💡 Please ensure the backend server is running on http://localhost:5000');
    }
};

runTests();