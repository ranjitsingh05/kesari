const {validationResult} = require('express-validator');
const Group = require('../models/Group');

exports.events_get = async (req,res) => {
    const group_id = req.params.groupid;
    try {
        Group.findById(group_id)
          .then( group => {
              return res.send(group.events)
            })
          .catch( err => res.status(400).send("Error occured, please try again later"))
    }
    catch (err) {
        res.status(404).send({message:"Group doesn't exists"})
    }
};

exports.event_get = async (req,res) => {
    const group_id = req.params.groupid;
    const event_id = req.params.eventid
    try {
       
        Group.findById(group_id)
          .then( group => { 
              mongoose.Types.ObjectId(event_id)
              const event = group.events.find( e => e._id == event_id);
              return res.send(event);
            })
          .catch( err => res.status(400).send("Error occured, please try again later--"))
    }
    catch (err) {
        res.status(404).send({message:"Event doesn't exists"})
    }
};