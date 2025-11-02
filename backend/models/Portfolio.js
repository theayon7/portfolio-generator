// backend/models/Portfolio.js

const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    fullName: String, contact: String, bio: String, photoUrl: String, 
    skills: [String],
    academic: [{ institute: String, degree: String, year: String }],
    workExperience: [{ companyName: String, duration: String, responsibilities: [String] }],
    projects: [String]
});

const Portfolio = mongoose.model('portfolio', portfolioSchema);
module.exports = Portfolio;