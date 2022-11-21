'use strict';
const express = require('express');
const { Warehouse } = require('../src/controllers/Warehouse');
const HTTPError = require("../src/controllers/HTTPError");
const { callCtrlCheckErr } = require("../callCtrlCheckErr");
const dayjs = require("dayjs");
const router = express.Router();
const {  validationResult, body, param } = require('express-validator');

const wh = Warehouse.getInstance();
const OrderCtrl = wh.OrderCtrl;


//GET /api/returnOrders
router.get('', async (req, res) => {
    try {
        if(!wh.hasPermissions("manager"))
            throw HTTPError.E401("wrong permissions")
    } catch (e) {
        return res.status(e.status).json(e.body);
    }
    let ret = await callCtrlCheckErr(OrderCtrl.getReturnOrders, 200, 500);
    return res.status(ret.status).json(ret.body);
})

//GET /api/returnOrders/:id
router.get('/:id',[
    param("id").isInt({min: 1})
], async (req, res) => {
    const errors = validationResult(req);
    try {
        if(!wh.hasPermissions("manager"))
            throw HTTPError.E401("wrong permissions")
        if (!errors.isEmpty()) {
            console.log(errors);
            throw HTTPError.E422("validation of id failed")
        }

    } catch (e) {
        console.log(e.message)
        return res.status(e.status).json(e.body);
    }
    let ret = await callCtrlCheckErr(OrderCtrl.getReturnOrder,req.params.id ,200, 500);
    return res.status(ret.status).json(ret.body);
})

//POST/api/returnOrder
router.post('',[
    body("restockOrderId").isInt({min: 1}),
    body("products.*.SKUId").isInt({min: 1}),
    body("products.*.price").isFloat({min : 0}),
    body("products.*.RFID").isString().isLength({min:32, max:32}),
    body('products.*.itemId').isInt({ min: 0 })
] ,async (req, res) => {
    const errors = validationResult(req);
    try {
        if(!wh.hasPermissions("manager"))
            throw HTTPError.E401("wrong permissions")

        if (!errors.isEmpty()){
            console.log(errors);
            throw HTTPError.E422("validation of id failed")
        }


        if(req.body.returnDate == undefined
            || req.body.products == undefined)
            throw HTTPError.E422("undefined body fields")

        // check the date
        let date = req.body.returnDate;
        if (!(dayjs(date,["YYYY/M/DD","YYYY/M/D","YYYY/MM/D","YYYY/MM/DD","YYYY/M/DD HH:mm","YYYY/M/D HH:mm","YYYY/MM/D HH:mm","YYYY/MM/DD HH:mm","YYYY/M/DD H:mm","YYYY/M/D H:mm","YYYY/MM/D H:mm","YYYY/MM/DD H:mm","YYYY/M/DD H:m","YYYY/M/D H:m","YYYY/MM/D H:m","YYYY/MM/DD H:m","YYYY/M/DD HH:m","YYYY/M/D HH:m","YYYY/MM/D HH:m","YYYY/MM/DD HH:m"],true)).isValid()) {
            throw HTTPError.E422("Invalid Date Format");
        }
        /*
        let returnItems = await OrderCtrl.getRestockOrderReturnItems(req.body.restockOrderId);
        for(const returnItem of req.body.products){
            if( !returnItems.some((item) => {
                return returnItem.SKUId === item.SKUId
                    && returnItem.RFID === item.rfid;
            }))
                throw HTTPError.E422("some items could not be returned or not exists");
        }
        */
    } catch (e) {
        return res.status(e.status).json(e.body);
    }

    let ret = await callCtrlCheckErr(OrderCtrl.postReturnOrder, req.body, 201, 503)

    return res.status(ret.status).json(ret.body);
})

//DELETE /api/returnOrder/:id
router.delete('/:id',[
    param("id").isInt({min: 1})
], async (req, res) => {
    const errors = validationResult(req);
    try {
        if(!wh.hasPermissions("manager"))
            throw HTTPError.E401("wrong permissions")

        if (!errors.isEmpty()) 
            throw HTTPError.E422("validation of id failed")
        
    } catch (e) {
        return res.status(e.status).json(e.body);
    }

    let ret = await callCtrlCheckErr(OrderCtrl.deleteReturnOrder, req.params.id, 204, 503)

    return res.status(ret.status).json(ret.body);
})

module.exports = router;