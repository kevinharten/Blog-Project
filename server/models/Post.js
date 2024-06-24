const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema for Post
const PostSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

// Check if the model already exists before defining it
const Post = mongoose.models.Post || mongoose.model('Post', PostSchema);

module.exports = Post;
