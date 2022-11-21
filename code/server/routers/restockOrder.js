'use strict';
const express = require('express');
const { Warehouse } = require('../src/controllers/Warehouse');
const HTTPError = require("../src/controllers/HTTPError");
const {callCtrlCheckErr} = require("../callCtrlCheckErr");
const dayjs = require("dayjs");
const router = express.Router();
const {  validationResult, body, param } = require('express-validator');

const wh = Warehouse.getInstance();
const OrdCtrl = wh.OrderCtrl;

//GET /api/restockOrders
router.get('', async (req, res) =>{
    try{
        if(!wh.hasPermissions("manager", "clerk", "qualityEmployee"))
            throw HTTPError.E401("wrong permissions")
    }catch (e) {
        console.log(e.message)
        return res.status(e.status).json(e.body);
    }

    let ret = await callCtrlCheckErr(OrdCtrl.getRestockOrders, 200, 500);

    return res.status(ret.status).json(ret.body);
})

//GET /api/restockOrders/:id
router.get('/:id',[
    param("id").isInt({min: 1})
], async (req, res) =>{
    const errors = validationResult(req);
    try{
        if(!wh.hasPermissions("manager"))
            throw HTTPError.E401("wrong permissions")

        if (!errors.isEmpty()) 
            throw HTTPError.E422("validation of id failed")
    }catch (e) {
        console.log(e.message)
        return res.status(e.status).json(e.body);
    }

    let ret = await callCtrlCheckErr(OrdCtrl.getRestockOrder, req.params.id, 200, 500);

    return res.status(ret.status).json(ret.body);
})

//GET /api/restockOrders/:id/returnItems
router.get('/:id/returnItems',[
    param("id").isInt({min: 1})
], async (req, res) =>{
    const errors = validationResult(req);
    try{
        if(!wh.hasPermissions("manager"))
            throw HTTPError.E401("wrong permissions")

        if (!errors.isEmpty()) 
            throw HTTPError.E422("validation of id failed")

    }catch (e) {
        console.log(e.message)
        return res.status(e.status).json(e.body);
    }

    let ret = await callCtrlCheckErr(OrdCtrl.getRestockOrderReturnItems, req.params.id, 200, 500);

    return res.status(ret.status).json(ret.body);
})

//POST /api/restockOrder
router.post('',[
    body("supplierId").isInt({min:1}),
    body("products.*.SKUId").isInt({min: 1}),
    body("products.*.price").isFloat({min : 0}),
    body("products.*.qty").isInt({min : 1}),
    body('products.*.itemId').isInt({ min: 0 })
], async (req, res) =>{
    const errors = validationResult(req);
    try{
        if(!wh.hasPermissions("manager", "supplier"))
            throw HTTPError.E401("wrong permissions")

        if (!errors.isEmpty()){
            console.log(errors);
            throw HTTPError.E422("validation of id failed")
        }


        if(req.body.issueDate == undefined
            || req.body.products == undefined)
            throw HTTPError.E422("undefined body fields")

        // check the date
        let date = req.body.issueDate;
        if (!(dayjs(date,["YYYY/M/DD","YYYY/M/D","YYYY/MM/D","YYYY/MM/DD","YYYY/M/DD HH:mm","YYYY/M/D HH:mm","YYYY/MM/D HH:mm","YYYY/MM/DD HH:mm","YYYY/M/DD H:mm","YYYY/M/D H:mm","YYYY/MM/D H:mm","YYYY/MM/DD H:mm","YYYY/M/DD H:m","YYYY/M/D H:m","YYYY/MM/D H:m","YYYY/MM/DD H:m","YYYY/M/DD HH:m","YYYY/M/D HH:m","YYYY/MM/D HH:m","YYYY/MM/DD HH:m"],true)).isValid()) {
            throw HTTPError.E422("Invalid Date Format");
        }

    }catch (e) {
        console.log(e.message)
        return res.status(e.status).json(e.body);
    }

    let ret = await callCtrlCheckErr(OrdCtrl.postRestockOrder, req.body, 201, 503);
    console.log(res)
    return res.status(ret.status).json(ret.body);
})

