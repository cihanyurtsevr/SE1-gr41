'use strict';
const express = require('express');
const { Warehouse } = require('../src/controllers/Warehouse');
const HTTPError = require("../src/controllers/HTTPError");
const {callCtrlCheckErr} = require("../callCtrlCheckErr");
const router = express.Router();
const {  validationResult, body, param } = require('express-validator');

const wh = Warehouse.getInstance();
const UserCtrl = wh.UserCtrl;

//GET /api/users
router.get('', async (req, res) => {
    try{
        if(!wh.hasPermissions("manager"))
            throw HTTPError.E401("wrong permissions")

    }catch (e){
        return res.status(e.status).json(e.body);
    }

    let ret = await callCtrlCheckErr(UserCtrl.getUsers, 200, 500)

    return res.status(ret.status).json(ret.body);
})

//PUT /api/users/:username
router.put('/:username', [
    param("username").isEmail()
], async (req, res) => {
    const errors = validationResult(req);
    try{
        if(!wh.hasPermissions("manager"))
            throw HTTPError.E401("wrong permissions")

        if (!errors.isEmpty()) 
            throw HTTPError.E422("validation of id failed")

        if(req.body.oldType === undefined
            || req.body.newType === undefined)
            throw HTTPError.E422("Invalid args")

    }catch (e){
        return res.status(e.status).json(e.body);
    }

    let ret = await callCtrlCheckErr(UserCtrl.putUser, req.params.username, req.body, 200,  503)

    return res.status(ret.status).json(ret.body);
})

//DELETE /api/users/:username/:type
router.delete('/:username/:type', [
    param("username").isEmail()
], async (req, res) => {
    const errors = validationResult(req);
    try{
        if(!wh.hasPermissions("manager"))
            throw HTTPError.E401("wrong permissions")

        if (!errors.isEmpty()) 
            throw HTTPError.E422("validation of id failed")

        if(req.params.type === undefined)
            throw HTTPError.E422("Invalid type")
            
    }catch (e){
        return res.status(e.status).json(e.body);
    }

    let ret = await callCtrlCheckErr(UserCtrl.deleteUser, req.params.username, req.params.type, 204, 503)

    return res.status(ret.status).json(ret.body);
})

module.exports = router;