const express = require('express');
const {check, validationResult} = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const router = express.Router();

const User = require('../models/User');

const validate = [
    check('name')
        .isLength({min: 2})
        .withMessage('Your full name is required'),
    check('email')
        .isEmail()
        .withMessage('Please provide a valid email'),
    check('password')
        .isLength({min: 6})
        .withMessage('Password must be at least six characters')
]

const loginValidation = [
    check('email')
        .isEmail()
        .withMessage('Please provide a valid email'),
    check('password')
        .isLength({min: 6})
        .withMessage('Password must be at least six characters')
]

router.post('/register', validate, async (req, res) => {

    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    const userExist = await User.findOne({email: req.body.email});
    if (userExist) return res.status(400).send('Email already exists');

    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(req.body.password, salt )

    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashPassword
    })

    try {
        const savedUser = await user.save();
        res.send({id: savedUser._id, name: savedUser.name, email: savedUser.email});
    } catch (error) {
        res.status(400).send(error);
    }
})

router.post('/login', loginValidation, async (req, res) => {

    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    
    // check if email exist
    const user = await User.findOne({email: req.body.email})
    if(!user) return res.status(404).send('User is not registered')

    // check if password is correct
    const validPassword = await bcrypt.compare(req.body.password, user.password)
    if(!validPassword) return res.status(404).send('Invalid Email or Password')

    // create and assign a token
    const token = jwt.sign({_id: user._id, email: user.email}, 'SUPERSECRET123')
    res.header('auth-token', token).send({message: 'Logged in successfully', token})
})

module.exports = router;