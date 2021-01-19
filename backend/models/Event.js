const mongoose = require('mongoose');
const CommentSchema = require('./Comment');
const Schema = mongoose.Schema;

const EventSchema = new Schema({
    title: {type: String, required: [true, 'Title name is required']},
    description: {type: String, minlength: [10, 'Min length of description is 10'], maxlength: [200,'Max length of description is 200']},
    user: { 
            type: Schema.ObjectId, 
            ref: 'User',
            required: [true, 'User is required'] 
        },
    image: String,
    event_start_date: {type: Date, required: [true, 'Event date is required'] },
    event_end_date: Date,
    comments: [CommentSchema]
}, { timestamps: true })

module.exports = EventSchema;