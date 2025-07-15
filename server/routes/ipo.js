const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const IPO = require('../models/IPO');
const {body, validationResult} = require('express-validator');

// Get all IPOs
router.get('/', auth(), async(req, res)=> {
    try{
        const ipos = await IPO.findAll();
        res.json(ipos);
    } catch(err){
        res.status(500).json({err: err.message});
    }
});

// Get single IPO
router.get('/:id', auth(), async(req, res)=> {
    try{
        const ipo = await IPO.findById(req.params.id);
        if(!ipo){
            return res.status(404).json({error: 'IPO not found'});
        }
        res.json(ipo);
    } catch(err){
        res.status(500).json({ error: error.message });
    }
});

// Create IPO (Admin only)
router.post('/', [
    auth(['admin']),
    body('company_name').notEmpty(),
    body('symbol').notEmpty(),
    body('price_range').isNumeric(),
    body('open_date').isDate(),
    body('close_date').isDate(),
    body('min_investment').isNumeric()
], async(req, res)=> {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }
    try{
        const ipo = await IPO.create(req.body);
        res.status(201).json(ipo);
    } catch(err){
        res.status(400).json({ error: error.message });
    }
});

// Update IPO (Admin only)
router.put('/:id', auth(['admin']), async(req, res)=> {
    try{
        const ipo = await IPO.update(req.params.id, req.body);
         if (!ipo) {
         return res.status(404).json({ error: 'IPO not found' });
        }
        res.json(ipo);
    } catch(err){
          res.status(400).json({ error: error.message });
    }
});

router.delete('/:id', auth(['admin']), async(req, res)=> {
    try{
        const ipo = await IPO.delete(req.params.id);
        if(!ipo){
            return res.status(404).json({ error: 'IPO not found' });
        }
        res.json({message: 'IPO deleted successfully'});
    } catch(err){
        res.status(500).json({err: err.message});
    }
});

module.exports = router;