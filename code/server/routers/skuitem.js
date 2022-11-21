'use strict';
const express = require('express');
const { Warehouse } = require('../src/controllers/Warehouse');
const HTTPError = require("../src/controllers/HTTPError");
const dayjs = require("dayjs");
const { callCtrlCheckErr } = require("../callCtrlCheckErr");
const { validationResult, body, param } = require('express-validator');
const router = express.Router();
let customParseFormat = require('dayjs/plugin/customParseFormat')
dayjs.extend(customParseFormat);

const wh = Warehouse.getInstance();
const SKUCtrl = wh.SKUCtrl;
const TestCtrl = wh.TestCtrl;

//GET /api/skuitems
router.get('', async (req, res) => {

    try {
        if (!wh.hasPermissions("manager"))
            throw HTTPError.E401("wrong permissions")
    } catch (e) {
        return res.status(e.status).json(e.body);
    }

    let ret = await callCtrlCheckErr(SKUCtrl.getSKUItems, 200, 500)

    return res.status(ret.status).json(ret.body);
})

//GET /api/skuitems/sku/:id
router.get('/sku/:id', [
    param('id').isInt({ min: 1 }).isLength({ min: 0, max: 12 })
], async (req, res) => {
    const errors = validationResult(req);
    try {
        if (!wh.hasPermissions("manager", "customer"))
            throw HTTPError.E401("wrong permissions")

        if (!errors.isEmpty())
            throw HTTPError.E422("validation of id failed")
    } catch (e) {
        return res.status(e.status).json(e.body);
    }

    let ret = await callCtrlCheckErr(SKUCtrl.getSKUItemsBySKUId, req.params.id, 200, 500)

    return res.status(ret.status).json(ret.body);
})

//GET /api/skuitems/:rfid
router.get('/:rfid', [
    param('rfid').isLength({ min: 32, max: 32 })
], async (req, res) => {
    const errors = validationResult(req);
    try {
        if (!wh.hasPermissions("manager"))
            throw HTTPError.E401("wrong permissions")

        if (!errors.isEmpty())
            throw HTTPError.E422("validation of id failed")
    } catch (e) {
        return res.status(e.status).json(e.body);
    }

    let ret = await callCtrlCheckErr(SKUCtrl.getSKUItem, req.params.rfid, 200, 500)

    return res.status(ret.status).json(ret.body);
})

//POST /api/skuitem
router.post('', [
    body('RFID').isString().isLength({ min: 32, max: 32 }),
    body('SKUId').isInt({ min: 1 }).isLength({ min: 0, max: 12 }),
], async (req, res) => {
    const errors = validationResult(req);
    try {
        if (!wh.hasPermissions("manager", "clerk"))
            throw HTTPError.E401("wrong permissions")

        if (!errors.isEmpty())
            throw HTTPError.E422("validation of id failed")

        let date = req.body.DateOfStock;
        if (date != undefined && !(dayjs(date, ["YYYY/M/DD","YYYY/M/D","YYYY/MM/D","YYYY/MM/DD","YYYY/M/DD HH:mm","YYYY/M/D HH:mm","YYYY/MM/D HH:mm","YYYY/MM/DD HH:mm","YYYY/M/DD H:mm","YYYY/M/D H:mm","YYYY/MM/D H:mm","YYYY/MM/DD H:mm","YYYY/M/DD H:m","YYYY/M/D H:m","YYYY/MM/D H:m","YYYY/MM/DD H:m","YYYY/M/DD HH:m","YYYY/M/D HH:m","YYYY/MM/D HH:m","YYYY/MM/DD HH:m"], true)).isValid()) {
            throw HTTPError.E422("Invalid Date Format");
        }

    } catch (e) {
        return res.status(e.status).json(e.body);
    }

    let ret = await callCtrlCheckErr(SKUCtrl.postSKUItem, req.body, 201, 503)

    return res.status(ret.status).json(ret.body);
})

