const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = (roles = []) =>{
    return async(req, res, next)=> {
        try{
            // Get token from header
            const token = req.header('Authorization')?.replace('Bearer', '');

            if(!token){
                throw new Error('Authentication required');
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.userId);

            if(!user){
                throw new Error('User not found');
            }

            //Check role if specified
            if(roles.length && !roles.includes(user.role)){
                throw new Error('Unauthorized access');
            }
            req.user = user;
            req.token = token;
            next();
        } catch(error){
            res.status(401).json({ error: error.message });
        }
    }
}