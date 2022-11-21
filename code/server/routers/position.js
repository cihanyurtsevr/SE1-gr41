'use strict';
const express = require('express');
const { Warehouse } = require('../src/controllers/Warehouse');
const HTTPError = require("../src/controllers/HTTPError");
const { callCtrlCheckErr } = require("../callCtrlCheckErr");
const router = express.Router();
const { validationResult, body, param } = require('express-validator');

const wh = Warehouse.getInstance();
const ItemCtrl = wh.ItemCtrl;

//GET /api/positions
router.get('', async (req, res) => {
    try {
        if (!wh.hasPermissions("manager", "clerk"))
            throw HTTPError.E401("wrong permissions")


    } catch (e) {
        return res.status(e.status).json(e.body);
    }
    let ret = await callCtrlCheckErr(ItemCtrl.getPositions, 200, 500);
    return res.status(ret.status).json(ret.body);
})


//POST /api/position
router.post('', async (req, res) => {


    try {
        if (!wh.hasPermissions("manager"))
            throw HTTPError.E401("wrong permissions")

        if (req.body.positionID == undefined
            || req.body.aisleID == undefined
            || req.body.row == undefined
            || req.body.col == undefined
            || req.body.maxWeight == undefined
            || req.body.maxVolume == undefined
            || req.body.positionID.length != 12
            || req.body.positionID.slice(0, 4) != req.body.aisleID
            || req.body.positionID.slice(4, 8) != req.body.row
            || req.body.positionID.slice(8, 12) != req.body.col
            || req.body.maxWeight < 0
            || req.body.maxVolume < 0)
            throw HTTPError.E422("Invalid args")


    } catch (e) {
        return res.status(e.status).json(e.body);
    }


    let ret = await callCtrlCheckErr(ItemCtrl.postPosition, req.body, 201, 503)

    return res.status(ret.status).json(ret.body);
})

//PUT /api/position/:positionID
router.put('/:positionID', [
    param('positionID').isLength({ min: 12, max: 12 })
], async (req, res) => {

    

    const errors = validationResult(req);
    let posMod = req.body;
    try {
        if (!wh.hasPermissions("manager", "clerk"))
            throw HTTPError.E401("wrong permissions")

        if (!errors.isEmpty())
            throw HTTPError.E422("validation of paramiters failed");

        let Position = await ItemCtrl.getPosition(req.params.positionID);

        // If only one field needs to be modified, the other one will contain the old value.
        posMod.newAisleID = posMod.newAisleID == undefined ? Position.aisleID : posMod.newAisleID;
        posMod.newRow = posMod.newRow == undefined ? Position.row : posMod.newRow;
        posMod.newCol = posMod.newCol == undefined ? Position.col : posMod.newCol;
        posMod.newMaxWeight = posMod.newMaxWeight == undefined ? Position.maxWeight : posMod.newMaxWeight;
        posMod.newMaxVolume = posMod.newMaxVolume == undefined ? Position.maxVolume : posMod.newMaxVolume;
        posMod.newOccupiedWeight = posMod.newOccupiedWeight == undefined ? Position.occupiedWeight : posMod.newOccupiedWeight;
        posMod.newOccupiedVolume = posMod.newOccupiedVolume == undefined ? Position.occupiedVolume : posMod.newOccupiedVolume;
        let newPositionID = posMod.newAisleID.concat(posMod.newRow, posMod.newCol);
        if (newPositionID.length != 12
            || newPositionID.slice(0, 4) != posMod.newAisleID
            || newPositionID.slice(4, 8) != posMod.newRow
            || newPositionID.slice(8, 12) != posMod.newCol
            || posMod.newMaxWeight < 0
            || posMod.newMaxVolume < 0)
            throw HTTPError.E422("Invalid args")


        // only if the new RFID is differend than the previous
        if (req.params.positionID !== newPositionID) {
            // check if the new rfid already exists
            try {
                var newPosition = await ItemCtrl.getPosition(newPositionID);
                // if nothing is throwed, it means that the rfid is already used, throw exception 422
            } catch (e) {
                // if here it means that the new RFID doesn't exists, so it can be modified
            }
            if (newPosition !== undefined)
                throw HTTPError.E422("PositionID already Exists");
        }
    } catch (e) {
        return res.status(e.status).json(e.body);
    }

    let ret = await callCtrlCheckErr(ItemCtrl.putPosition, req.params.positionID, req.body, 200, 503)

    return res.status(ret.status).json(ret.body);
})

//PUT /api/position/:positionID/changeID
router.put('/:positionID/changeID',
[
    param('positionID').isLength({ min: 12, max: 12 }),
    body('newPositionID').isLength({ min: 12, max: 12 })
], async (req, res) => {

    const errors = validationResult(req);
    let posMod = req.body;
    try {

        if (!wh.hasPermissions("manager"))
            throw HTTPError.E401("wrong permissions")

            if (!errors.isEmpty())
            throw HTTPError.E422("validation of paramiters failed");

        let Position = await ItemCtrl.getPosition(req.params.positionID);
        posMod.newPositionID = posMod.newPositionID == undefined ? Position.positionID : posMod.newPositionID;

        // If only one field needs to be modified, the other one will contain the old value.

        if (req.params.positionID.length != 12)
            HTTPError.E422("Invalid args")


        // only if the new RFID is differend than the previous
        if (req.params.positionID !== posMod.newPositionID) {
            // check if the new rfid already exists
            try {
                var newPosition = await ItemCtrl.getPosition(posMod.newPositionID);
                // if nothing is throwed, it means that the rfid is already used, throw exception 422
            } catch (e) {
                // if here it means that the new RFID doesn't exists, so it can be modified
            }
            if (newPosition !== undefined)
                throw HTTPError.E422("PositionID already Exists");
        }
    } catch (e) {
        return res.status(e.status).json(e.body);
    }

    let ret = await callCtrlCheckErr(ItemCtrl.putPositionChangeID, req.params.positionID, req.body, 200, 503)

    return res.status(ret.status).json(ret.body);
})

//DELETE /api/position/:positionID
router.delete('/:positionID',[
    param('positionID').isInt({ min: 1 }).isLength({ min: 0, max: 12 })
] ,async (req, res) => {

    const errors = validationResult(req);
    try {

        if (!wh.hasPermissions("manager"))
            throw HTTPError.E401("wrong permissions")


            if (!errors.isEmpty())
            throw HTTPError.E422("validation of paramiters failed");

        try {
            await ItemCtrl.getPosition(req.params.positionID);
            // at this point we hare sure that the RFID exists, because otherwise there is a throw exception
            // The control of error 404 is implict in the call of the getSKUItem()
        } catch (e) {
            if (e.status === 404)
                throw HTTPError.E404("PositionID doesn't exist");
            throw e;
        }
    } catch (e) {
        return res.status(e.status).json(e.body);
    }

    let ret = await callCtrlCheckErr(ItemCtrl.deletePosition, req.params.positionID, 204, 503)

    return res.status(ret.status).json(ret.body);
})

module.exports = router;