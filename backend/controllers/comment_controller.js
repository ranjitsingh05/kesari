const {validationResult} = require('express-validator');
const Group = require('../models/Group');

exports.comments_get = async (req,res) => {
    const event_id = req.params.eventid;

    await Group.findOne(
        { 'events._id': event_id},
        'events.comments'
    )
      .then(doc => {
          if(!doc) {
              res.status(404).send({error: "Event not found"})
          } else {
              res.status(200).send(doc)
          }
      })
      .catch( err => console.log(err));    
};

exports.comment_delete = async (req, res) => {
    const group_id = req.params.groupid;
    const comment_id = req.params.commentid;
    const event_id = req.params.eventid;
    try {
        await GroupModel.updateOne(
            {'events._id': event_id, 'events.comments._id': comment_id},
            {$pull : {'events.$[].comments': {_id: comment_id}}}
        )
          .then( (doc) => {
              if (doc.nModified < 1) {
                  res.status(404).send({message: "Couldnt find comment to delete"})
              } else {
                  res.send({message: "Comment deleted successfully"})
              }
            })
          .catch( err => res.status(404).send({message: "Cannot delete comment"}))
       
        }
    catch (err) {
        console.log(err)
    }
};

exports.comment_create = async (req,res) => {
    const event_id = req.params.eventid;
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(422).send(errors["errors"][0].msg)
    }

    mongoose.Types.ObjectId(event_id);
    await GroupModel.updateOne(
        { 'events._id': event_id},
        { $push: { 'events.$.comments': req.body}}   
     )
      .then( doc => {
          console.log(doc);
          return res.send({message: "Comment created successfully"})
        })
      .catch( err => res.status(440).send({error: "Error creating comment", data: err}))

    res.send({message: 'Posted the comment'})
};