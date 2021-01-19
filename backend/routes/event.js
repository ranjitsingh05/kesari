const express = require('express');
const comments_router = require('./comment');
const events_router = express.Router({mergeParams: true});
const GroupModel = require('../models/Group');
const mongoose = require('mongoose');
const {check, validationResult} = require('express-validator');
const event_controller = require('../controllers/event_controller');

// TODO:DONE add user to validation
const validate_event = [
    check('title')
      .isLength({ min: 5, max: 20})
      .withMessage('Title must be between 5 to 20 chars.'),
    check('description')
      .isLength({min:10, max:200})
      .withMessage('Description must be between 10 and 200 chars'),
    check('user')
      .exists()
      .withMessage('user_id is required for the event'),
    check('event_start_date')
      .custom( (value, {req}) => {
          const dt = new Date(value);
          const now_dt = new Date();

          if (dt <= now_dt) {
              throw new Error ("Event start date must be future date")
          }
          return true;
      }),
    check('events.event_end_date')
      .optional()
      .custom( (value, {req}) => {
          if (new Date(value) <= new Date(req.body.event_start_date)) {
              throw new Error ("Event end date must be after start date")
          }
          return true
      })
      .custom( (value, {req}) => {
          const dt = new Date(value)
          const date = new Date();
          const f_dt = date.setDate(date.getDate() + 7);
          const future_dt = new Date(f_dt);

          if (dt > future_dt) {
              throw new Error ("Event end date must end in 7 days")
          }
          return true
      })      
]

events_router.use('/:eventid/comments', comments_router);

// Get all Events under group
events_router.get('/', event_controller.events_get);

// Get Single event under group
events_router.get('/:eventid', event_controller.event_get);

// Post Event under group 
// TODO:DONE if user is in owner or ogranizer list only then create the event
events_router.post('/', validate_event, async (req,res) => {
    const { title } = req.body;
    const event = req.body;
    const group_id = req.params.groupid;
    
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(422).send(errors["errors"][0].msg)
    }
    try {
        mongoose.Types.ObjectId(group_id)
        await GroupModel.findById(group_id)
          .then( async group => {
              if(group) {
                  const organizers_list = group.organizers;
                  
                  if(organizers_list.length > 0) {
                      const is_user_organizer = organizers_list.filter( item => item._id == req.body.user);
                      if(is_user_organizer.length > 0) {
                          const existing_events = group.events;
                          const is_event_exists = existing_events.filter( item => item.title == title)
                          if(is_event_exists.length < 1) {
                              console.log("Creating event")
                              group.events.push(event);
                              await group.save()
                                .then( doc => res.status(200).json({message: "Event created successfully"}))
                                .catch( err => res.status(422).json({error: "Error creating event, try again", data: err}))
                          } else {
                              return res.status(422).json({error: "Event already exists, not creating duplicate"})
                          }
                          
                      } else {
                          return res.status(422).json({error: "User not in organizers list, not creating event"})
                      }
                  } else {
                      return res.status(404).json({error: "Orgnizers list is empty, hence not creating group"})
                  }

              } else {
                  return res.status(404).json({error: "Group not found"})
              }
          })
          .catch( err => console.log(err))
        // await GroupModel.updateOne(
        //     // TODO:DONE check if user is in organizer or owner list before creating the event
        //     { _id: group_id, 'events.title': { $ne: title}},
        //     { $push: { events: event}}   
        //  )
        //   .then( async (doc) => {
        //       if (doc.nModified < 1) {
        //           return res.status(404).send({message: "Didnt find group to create event"})
        //       }
        //       return res.send({message: "Event created successfully"})
        //     })
        //   .catch( err => res.status(440).send("Error creating event"))
    }
    catch (err) {
        res.status(404).send({message:"Cannot insert the event"})
    }
});

// Update Event under group 
// TODO: user who created the event should only update, no one else
events_router.put('/:eventid', validate_event, async (req, res) => {
    // const {title, description, user, event_start_date} = req.body;
    const group_id = req.params.groupid;
    const event_id = req.params.eventid;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).send(errors["errors"][0].msg)
    }
 
    try {
        mongoose.Types.ObjectId(group_id)
        mongoose.Types.ObjectId(event_id)
        await GroupModel.updateOne(
            { _id: group_id, 'events._id': event_id},
            {$pull : {events: {_id: event_id}}}
        )
        .then( async (doc) => {
            console.log(doc)
            if (doc.nModified > 0) {
                await GroupModel.updateOne(
                    {_id: group_id},
                    { $addToSet: {events: req.body}}
                )
                    .then(doc => res.send("Event updated successfully"))
                }
                else{
                    return res.status(404).send({message:"Event not found, could not be updated"})
                }
            })
        .catch( err => res.status(422).json({message: "Cannot find Event to update", err}))

    } catch (error) {
        console.log(error)
        return res.send("Error updating Event")
    }

});


module.exports = events_router;