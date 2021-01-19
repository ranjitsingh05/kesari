const express = require('express');
const { check, validationResult} = require('express-validator')
const group_organizers = express.Router({mergeParams: true});
const Group = require('../models/Group')

const validate = [
    check('_id')
      .exists()
      .withMessage('User _id is required')
]


exports.organizers_list_get = async (req,res) => {
  const group_id = req.params.groupid;
  await Group.findById(group_id, {organizers: 1})
    .then( group => {
      if(group.organizers.length > 0) {
        return res.status(200).json(group.organizers)
      } else {
        return res.status(200).json({message: "Organizers list is empty"})
      }
    })
    .catch( err => console.log(err))
}; 

exports.organizer_create_post = async (req,res) => {
  const group_id = req.params.groupid;
  await Group.findById(group_id, {owners: 1,organizers: 1})
    .then( async group => {
      if(group) {
        // Check if request user is an owner
        const group_owners = group.owners;
        const user_is_owner = group_owners.filter( item => item == req.body._id);
        if(user_is_owner.length < 1) {
          return res.status(422).json({message: "Requested user should be part of owners list to add a new user as owner"})
        }
        group.organizers.addToSet(req.body.organizer)
        await group.save()
          .then( doc => res.status(200).json({message: "User added as to organizer list", data: doc.owners}))
          .catch( err => res.status(422).json({error: "Error occured while adding", err}))
  
      } else {
        return res.status(404).json({error: "Group not found"})
      }
    })
    .catch( err => console.log(err))
};

exports.organizers_delete = async (req,res) => {
  const group_id = req.params.groupid;
  await Group.findById(group_id, {owners: 1, organizers: 1})
    .then( async group => {
      if(group) {
        // Only allow delete if requested user is in onwers list
        const group_owners = group.owners;
        const user_is_owner = group_owners.filter( item => item == req.body._id);
        if(user_is_owner.length < 1) {
          return res.status(422).json({message: "Requested user should be part of owner to remove user from organizer list"})
        }
        // check if user alredy exists as organizer or not
        const group_organizers = group.organizers;
        const user_is_organizer = group_organizers.filter( item => item == req.body.organizer);
        if(user_is_organizer.length < 1) {
          return res.status(200).json({message: "User is already not in organizers list"})
        }
        group.organizers.pull(req.body.organizer);
        await group.save()
          .then( doc => res.status(200).json({message: "User removed from owners list"}))
          .catch( err => res.status(422).json({error: "Please try again"}))
      } else {
        return res.status(404).json({message: "Group not found"})
      }
    })
    .catch( err => console.log(err))
};