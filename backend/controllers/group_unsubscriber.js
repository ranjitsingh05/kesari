const express = require('express');
const { check, validationResult} = require('express-validator')
const group_unsubscriber = express.Router({mergeParams: true});
const Group = require('../models/Group')

const validate = [
    check('_id')
      .exists()
      .withMessage('User _id is required')
]

// Remove user from subscribers list
group_unsubscriber.post('/', validate, async (req,res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).send(errors["errors"][0].msg)
    }

    const group_id = req.params.groupid;
    await Group.findById(group_id, {subscribers: 1})
      .then( async group => {
          if(group) {
              const subscribers = group.subscribers;
              // Check if user exists before pulling
              const user_exists = subscribers.filter( item => item == req.body._id);
              if(user_exists.length > 0) {
                  group.subscribers.pull(req.body._id)
                  await group.save()
                    .then( doc => res.status(200).json({message: "User unsusbcribed"}))
                    .catch( err => res.status(422).json({error: "Please try again later"})) 
              } else {
                  return res.status(200).json({message: "User is already unsuscribed"})
              }
          } else {
              return res.status(404).json({error: "Group dosn't exists"})
          }
      })
      .catch( err => console.log(err))
})
module.exports = group_unsubscriber;