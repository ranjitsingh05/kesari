const express = require('express');
const GroupModel = require('../models/Group');
const mongoose = require('mongoose');
const {check, validationResult} = require('express-validator');
const comments_router = express.Router({mergeParams: true});
const verifyToken = require('./verifyToken');
const comment_controller = require('../controllers/comment_controller');

const validate_comment = [
    check('comment')
      .isLength({ min: 10, max: 200})
      .withMessage('Comment must be between 5 to 20 chars'),
    check('user')
      .exists()
      .withMessage('User is required')     
]

// Get all comments under event
comments_router.get('/', comment_controller.comments_get);

// Post new comments under event
comments_router.post('/', verifyToken, validate_comment, comment_controller.comment_create);

// Delete a comment
comments_router.delete('/:commentid', comment_controller.comment_delete);

module.exports = comments_router;