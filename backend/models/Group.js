const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const EventSchema = require('./Event');

const GroupSchema = new Schema({
    name: {type: String, required: [true, 'Name is required']},
    description: {type: String, minlength: [10, 'Min length of description is 10'], maxlength: [200,'Max length of description is 200']},
    location: String,
    image: String,
    owners: [{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User'
    }],
    subscribers: [{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User'
    }],
    organizers: [{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User'
    }], 
    events: [EventSchema]
}, { timestamps: true })

module.exports = mongoose.model("Group", GroupSchema);