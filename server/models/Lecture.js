const mongoose = require('mongoose');

const lectureSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    slug: {
        type: String,
        required: true,
        lowercase: true
    },
    content: {
        type: String, 
    },
    file: {
        type: String, 
    }
   
}, { timestamps: true });

module.exports = mongoose.model('Lecture', lectureSchema);
