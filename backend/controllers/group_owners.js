const express = require('express');
const mongoose = require('mongoose');
const { check, validationResult} = require('express-validator')
const group_owners = express.Router({mergeParams: true});
const Group = require('../models/Group')

const validate = [
    check('_id')
      .exists()
      .withMessage('User _id is required')
]

// Get all onwers of Group
group_owners.get('/', async (req,res) => {
    const group_id = req.params.groupid;
    
    await Group.findById(group_id, {owners: 1})
      .then( group => {
          if(group) {
              return res.status(200).json({message: "List of owners", data: group.owners});
              console.log(group_owners);
          } else {
              return res.status(404).json({error: "Group not found"})
          }
      })
      .catch( err => console.log(err))
})

// Add user to owner list of Group
group_owners.post('/', validate, async (req,res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).send(errors["errors"][0].msg)
    }

    const group_id = req.params.groupid;
    await Group.findById(group_id, {owners: 1})
      .then( async group => {
          if(group) {
              // Check if user is already in onwer list
              const group_owners = group.owners;
              const user_exists = group_owners.filter( item => item == req.body._id);
              if(user_exists.length > 0) {
                  return res.status(200).json({message: "User already in owner list"})
              } else {
                  group.owners.push(req.body._id);
                  await group.save()
                    .then( doc => res.status(200).json({message: "User added to owners list"}))
                    .catch( err => res.status(422).json({error: "Please try again"}))
              }
          } else {
              return res.status(404).json({message: "Group not found"})
          }
      })
      .catch( err => res.status(422).json({error: "Please try again"}))
})

// Remove user from onwers list
group_owners.delete('/', validate, async (req,res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).send(errors["errors"][0].msg)
    }

    const group_id = req.params.groupid;
    await Group.findById(group_id, {owners: 1})
      .then( async group => {
          if(group) {
              const group_owners = group.owners;
              // Check if user exists or not in owners list
              const user_exists = group_owners.filter( item => item == req.body._id)
              if(user_exists.length > 0) {
                  group.owners.pull(req.body._id);
                  await group.save()
                    .then( doc => res.status(200).json({message: "User moved from owners list"}))
                    .catch( err => res.status(422).json({error: "Please try again"}))
              } else {
                  return res.status(422).json({message: "User doesnt exists in user list, nothing to do"})
              }
          } else {
              return res.status(404).json({message: "Group not found"})
          }
      })
      .catch( err => console.log(err))
})

module.exports = group_owners;