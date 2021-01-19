const express = require('express');
const booking_router = express.Router();
const Booking = require('../models/Booking');
const {check} = require('express-validator')
const booking_controller = require('../controllers/booking_controller');

const validate_post = [
      check('booking_time')
        .exists()
        .custom( (value, {req}) => {
            const dt = new Date(value);
            const now_dt = new Date();

            if (dt <= now_dt) {
                throw new Error ("Booking time start date must be future date")
            }
            return true;
        }),
    check('group')
      .exists()
      .withMessage('Group is required for booking'),
    check('user')
      .exists()
      .withMessage('User is required'),
    check('booking_type')
      .exists()
      .withMessage('Booking type is required'),      
    check('description')
      .isLength({min:10, max:200})
      .withMessage('Description must be between 10 and 200 chars')
]

const validate_get = [
    check('user')
      .exists()
      .withMessage('User is required'),
]

booking_router.get('/', validate_get, booking_controller.booking_get);
booking_router.post('/', validate_post, booking_controller.booking_post);
booking_router.delete('/', booking_controller.booking_delete);

module.exports = booking_router;