//PUT /api/restockOrder/:id
router.put('/:id',[
    param("id").isInt({min: 1})
], async (req, res) =>{
    const errors = validationResult(req);
    try{
        if(!wh.hasPermissions("manager", "clerk"))
            throw HTTPError.E401("wrong permissions")

        if (!errors.isEmpty()) 
            throw HTTPError.E422("validation of id failed")

        if(req.body.newState == undefined)
            throw HTTPError.E422("undefined params")

    }catch (e) {
        console.log(e.message)
        return res.status(e.status).json(e.body);
    }

    let ret = await callCtrlCheckErr(OrdCtrl.putRestockOrderState, req.params.id, req.body.newState, 200, 503);

    return res.status(ret.status).json(ret.body);
})

//PUT /api/restockOrder/:id/skuItems
router.put('/:id/skuItems',[
    param("id").isInt({min: 1}),
    body("skuItems.*.SKUId").isInt({min:1}).isLength({max:12}),
    body("skuItems.*.rfid").isString().isLength({min:32, max:32}),
    body("skuItems.*.itemId").isInt({ min: 0 }).isLength({ min: 0, max: 12 })
], async (req, res) =>{
    const errors = validationResult(req);
    try{
        if(!wh.hasPermissions("manager", "clerk"))
            throw HTTPError.E401("wrong permissions")

        if (!errors.isEmpty()) 
            throw HTTPError.E422("validation of id failed")

        if(req.body.skuItems == undefined)
            throw HTTPError.E422("undefined params")

    }catch (e) {
        console.log(e.message)
        return res.status(e.status).json(e.body);
    }

    let ret = await callCtrlCheckErr(OrdCtrl.putRestockOrderSKUItems, req.params.id, req.body.skuItems, 200, 503);

    return res.status(ret.status).json(ret.body);
})

//PUT /api/restockOrder/:id/transportNote
router.put('/:id/transportNote',[
    param("id").isInt({min: 1})
], async (req, res) =>{
    const errors = validationResult(req);
    try{
        if(!wh.hasPermissions("manager", "supplier"))
            throw HTTPError.E401("wrong permissions")

        if (!errors.isEmpty()) 
            throw HTTPError.E422("validation of id failed")

        if(req.body.transportNote == undefined
            || req.body.transportNote.deliveryDate == undefined)
            throw HTTPError.E422("undefined params")

        // check the date
        let date = req.body.transportNote.deliveryDate;
        if (!(dayjs(date,["YYYY/M/DD","YYYY/M/D","YYYY/MM/D","YYYY/MM/DD","YYYY/M/DD HH:mm","YYYY/M/D HH:mm","YYYY/MM/D HH:mm","YYYY/MM/DD HH:mm","YYYY/M/DD H:mm","YYYY/M/D H:mm","YYYY/MM/D H:mm","YYYY/MM/DD H:mm","YYYY/M/DD H:m","YYYY/M/D H:m","YYYY/MM/D H:m","YYYY/MM/DD H:m","YYYY/M/DD HH:m","YYYY/M/D HH:m","YYYY/MM/D HH:m","YYYY/MM/DD HH:m"],true)).isValid()) {
            throw HTTPError.E422("Invalid Date Format");
        }

    }catch (e) {
        console.log(e.message)
        return res.status(e.status).json(e.body);
    }

    let ret = await callCtrlCheckErr(OrdCtrl.putRestockOrderTranspNote, req.params.id, req.body.transportNote, 200, 503);

    return res.status(ret.status).json(ret.body);
})

//DELETE /api/restockOrder/:id
router.delete('/:id',[
    param("id").isInt({min: 1})
], async (req, res) =>{
    const errors = validationResult(req);
    try{
        if(!wh.hasPermissions("manager"))
            throw HTTPError.E401("wrong permissions")

        if (!errors.isEmpty()) 
            throw HTTPError.E422("validation of id failed")

    }catch (e) {
        console.log(e.message)
        return res.status(e.status).json(e.body);
    }

    let ret = await callCtrlCheckErr(OrdCtrl.deleteRestockOrder, req.params.id, 204, 503);

    return res.status(ret.status).json(ret.body);
})

module.exports = router;