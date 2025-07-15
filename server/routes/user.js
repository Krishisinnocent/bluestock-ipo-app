const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middlewares/auth');

// Get user profile
router.get('/:id', auth(), async(req, res)=> {
    try{
        if(req.user.role !== 'admin' && req.user.user_id !== parseInt(req.params.id)){
            return res.status(403).json({error: 'Unauthorized access'}); 
        }
        const user = await User.findById(req.params.id);
        if(!user){
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch(err){
        res.status(500).json({ error: error.message });
    }
});

// Update user profile
router.put('/:id', auth(), async (req, res) => {
    try{
        if(req.user.role !== 'admin' && req.user.user_id !== parseInt(req.params.id)){
            return res.status(403).json ({error: 'Unauthorized access'});
        }

        // Prevent role change for non-admin user
        if(req.user.role !== 'admin' && req.body.role){
            delete req.body.role;
        }

        const user = await User.update(req.params.id, req.body);
        res.json(user);
    } catch(err){
        res.status(400).json({ err: err.message });
    }
});

// Get all users (Admin only)
router.get('/', auth(['admin']), async (req, res) => {
    try{
        const users = await User.findAll();
        res.json(users);
    } catch(err){
        res.status(500).json({err: err.message});
    }
});

module.exports = router;