//PUT /api/skuitems/:rfid
router.put('/:rfid', [
    param('rfid').isLength({ min: 32, max: 32 }),
    body("newAvailable").isInt({min:0, max:1})
], async (req, res) => {
    let skuMod = req.body;
    const errors = validationResult(req);
    try {
        if (!wh.hasPermissions("manager"))
            throw HTTPError.E401("wrong permissions")

        if (!errors.isEmpty())
            throw HTTPError.E422("validation of id failed")

        if ((skuMod.newRFID != undefined && skuMod.newRFID.length !== 32)
            || (skuMod.newAvailable != undefined && (skuMod.newAvailable !== 0 && skuMod.newAvailable !== 1)))
            throw HTTPError.E422("invalid arguments")

        let date = req.body.newDateOfStock;
        if (date != undefined && !(dayjs(date, ["YYYY/MM/DD HH:mm", "YYYY/MM/DD"], true)).isValid()) {
            throw HTTPError.E422("Invalid Date Format");
        }

    } catch (e) {
        console.log(e.message);
        return res.status(e.status).json(e.body);
    }

    let ret = await callCtrlCheckErr(SKUCtrl.putSKUItem, req.params.rfid, skuMod, 200, 503)

    return res.status(ret.status).json(ret.body);
})

//DELETE /api/skuitems/:rfid
router.delete('/:rfid', [
    param('rfid').isLength({ min: 32, max: 32 })
], async (req, res) => {
    const errors = validationResult(req);
    try {
        if (!wh.hasPermissions("manager"))
            throw HTTPError.E401("wrong permissions")

        if (!errors.isEmpty())
            throw HTTPError.E422("validation of id failed")

    } catch (e) {
        return res.status(e.status).json(e.body);
    }

    let ret = await callCtrlCheckErr(SKUCtrl.deleteSKUItem, req.params.rfid, 204, 503)

    return res.status(ret.status).json(ret.body);
})


// ------------------ TEST RESULT ------------------

//GET /api/skuitems/:rfid/testResults
router.get('/:rfid/testResults', [
    param('rfid').isNumeric().isLength({ min: 32, max: 32 })
], async (req, res) => {
    try {

        const errors = validationResult(req);

        // Check the permission 
        if (!wh.hasPermissions("manager", "quality empoloyee"))
            throw HTTPError.E401("wrong permissions");

        if (!errors.isEmpty())
            throw HTTPError.E422("validation of id failed")

        // Check the RFID validity
        try {
            await SKUCtrl.getSKUItem(req.params.rfid);
            // if nothing is throwed, it means that the RFID is already used, throw exception 422
        } catch (e) {
            if (e.status === 404)
                throw HTTPError.E404("SKU does not exists");

        }

    }
    catch (e) {
        return res.status(e.status).json(e.body);
    }


    let ret = await callCtrlCheckErr(TestCtrl.getTestResults, req.params.rfid, 200, 500);

    return res.status(ret.status).json(ret.body);
})


//GET  /api/skuitems/:rfid/testResults/:id
router.get('/:rfid/testResults/:id', [
    param('rfid').isNumeric().isLength({ min: 32, max: 32 }),
    param('id').isInt({ min: 1 }).isLength({ min: 0, max: 12 })
], async (req, res) => {

    const errors = validationResult(req);

    try {
        // Check the permission 
        if (!wh.hasPermissions("manager", "quality empoloyee"))
            throw HTTPError.E401("wrong permissions");

        if (!errors.isEmpty())
            throw HTTPError.E422("validation of id failed")

        // Check the RFID validation 
        try {
            await SKUCtrl.getSKUItem(req.params.rfid);
            // if nothing is throwed, it means that the RFID is already used, throw exception 422
        } catch (e) {
            if (e.status === 404)
                throw HTTPError.E404("SKUitem does not exist");
        }

    } catch (e) {
        return res.status(e.status).json(e.body);

    }


    let ret = await callCtrlCheckErr(TestCtrl.getTestResultById, req.params.rfid, req.params.id, 200, 500);

    return res.status(ret.status).json(ret.body);
})

//POST /api/skuitems/testResult
router.post('/testResult', async (req, res) => {

    try {

        // Check the permission 
        if (!wh.hasPermissions("manager", "quality empoloyee"))
            throw HTTPError.E401("wrong permissions");

        //Check the body
        if (req.body.rfid === undefined
            || req.body.idTestDescriptor === undefined
            || req.body.Date === undefined
            || req.body.Result === undefined
            || req.body.rfid.length !== 32 )
            throw HTTPError.E422("Invalid args");

        let date = req.body.Date;
        if (date != undefined && !(dayjs(date, ["YYYY/MM/DD HH:mm", "YYYY/MM/DD"], true)).isValid()) {
            throw HTTPError.E422("Invalid Date Format");
        }





        //Check the RFID
        try {
            await SKUCtrl.getSKUItem(req.body.rfid);
            // RFID exists, because otherwise there is a throw exception

        } catch (e) {
            if (e.status === 404)
                throw HTTPError.E404("SkuItem does not exist");

        }



        //Check the idTestDEscriptor
        try {
            await TestCtrl.getTestDescriptor(req.body.idTestDescriptor);
            // RFID exists, because otherwise there is a throw exception

        } catch (e) {
            if (e.status === 404)
                throw HTTPError.E404("TestDescriptor does not exist");

        }

    } catch (e) {
        return res.status(e.status).json(e.body);

    }



    let ret = await callCtrlCheckErr(TestCtrl.postTestResult, req.body, 201, 503);

    return res.status(ret.status).json(ret.body);
})

