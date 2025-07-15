const express = require('express');
const router = express.Router();
const {body, validationResult} = require('express-validator');
const User = require('../models/User')
const auth = require('../middlewares/auth');

// Register
router.post('/register', [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({min: 6}).withMessage('Password must be at least 6 characters')
], async(req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }
    try{
        const user = await User.create(req.body);
        const token = User.generateAuthToken(user);
        res.status(201).json({user, token});
    } catch(error){
        res.status(400).json({error: error.message});
    }
});

// Login
router.post('/login', [
    body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async(req, res)=> {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }
    try{
        const {email, password} = req.body;
        const isvalidPassword = await User.comparePassword(email, password);

        if(!isvalidPassword){
            throw new Error('Invalid credentials');
        }

        const user = await User.findByEmail(email);
        const token = User.generateAuthToken(user);
        res.json({user, token});
    } catch(error){
         res.status(400).json({ error: error.message });
    }
});

//Get current user
router.get('/me', auth(), async(req, res)=> {
    res.json(req.user);
});

module.exports = router