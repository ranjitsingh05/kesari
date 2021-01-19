const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
    booking_time: {type: Date, required: true},
    group: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Group',
        required: true
    },
    user: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User',
        required: true
    },
    booking_type: {
        type: String,
        enum : ['Ardaas','Sukhmani Sahib', 'Akhand Paath', 'Others'],
        default: 'Ardaas',
        required: true
    },
    description: {type: String, maxlength: 200, minlength: 10, required: true},
    confirmed: Boolean,
    booking_organizer: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User'
    }
}, { timestamps: true })

module.exports = mongoose.model("Booking", bookingSchema);