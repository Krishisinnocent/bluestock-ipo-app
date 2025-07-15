const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const Subscription = require('../models/Subscription');
const IPO = require('../models/IPO');
const Transaction = require('../models/Transaction');
const {body, validationResult} = require('express-validator');

// Get user's subscriptions
router.get('/my', auth(), async(req, res)=> {
    try{
        const subscriptions = await Subscription.findByUser(req.user.user_id);
        res.json(subscriptions);
    } catch (err){
        res.status(500).json({err: err.message});
    }
});

// Apply for IPO
router.post('/', [
    auth(),
    body('ipo_id').isInt(),
    body('lot_size').isInt({min: 1})
], async(req, res)=> {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }
    try{
        const ipo = await IPO.findById(req.body.ipo_id);
        if(!ipo || ipo.status !== 'open'){
            return res.status(400).json({error: 'IPO is not available for subscription'});
        }
        const subscription = await Subscription.create({
            user_id: req.user.user_id,
            ipo_id: req.body.ipo_id,
            lot_size: req.body.lot_size
        });
        res.status(201).json(subscription);
    } catch(err){
        res.status(400).json({ error: error.message });
    }
});

// Get subscription for an IPO(Admin only)
router.get('/ipo/:ipoId', auth(['admin']), async(req, res)=> {
    try{
        const subscriptions = await Subscription.findByIpo(req.params.ipoId);
        res.json(subscriptions);
    } catch(err){
        res.status(500).json({err: err.message});
    }
});

// Update subscription status(Admin only)
router.patch('/:id/status', [
    auth(['admin']),
    body('status').isIn(['approved', 'rejected', 'refunded'])
], async(req, res)=> {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }
    try{
        const subscription = await Subscription.updateStatus(
            req.params.id,
            req.body.status
        );

        // Update transaction status if approved/rejected
        if(['approved', 'rejected'].includes(req.body.status)){
            const transaction = await Transaction.findBySubscription(req.params.id);
            if(transaction){
                await Transaction.updateStatus(
                    transaction.transaction_id,
                    req.body.status === 'approved' ? 'success' : 'failed'
                );
            }
        }
        res.json(subscription);
    } catch(err){
        res.status(400).json({err: err.message});
    }
});

module.exports = router;