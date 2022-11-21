'use strict';
const express = require('express');
const { Warehouse } = require('../src/controllers/Warehouse');
const HTTPError = require("../src/controllers/HTTPError");
const { callCtrlCheckErr } = require("../callCtrlCheckErr");
const { validationResult, body, param } = require('express-validator');
const router = express.Router();

const wh = Warehouse.getInstance();
const TestCtrl = wh.TestCtrl;

//GET /api/TestDescriptors
router.get('', async (req, res) => {
    try{
        if(!wh.hasPermissions("manager", "quality employee"))
            throw HTTPError.E401("wrong permissions")
    }catch (e){
        return res.status(e.status).json(e.body);
    }
    let ret = await callCtrlCheckErr(TestCtrl.getTestDescriptors, 200, 500);
    return res.status(ret.status).json(ret.body);
})

//GET /api/testDescriptors/:id
router.get('/:id',[
    param('id').isInt({ min: 1 })
] ,async (req, res) => {
    const errors = validationResult(req);


    try{
        if (!errors.isEmpty())
            throw HTTPError.E422("validation of paramiters failed");
        if(!wh.hasPermissions("manager"))
            throw HTTPError.E401("wrong permissions")

        if(req.params.id == undefined)
            throw HTTPError.E422("validation of id failed")
    }catch (e){
        return res.status(e.status).json(e.body);
    }

    // call controller
    let ret = await callCtrlCheckErr(TestCtrl.getTestDescriptor, req.params.id, 200, 500)

    return res.status(ret.status).json(ret.body);
})

//POST /api/testDescriptor
router.post('',async (req, res) => {
    const errors = validationResult(req);
    try{
        if(!wh.hasPermissions("manager"))
            throw HTTPError.E401("wrong permissions")

        if(req.body.name == undefined
            || req.body.procedureDescription == undefined
            || req.body.idSKU == undefined)
            throw HTTPError.E422("Invalid args")

    }catch (e){
        return res.status(e.status).json(e.body);
    }

    let ret = await callCtrlCheckErr(TestCtrl.postTestDescriptor, req.body, 201, 503)

    return res.status(ret.status).json(ret.body);
})

//PUT /api/testDescriptor/:id
router.put('/:id',[
    param('id').isInt({ min: 1 })
] ,async (req, res) => {
    const errors = validationResult(req);
    try{
        if(!wh.hasPermissions("manager"))
            throw HTTPError.E401("wrong permissions")

        if(req.body.newName == undefined
            || req.body.newProcedureDescription == undefined
            || req.body.newIdSKU == undefined
            )
            throw HTTPError.E422("Invalid args")
        if (!errors.isEmpty())
            throw HTTPError.E422("validation of paramiters failed");

    }catch (e){
        return res.status(e.status).json(e.body);
    }

    let ret = await callCtrlCheckErr(TestCtrl.putTestDescriptor,req.params.id, req.body, 200, 503)

    return res.status(ret.status).json(ret.body);
})

//DELETE /api/testDescriptor/:id
router.delete('/:id',[
    param('id').isInt({ min: 1 })
], async (req, res) => {
    const errors = validationResult(req);
    try{
        if(!wh.hasPermissions("manager"))
            throw HTTPError.E401("wrong permissions")

        if (!errors.isEmpty())
            throw HTTPError.E422("validation of paramiters failed");
    }catch (e){
        return res.status(e.status).json(e.body);
    }

    let ret = await callCtrlCheckErr(TestCtrl.deleteTestDescriptor, req.params.id, 204, 503)

    return res.status(ret.status).json(ret.body);
})

module.exports = router;