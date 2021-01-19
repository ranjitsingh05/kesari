const express = require('express');
const group_router = express.Router();
const Group = require('../models/Group');
const Booking = require('../models/Booking');
const mongoose = require('mongoose');
const {check, validationResult} = require('express-validator')
const events_router = require('./event');
const group_subscriber = require('../controllers/group_subscribers.js')
const group_unsubscriber = require('../controllers/group_unsubscriber');
const group_organizers = require('../controllers/group_organizers');
const group_owner = require('../controllers/group_owners');
const booking_router = require('./booking');

const validate_group = [
    check('name')
      .isLength({ min: 5, max: 20})
      .withMessage('Name must be between 5 to 20 chars'),
    check('description')
      .isLength({min:10, max:200})
      .withMessage('Description must be between 10 and 200 chars'),
    check('location')
      .optional(),
    check('user')
      .exists()
      .withMessage('User is required'),
    check('events')
      .optional()      
]

// Group events router
group_router.use('/:groupid/events', events_router);

// Group subscribers router
group_router.use('/:groupid/subscribe', group_subscriber);

// Group unsubscribers router
group_router.use('/:groupid/unsubscribe', group_unsubscriber);

// group_router.use('/:groupid/organizers', group_organizers);
// it uses the MVC pattern
group_router.get('/:groupid/organizers', group_organizers.organizers_list_get);
group_router.post('/:groupid/organizers', group_organizers.organizer_create_post);
group_router.delete('/:groupid/organizers', group_organizers.organizers_delete);

// Group owners router
group_router.use('/:groupid/owner', group_owner);

// Get all Groups
group_router.get('/', async (req,res) => {
    const results = await Group.find();
    res.send({message: 'Groups listings', data: results});
});

// Get Single Group
group_router.get('/:groupid', async (req,res) => {
    const group_id = req.params.groupid;
    mongoose.Types.ObjectId(group_id)
    await Group.findById(group_id)
      .then( group => {
        if(group) {
          return res.status(200).json(group)
        } else {
          return res.status(404).json({error: "Group doesn't exists"})
        }
          
      })
      .catch( err => res.status(400).send("Error occured, please try again later"))
    }
);

// Get all Booking requests made to a Group
group_router.get('/:groupid/booking', async (req,res) => {
  const group_id = req.params.groupid;

  await Booking.find({group: group_id})
    .then( bookings => {
      if(bookings) {
        return res.status(200).json(bookings)
      } else {
        return res.status(404).json({errors: "Group not found"})
      }
    })
    .catch( err => res.json(err.message))
})

// Get confirmed Booking requests for a Group
group_router.get('/:groupid/booking/confirmed', async (req,res) => {
  const group_id = req.params.groupid;
  mongoose.Types.ObjectId(group_id);
  await Booking.find({group: group_id, confirmed: true})
    .then( bookings => {
      if(bookings) {
        return res.status(200).json(bookings)
      } else {
        return res.status(404).json({errors: "Group not found"})
      }
    })
    .catch( err => res.json(err.message))
});

// Get unconfirmed Booking requests for a Group
group_router.get('/:groupid/booking/unconfirmed', async (req,res) => {
  const group_id = req.params.groupid;
  mongoose.Types.ObjectId(group_id);
  await Booking.find({group: group_id, confirmed: false})
    .then( bookings => {
      if(bookings) {
        return res.status(200).json(bookings)
      } else {
        return res.status(404).json({errors: "Group not found"})
      }
    })
    .catch( err => res.json(err.message))
});


// Post Group
group_router.post('/', validate_group, async (req,res) => {
    const {name, description, location, user} = req.body;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).send(errors["errors"][0].msg)
    }

    Group.findOne({name})
      .then( async group => {
        if(group) {
          return res.status(422).send({error: "Group already exists"})
        } else {
          const new_group = new Group({
            name,
            description,
            location,
            owners: [user]
          })
          await new_group.save()
            .then( saved_group => res.status(200).json({message: "Group created successfully", data: saved_group}))
            .catch( err => res.status(404).json({error: "Error creating group, try again"}))
        }
      })
      .catch( err => res.status(404).json({error: "Error occured, try again", data: err}))

});

// Update Group
group_router.put('/:groupid', validate_group, async (req,res) => {
    const group_id = req.params.groupid;
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        res.status(422).send(errors["errors"][0].msg)
    }

    try {
        await Group.findByIdAndUpdate(group_id,{
            name: req.body.name,
            description: req.body.description,
            location: req.body.location
            // user: req.body.user // no longer sending user
        }, {new: true})
          .then(data => res.send(data))
          .catch(err => res.status(404).send("Group could not be update, try again later"))
    }
    catch {
        res.status(400).send("Group could not be updated")
    }
    
});

// Delete Group
group_router.delete('/:groupid', async (req,res) => {
    const group_id = req.params.groupid;
    try {
        await Group.findByIdAndDelete(group_id)
          .then(data => res.send({message: 'Group delete successfully', data}))
          .catch( err => res.status(400).send({message:"Could not find Group to update"}))
    }
    catch (err) {
        console.log(err);
        res.status(400).send("Error deleting the document, try again")
    }

});

// TODO:DONE can create duplicate groups
// TODO:DONE Need to add users to Group subscriber (need a route like /group/sjfkjskf/subscribe)
// TODO:DONE Remove user from Group subscriber ( /group/sfjksjf/unfollow)
// TODO:DONE When creating a group, user should automatically also become the OWNER
// TODO:DONE Add other user to owners list (/group/skjskj/owners/), only owners should do it
// TODO:DONE Remove other user from owners list, only owners can do it
// TODO:DONE Onwer can add user to organizers list (/group/sjsjskjsk/organizers/)
// TODO:DONE Owner can remove user from organizers list



module.exports = group_router;