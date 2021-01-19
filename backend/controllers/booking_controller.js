const {validationResult} = require('express-validator');
const Booking = require('../models/Booking');

// Get booking of a user
exports.booking_get = async (req,res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).send(errors["errors"][0].msg)
    }

    const user = req.body.user;
    await Booking.find({user})
      .then( booking => {
          if(booking) {
              return res.status(200).json(booking)
          } else {
              return res.status(404).json({error: "User doesn't exists"})
          }
      })
      .catch( err => console.log(err))

};

// Create new booking for a user 
exports.booking_post = async (req,res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).send(errors["errors"][0].msg)
    }
    const {user, group, booking_time, description, booking_type, confirmed} = req.body

    const booking = new Booking({
        user,
        group,
        booking_time,
        description,
        booking_type,
        confirmed
    })
    await booking.save()
      .then( booking => res.status(200).json(booking))
      .catch( err => res.status(422).json({error: "Error occured",message: err.message}))
}


// Delete a booking
exports.booking_delete = async (req,res) => {
    const booking_id = req.body._id;

    await Booking.findByIdAndDelete(booking_id)
      .then(booking => {
          if(booking) {
              return res.status(200).json({message: "Booking deleted", data: booking})
          } else {
              return res.status(404).json({errors: "Booking not found"})
          }
        })
      .catch( err => console.log(err))
}