const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const GATEWAY_URL = 'http://127.0.0.1:3000/api';

async function run() {
    console.log('Script started...');
    try {
        console.log('1. Getting users...');
        const usersRes = await axios.get(`${GATEWAY_URL}/users`);
        console.log('Users found count:', usersRes.data.length);
        console.log('All Users:', JSON.stringify(usersRes.data, null, 2));
        
        // Find existing test user to reuse
        let user = usersRes.data.find(u => u.name === 'Face User' || u.name === 'Direct Test' || u.email.includes('faceuser'));
        let testEmail = '';

        if (!user) {
            // Create a new user for testing to avoid conflicts
            const timestamp = Date.now();
            const randomInfo = Math.floor(Math.random() * 10000);
            testEmail = `faceuser_${timestamp}_${randomInfo}@test.com`;
            
            console.log(`Creating new user: ${testEmail}...`);
            try {
                const createRes = await axios.post(`${GATEWAY_URL}/users`, {
                    email: testEmail,
                    password: 'password123',
                    name: 'Face User'
                });
                
                if (createRes.data.error || createRes.data.statusCode >= 400) {
                     console.warn('API returned error, checking if user created anyway...');
                } else {
                     console.log('User created:', createRes.data);
                     user = createRes.data;
                }
            } catch (createErr) {
                console.error('Failed to create user request:', createErr.response?.data || createErr.message || createErr);
            }

            // Wait a bit for eventual consistency
            await new Promise(r => setTimeout(r, 2000));

            if (!user) {
                console.log('Re-fetching users list to find created user...');
                const usersResRetry = await axios.get(`${GATEWAY_URL}/users`);
                user = usersResRetry.data.find(u => u.email === testEmail);
            }
        }

        if (!user) {
             console.error('CRITICAL: User creation failed/not found and no existing user available.');
             return;
        }

        console.log(`Found/Created user: ${user.name} (${user.id})`);

        console.log('2. Registering face...');
        const form = new FormData();
        form.append('file', fs.createReadStream('test-face.jpg'));
        
        try {
            const registerRes = await axios.post(
                `${GATEWAY_URL}/users/${user.id}/register-face`,
                form,
                { headers: { ...form.getHeaders() } }
            );
            console.log('Registration success:', registerRes.data);
        } catch (regErr) {
            console.error('Registration failed:', regErr.response?.data || regErr.message);
            if (regErr.response) {
                console.error('Status:', regErr.response.status);
            }
            throw new Error('Registration failed, stopping verification.');
        }

        console.log('3. Verifying face...');
        const verifyForm = new FormData();
        verifyForm.append('file', fs.createReadStream('test-face.jpg'));
        
        try {
            const verifyRes = await axios.post(
                `${GATEWAY_URL}/users/verify-face`,
                verifyForm,
                { headers: { ...verifyForm.getHeaders() } }
            );
            console.log('Verification result:', verifyRes.data);
        } catch (verifyErr) {
             console.error('Verification failed:', verifyErr.response?.data || verifyErr.message);
        }

    } catch (error) {
        console.log('FULL ERROR:', error);
        console.error('Error Message:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
    }
}

run();
