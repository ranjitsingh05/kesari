const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    comment: {type: String, required: [true, 'Comment is required'], minlength: [10, 'Min length of comment is 10'], maxlength: [200,'Max length of comment is 200']},
    user: {type: String, required: [true, 'User is required']}
}, { timestamps: true })

module.exports = CommentSchema;