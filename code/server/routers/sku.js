'use strict';
const express = require('express');
const { Warehouse } = require('../src/controllers/Warehouse');
const HTTPError = require("../src/controllers/HTTPError");
const {callCtrlCheckErr} = require("../callCtrlCheckErr");
const {  validationResult, body, param } = require('express-validator');
const router = express.Router();

const wh = Warehouse.getInstance();
const SKUCtrl = wh.SKUCtrl;

//GET /api/skus
router.get('', async (req, res) => {
    // checks
    try{
        if(!wh.hasPermissions("manager", "customer", "clerk"))
            throw HTTPError.E401("wrong permissions")
    }catch (e){
        return res.status(e.status).json(e.body);
    }

    // call controller
    let ret = await callCtrlCheckErr(SKUCtrl.getSKUs, 200, 500)

    return res.status(ret.status).json(ret.body);
})

//GET /api/skus/:id
router.get('/:id', [
    param('id').isInt({min:0}).isLength({min:0, max:12})
], async (req, res) => {
    // checks
    const errors = validationResult(req);
    try{
        if(!wh.hasPermissions("manager"))
            throw HTTPError.E401("wrong permissions")
        if (!errors.isEmpty()) 
            throw HTTPError.E422("validation of id failed")
    }catch (e){
        return res.status(e.status).json(e.body);
    }

    // call controller
    let ret = await callCtrlCheckErr(SKUCtrl.getSKUById, req.params.id, 200, 500)

    return res.status(ret.status).json(ret.body);
})

//POST /api/sku
router.post('', [
    body('description').not().isEmpty(),
    body('weight').isInt({min:0}),
    body('volume').isInt({min:0}),
    body('notes').not().isEmpty(),
    body('price').isFloat({min:0}),
    body('availableQuantity').isInt({min:0})
],async (req, res) => {
    const errors = validationResult(req);
    try{
        if(!wh.hasPermissions("manager"))
            throw HTTPError.E401("wrong permissions")

        if (!errors.isEmpty()) 
            throw HTTPError.E422("validation of id failed")

    }catch (e){
        return res.status(e.status).json(e.body);
    }

    let ret = await callCtrlCheckErr(SKUCtrl.postSKU, req.body, 201, 503)

    return res.status(ret.status).json(ret.body);
})

//PUT /api/sku/:id
router.put('/:id', [
    param('id').isInt({min:0}).isLength({min:0, max:12})
], async (req, res) => {
    let skuMod = req.body
    const errors = validationResult(req);
    try{
        if(!wh.hasPermissions("manager"))
            throw HTTPError.E401("wrong permissions")
        
        if (!errors.isEmpty()){
            if(req.params.id < 0)
                throw HTTPError.E404("SKU not existing");
            throw HTTPError.E422("invalid arguments")
        } 

        if( skuMod == undefined
            || (skuMod.newWeight != undefined && (skuMod.newWeight<0 || isNaN(skuMod.newWeight)))
            || (skuMod.newVolume != undefined && (skuMod.newVolume<0 || isNaN(skuMod.newVolume)))
            || (skuMod.newPrice != undefined && (skuMod.newPrice<0 || isNaN(skuMod.newPrice)))
            || (skuMod.newAvailableQuantity != undefined && (skuMod.newAvailableQuantity<0 || isNaN(skuMod.newAvailableQuantity))))
            throw HTTPError.E422("invalid arguments")
    }catch (e){
        return res.status(e.status).json(e.body);
    }

    let ret = await callCtrlCheckErr(SKUCtrl.putSKU, req.params.id, skuMod, 200, 503)

    return res.status(ret.status).json(ret.body);
})

//PUT /api/sku/:id/position
router.put('/:id/position', [
    param('id').isInt({min:0}).isLength({min:0, max:12}),
    body('position').isNumeric().isLength({min:12, max:12})
], async (req, res) => {
    const errors = validationResult(req);
    try{
        if(!wh.hasPermissions("manager"))
            throw HTTPError.E401("wrong permissions")

        if (!errors.isEmpty()){
            if(req.params.id < 0)
                throw HTTPError.E404("invalid id")
            throw HTTPError.E422("invalid arguments")
        }
                

    }catch (e){
        return res.status(e.status).json(e.body);
    }

    let ret = await callCtrlCheckErr(SKUCtrl.putSKUPosition, req.params.id, req.body.position, 200, 503)

    return res.status(ret.status).json(ret.body);
})

//DELETE /api/skus/:id
router.delete('/:id', [
    param('id').isInt({min:0}).isLength({min:0, max:12})
], async (req, res) => {
    const errors = validationResult(req);
    try{
        if(!wh.hasPermissions("manager"))
            throw HTTPError.E401("wrong permissions")

        if (!errors.isEmpty()) 
            throw HTTPError.E422("validation of paramiters failed")    
    }catch (e){
        console.log(e.message)
        return res.status(e.status).json(e.body);
    }

    let ret = await callCtrlCheckErr(SKUCtrl.deleteSKU, req.params.id, 204, 503)

    return res.status(ret.status).json(ret.body);
})

module.exports = router;