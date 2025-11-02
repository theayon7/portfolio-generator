// backend/models/User.js

const mongoose = require('mongoose');
const { isEmail } = require('validator'); 
const bcrypt = require('bcrypt'); 




const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Please enter an email'],
        unique: true, 
        lowercase: true,
        validate: [isEmail, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Please enter a password'],
        minlength: [6, 'Minimum password length is 6 characters']
    }
});


userSchema.pre('save', async function (next) {
    // Generate a salt (random string)
    const salt = await bcrypt.genSalt();
    // Hash the password using the salt
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// backend/models/user.js (Add this part)

userSchema.statics.login = async function(email, password) {
    const user = await this.findOne({ email });
    
    if (user) {
        const auth = await bcrypt.compare(password, user.password);
        
        if (auth) {
            return user;
        }
        throw Error('Incorrect password'); 
    }
    throw Error('Incorrect email');
};



const User = mongoose.model('user', userSchema);

module.exports = User;