const express = require('express');
const mongoose = require('mongoose');
const { check, validationResult} = require('express-validator')
const userRouter = express.Router();
const User = require('../models/User');

const validate = [
    check('_id')
      .exists()
      .withMessage('User _id is required')
]

// Get all users
userRouter.get('/', async (req,res) => {
    await User.find({}, {name:1, email: 1})
      .then( user => {
          if(user) {
            res.send({message: "All users", data: user})
          } else {
            res.status(404).send({error: "User not found"})
          }
          
        })
      .catch( err => console.log(err))
});

// Get single user
userRouter.get('/:userid', async (req,res) => {
    user_id = req.params.userid;

    await User.findById(user_id, {name:1, email: 1})
      .then( user => res.send(user))
      .catch( err => console.log(err))
})

// Get user followers list
userRouter.get('/:userid/followers', async (req,res) => {
    user_id = req.params.userid;

    await User.findById(user_id, {followers: 1})
      .then( user => res.send(user))
      .catch( err => console.log(err))
})

// Is user in followers list?
userRouter.get('/:userid/followers/exists', validate, async (req,res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).send(errors["errors"][0].msg)
    }
    
    user_id = req.params.userid;

    await User.findById(user_id, {followers: 1})
      .then( user => {
          if(user) {
              const followers_list = user.followers;
              if(followers_list.length > 0) {
                  const user_exists = followers_list.filter( item => item._id == req.body._id)
                  if(user_exists) {
                      return res.status(200).json({messages: "User is in followers list"})
                  } else {
                      return res.status(200).json({messages: "User not in followers list"})
                  }
              } else {
                return res.status(200).json({messages: "Followers list is already empty"})
              }
          }
        })
      .catch( err => console.log(err))
})

// Add requested user to follower list of target user, and also add target user to following list of requested user
// TODO:DONE add user to follower list will add duplicate and also to requested user following list
userRouter.post('/:userid/follow', validate, async (req,res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).send(errors["errors"][0].msg)
    }

    user_id = req.params.userid;

    mongoose.Types.ObjectId(req.body._id)
    await User.findById({_id: user_id}, {followers: 1})
      .then( async user => {
          if(user) {
              // Check if user is already in follower list
              const followers_list = user.followers
              if(followers_list.length > 0) {
                  const user_exists = followers_list.filter(item => item._id == req.body._id)
                  if(user_exists) {
                    return res.status(422).json({error: "User already in followers list"})
                  }
              }
              // add to followers list for user in params
            user.followers.push(req.body._id);
            await user.save()
              .then( async user => {
                  // User got saved in followers list, now we need to add to following list of follower
                  await User.findById(req.body._id)
                    .then( async follower_user => {
                        if(follower_user) {
                            // If follower user exists then push it
                            const following_user = follower_user.following;
                            if(following_user.length > 0) {
                                const following_user_exists = following_user.filter( item => item._id == user._id);
                                if(following_user_exists) {
                                    return res.status(200).json({message: "User added to follower list, but Requested user following list already have target user"})
                                }
                            }
                            follower_user.following.push(user._id);
                            await follower_user.save()
                              .then( u => res.status(200).json({message: "User added to follower list"}))
                              .catch( err => console.log(err))
                        } else {
                            // Otherwise fail on finding requested user
                            return res.status(404).json({error: "error finding follower user"})
                        }
                    })
                    .catch( err => console.log(err))
                //   res.status(200).json({message: "User added to follower list"});
                })
              .catch( err => console.log(err))

          } else {
            return res.send(404).json({error: "User not found to be added to follower list"})
          }
      })
      .catch( err => console.log(err))

    
    // res.send("add user to followers")
})

// Get user following list
userRouter.get('/:userid/following', async (req,res) => {
    const user_id = req.params.userid;

    await User.findById(user_id, {following: 1})
      .then( user => res.send(user))
      .catch( err => console.log(err))
})

// TODO: DONE Remove requested user from follower list of target user
// TODO: DONE updated requested user following list
userRouter.post('/:userid/unfollow', validate, async (req,res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).send(errors["errors"][0].msg)
    }

    const user_id = req.params.userid;
    const follower_id = req.body._id;

    await User.findById({_id: user_id},{followers: 1})
      .then( async user => {
          if(user) {
              const user_followers =  user.followers;
              if(user_followers.length < 1) {
                  return res.status(422).json({error: "User followers list is already empty"})
                }
             else {
                  const user_exists = user_followers.filter( item => item._id == follower_id)
                  if(!user_exists) {
                      return res.status(422).json({error: "User already not in followers list"})
                    }
             }
              user.followers.pull(follower_id);
              await user.save()
                .then( async saved_user => {
                    if(saved_user) {
                        await User.findById({_id: req.body._id},{following: 1})
                          .then( async follower_user => {
                              if(!follower_user) {
                                  return res.status(404).json({error: "Requested user not found"})
                              }
                              const following_users_list = follower_user.following;
                              if(following_users_list.length < 1){
                                  return res.status(200).json({message: "User unfollowed, but following list of requested user is already empty"})
                              }
                              // check if user is already pulled?
                              follower_user.following.pull(user_id);

                              await follower_user.save()
                                .then( u => res.status(200).json({message: "User unfollowed, and also removed target user from request user following list"}))
                                .catch( err => console.log(err))
                            })
                          .catch( err => console.log(err))
                    }
                })
                .catch( err => console.log(err))
          }
        })
      .catch( err => console.log(err))
});

module.exports = userRouter;