//PUT  /api/skuitems/:rfid/testResult/:id
router.put('/:rfid/testResult/:id', [
    param('rfid').isNumeric().isLength({ min: 32, max: 32 }),
    param('id').isInt({ min: 1 }).isLength({ min: 0, max: 12 })
], async (req, res) => {

    const errors = validationResult(req);


    try {
        // Check the permission 


        if (!wh.hasPermissions("manager", "quality employee"))
            throw HTTPError.E401("wrong permissions");

        if (!errors.isEmpty())
            throw HTTPError.E422("validation of id failed")

        //Check the body
        if (req.body.newIdTestDescriptor === undefined
            || req.body.newDate === undefined
            || req.body.newResult === undefined
            || req.body.newIdTestDescriptor === undefined)
            throw HTTPError.E422("Invalid args")

        let date = req.body.newDate;
        if (date != undefined && !(dayjs(date, ["YYYY/MM/DD HH:mm", "YYYY/MM/DD"], true)).isValid()) {
            throw HTTPError.E422("Invalid Date Format");
        }


        try {
            await SKUCtrl.getSKUItem(req.params.rfid);
            // RFID exists, because otherwise there is a throw exception

        } catch (e) {
            if (e.status === 404)
                throw HTTPError.E404("SKU does not exist");

        }



        //Check the idTestDEscriptor
        try {
            await TestCtrl.getTestResultById(req.params.rfid, req.params.id);
            // RFID exists, because otherwise there is a throw exception

        } catch (e) {
            if (e.status === 404)
                throw HTTPError.E404("TestResultId does not exists");

        }

        try {
            await TestCtrl.getTestDescriptor(req.body.newIdTestDescriptor);
            // RFID exists, because otherwise there is a throw exception

        } catch (e) {
            if (e.status === 404)
                throw HTTPError.E404("TestResultId does not exists");

        }

        try {
            const Test = await TestCtrl.getTestDescriptor(req.body.newIdTestDescriptor);
            const SKU = await SKUCtrl.getSKUItem(req.params.rfid);

            if (SKU.SKUId !== Test.idSKU)
                throw HTTPError.E422("Not valid test and SKU");


        } catch (e) {

        }


    } catch (e) {
        return res.status(e.status).json(e.body);
    }





    let ret = await callCtrlCheckErr(TestCtrl.putTestResult, req.params.rfid, req.params.id, req.body, 200, 503);

    return res.status(ret.status).json(ret.body);
})

//DELETE /api/skuitems/:rfid/testResult/:id
router.delete('/:rfid/testResult/:id', [
    param('rfid').isNumeric().isLength({ min: 32, max: 32 }),
    param('id').isInt({ min: 1 }).isLength({ min: 0, max: 12 })
], async (req, res) => {
    const TestCtrl = Warehouse.getInstance().TestCtrl;

    const errors = validationResult(req);

    // Check the permission 

    try {
        // Check the permission 
        if (!wh.hasPermissions("manager", "quality employee"))
            throw HTTPError.E401("wrong permissions");

        if (!errors.isEmpty())
            throw HTTPError.E422("validation of id failed")

        try {
            await TestCtrl.getTestResultById(req.params.rfid, req.params.id);
            // RFID exists, because otherwise there is a throw exception

        } catch (e) {
            if (e.status === 404)
                throw HTTPError.E422("TestResultId does not exists");

        }

    } catch (e) {
        return res.status(e.status).json(e.body);
    }





    let ret = await callCtrlCheckErr(TestCtrl.deleteTestResult, req.params.rfid, req.params.id, 204, 503);

    return res.status(ret.status).json(ret.body);
})

module.exports = router;