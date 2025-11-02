// backend/server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); 
const authRoutes = require('./routes/authRoutes');
const portfolioRoutes = require('./routes/portfolioRoutes');

const app = express();

// --- MIDDLEWARE ---
app.use(express.json()); 
app.use(cors()); 
// --- END MIDDLEWARE ---


const dbURI = 'mongodb+srv://ayonarpon7_db_user:s7ljHHpm1CROfoh6@cluster0.kqdsrf6.mongodb.net/?appName=Cluster0';


// --- ROUTER INTEGRATION (Must be after middleware) ---
app.use(authRoutes);
app.use(portfolioRoutes);


app.get('/', (req, res) => {
    // Test route to ensure server is running
    res.send('Server is running and connected to DB.');
});


// --- CONNECTION BLOCK ---
mongoose.connect(dbURI)
  .then((result) => {
    console.log('--- Connected to MongoDB! ---');

    // CHANGE: Server starts listening on port 8080
    app.listen(8080, () => { 
      console.log('Server is listening on port 8080'); // Reflect the change
    });
  })
  .catch((err) => {
    console.error('Database connection error:', err);
  });