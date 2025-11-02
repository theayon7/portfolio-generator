const { Router } = require('express');
const jwt = require('jsonwebtoken'); // Need for authentication tokens
const User = require('../models/user'); // Ensure this is 'user' or 'User' based on your filename

const router = Router();

// A simple function to create a JSON Web Token (JWT)
// This token is the user's "proof" of login
const maxAge = 3 * 24 * 60 * 60; // Token expiry time: 3 days (in seconds)
const createToken = (id) => {
    // !! IMPORTANT: Replace 'YOUR_SECRET_KEY' with a long, random, secret string.
    // This is the key that signs your tokens and MUST be kept secret.
    return jwt.sign({ id }, 'YOUR_SECRET_KEY', {
        expiresIn: maxAge
    });
};


// --- REGISTRATION ROUTE (Working) ---
router.post('/register', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.create({ email, password });
        
        // 1. Create a token for the new user immediately upon successful registration
        const token = createToken(user._id);

        // 2. Respond with the token (the client saves this to prove they are logged in)
        res.status(201).json({ 
            user: user._id, 
            token: token,
            message: 'Registration successful and logged in' 
        });
        
    } catch (err) {
        // Handle Duplicate Email Error (Lab 4, Task 1, point 3)
        if (err.code === 11000) {
            return res.status(400).json({ error: 'Email already in use. Please use a different email address.' });
        }
        
        // Handle other validation errors (like short password)
        res.status(400).json({ error: 'Could not create user. Please check your data.' });
    }
});


router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Use the static method defined in the user model to authenticate
        const user = await User.login(email, password);
        
        // Create the JWT token upon successful login
        const token = createToken(user._id);

        // Respond with the token and success status (Status 200 OK)
        res.status(200).json({ 
            user: user._id, 
            token: token,
            message: 'Login successful' 
        });

    } catch (err) {
        // This handles Lab 4, Task 1, point 4: Alert for wrong credentials
        let errorMessage = 'Invalid email or password. Please check your credentials.';
        res.status(400).json({ error: errorMessage });
    }
});


module.exports = router;