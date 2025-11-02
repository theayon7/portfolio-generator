// backend/middleware/authMiddleware.js

const jwt = require('jsonwebtoken');

const requireAuth = (req, res, next) => {
    const token = req.headers.authorization ? req.headers.authorization.split(' ')[1] : null;

    if (token) {
        jwt.verify(token, 'YOUR_SECRET_KEY', (err, decodedToken) => {
            if (err) { return res.status(401).json({ error: 'Not authorized, token failed' }); }
            req.user_id = decodedToken.id; 
            next(); 
        });
    } else {
        res.status(401).json({ error: 'Not authorized, no token' });
    }
};

module.exports = { requireAuth };