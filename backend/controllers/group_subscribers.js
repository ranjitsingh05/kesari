const express = require('express');
const { check, validationResult} = require('express-validator')
const group_subscriber = express.Router({mergeParams: true});
const Group = require('../models/Group')

const validate = [
    check('_id')
      .exists()
      .withMessage('User _id is required')
]

// Check if user is susbcribed to group
group_subscriber.get('/',validate, async (req,res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).send(errors["errors"][0].msg)
    }
    
    const group_id = req.params.groupid;
    await Group.findById(group_id, {subscribers: 1})
      .then( group => {
          if(group) {
              // Group exists, now find the subscribers
              const subscribers = group.subscribers;
              // Check if user is in the subcribers list
              if(subscribers.length > 0) {
                  const user_exists = subscribers.filter( item => item == req.body._id);
                  if(user_exists.length > 0) {
                      return res.status(200).json({message: "User is subscribed"})
                  } else {
                      return res.status(200).json({message: "User is not subscribed"})
                  }
              } else {
                  res.status(200).json({message: "User is not subcribed"})
              }
          } else {
              return res.status(404).json({error: "Group doesn't exists"})
          }
      })
      .catch( err => console.log(err))
})

// Add user to subscribers list
group_subscriber.post('/', validate, async (req,res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).send(errors["errors"][0].msg)
    }

    const group_id = req.params.groupid;

    await Group.findById(group_id, {subscribers: 1})
      .then( async group => {
          if(group) {
              const subscribers = group.subscribers;
              // if subscriber list is empty, then just add the user
              if(subscribers.length < 1) {
                  group.subscribers.push(req.body._id);
                  // save
                  await group.save()
                    .then( doc => res.status(200).json(doc))
                    .catch( err => res.status(422).json({error: "Try try again later"}))
              } else {
                  // Check if user is already in list, if not then add, otherwise say its already exists
                  const user_exists = subscribers.filter( item => item == req.body._id);
                  if(user_exists.length > 0) {
                      return res.status(200).json({message: "User already susbcribed"})
                  } else {
                    group.subscribers.push(req.body._id);
                    // save
                    await group.save()
                      .then( doc => res.status(200).json({message: "User subscribed"}))
                      .catch( err => res.status(422).json({error: "Please try again"}))
                  }
              }
          } else {
              return res.status(404).json({error: "Group doesn't exists"})
          }
        })
      .catch( err => console.log(err))
});
module.exports = group_subscriber;