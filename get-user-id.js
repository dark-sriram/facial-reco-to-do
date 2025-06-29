// Script to get user IDs from the database
const getUserIds = async () => {
    try {
        console.log('🔍 Fetching registered users...');
        
        const response = await fetch('http://localhost:5000/api/users');
        
        if (response.ok) {
            const users = await response.json();
            console.log(`✅ Found ${users.length} registered users:`);
            
            users.forEach((user, index) => {
                console.log(`${index + 1}. Name: ${user.name}, ID: ${user._id}`);
            });
            
            if (users.length > 0) {
                console.log(`\n💡 Use this ID for testing: ${users[0]._id}`);
                return users[0]._id;
            } else {
                console.log('\n⚠️ No users found. Please register a user first through the face recognition interface.');
            }
        } else {
            console.log('❌ Failed to fetch users:', response.status);
        }
    } catch (error) {
        console.error('❌ Error fetching users:', error.message);
        console.log('💡 Make sure the backend server is running on http://localhost:5000');
    }
};

getUserIds();