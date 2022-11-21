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

//GET /api/internalOrders
router.get('', async (req, res) => {
    try{
        if(!wh.hasPermissions("manager"))
            throw HTTPError.E401("wrong permissions")
    }catch (e) {
        return res.status(e.status).json(e.body);
    }

    let ret = await callCtrlCheckErr(OrdCtrl.getInternalOrders, 200, 500);

    return res.status(ret.status).json(ret.body);
})

//GET /api/internalOrders/:id
router.get('/:id',[
    param("id").isInt({min: 1})
], async (req, res) => {
    const errors = validationResult(req);
    try{
        if(!wh.hasPermissions("manager", "deliveryEmployee"))
            throw HTTPError.E401("wrong permissions")

        if (!errors.isEmpty()) 
            throw HTTPError.E422("validation of id failed")
    }catch (e) {
        return res.status(e.status).json(e.body);
    }

    let ret = await callCtrlCheckErr(OrdCtrl.getInternalOrder, req.params.id, 200, 500);

    return res.status(ret.status).json(ret.body);
})

//POST /api/internalOrders
router.post('',[
    body("customerId").isInt({min: 1}),
    body("products.*.SKUId").isInt({min: 1}),
    body("products.*.price").isFloat({min : 0}),
    body("products.*.qty").isInt({min: 1})
], async (req, res) => {
    const errors = validationResult(req);
    try{
        if(!wh.hasPermissions("manager", "customer"))
            throw HTTPError.E401("wrong permissions")

        if (!errors.isEmpty()) 
            throw HTTPError.E422("validation of id failed")

        if(req.body.issueDate === undefined
            || req.body.products === undefined)
            return HTTPError.E422("some params are undefined")

        // check the date
        let date = req.body.issueDate;
        if (!(dayjs(date,["YYYY/M/DD","YYYY/M/D","YYYY/MM/D","YYYY/MM/DD","YYYY/M/DD HH:mm","YYYY/M/D HH:mm","YYYY/MM/D HH:mm","YYYY/MM/DD HH:mm","YYYY/M/DD H:mm","YYYY/M/D H:mm","YYYY/MM/D H:mm","YYYY/MM/DD H:mm","YYYY/M/DD H:m","YYYY/M/D H:m","YYYY/MM/D H:m","YYYY/MM/DD H:m","YYYY/M/DD HH:m","YYYY/M/D HH:m","YYYY/MM/D HH:m","YYYY/MM/DD HH:m"],true)).isValid()) {
            throw HTTPError.E422("Invalid Date Format");
        }

        // check that all the products inside the order exist
        /*
        for( const product of req.body.products){
            try{
                const sku = await wh.SKUCtrl.getSKUById(product.SKUId)

                // check if the quantity ordered are available
                if( sku.availableQuantity < product.qty )
                    throw HTTPError.E422("No availability");

            }catch (e){
                throw HTTPError.E422("Some products doesn't exists in DB or no availability");
            }
        }
        */
       /*
        let user
        try{
            // Check if the customer exists, otherwise throw an exception
            user = await wh.UserCtrl.getUser(req.body.customerId)
        }catch (e){
            if(e.status === 404)
                e.status = 422;
            throw e;
        }
        // if the user isn't a customer throw an exception
        if(user.type !== "customer")
            throw HTTPError.E422("The user isn't a customer")
        */

    }catch (e){
        return res.status(e.status).json(e.body);
    }

    let ret = await callCtrlCheckErr(OrdCtrl.postInternalOrder, req.body, 201, 503);

    return res.status(ret.status).json(ret.body);
})

//PUT /api/internalOrders/:id
router.put('/:id',[
    param("id").isInt({min: 1}),
    body("newState").isString()
], async (req, res) => {
    const errors = validationResult(req);
    try{
        if(!wh.hasPermissions("manager", "deliveryEmployee", "customer"))
            throw HTTPError.E401("wrong permissions")

        if(!errors.isEmpty()) 
            throw HTTPError.E422("validation of id failed")

        if(req.body.newState === undefined)
            throw HTTPError.E422("undefined id or newState")

        if(req.body.newState === "COMPLETED")
            for(const product of req.body.products) {
                if(product.SkuID <=0 || product.RFID.length !== 32)
                    throw HTTPError.E422("wrong skuId or RFID")
            }

        /*
        // check on products, if there are
        let dictionary = {}
        if( req.body.newState === StateInternal.COMPLETED ){
            if( req.body.products === undefined)
                throw HTTPError.E422("invalid products array")

            for(const product of req.body.products) {
                // check if SKUid exists
                await wh.SKUCtrl.getSKUById(product.SkuID)
                // check if RFID exists
                let skuItem = await wh.SKUCtrl.getSKUItem(product.RFID)

                // check the consistence of data
                if(skuItem.SKUId !== product.SkuID)
                    throw HTTPError.E422("rfid is not associated to that skuid")

                // save the number of rfid for each SKU for testing the correctness
                if(dictionary[product.SkuID] === undefined )
                    dictionary[product.SkuID] = 1;
                else{
                    dictionary[product.SkuID]++;
                }
            }

            // check if the number of inserted RFID correspond to the qty inside the internal order
            for(const product of intOrder.products){
                if(product.qty !== dictionary[product.SKUId])
                    throw HTTPError.E422("missing or incomplete order")
            }
        }
        */

    }catch (e){
        return res.status(e.status).json(e.body);
    }

    let ret = await callCtrlCheckErr(OrdCtrl.putInternalOrder, req.params.id, req.body, 200, 503);

    return res.status(ret.status).json(ret.body);
})

// DELETE /api/internalOrders/:id
router.delete('/:id',[
    param("id").isInt({min: 1})
], async (req, res) => {
    const errors = validationResult(req);
    try{
        if(!wh.hasPermissions("manager"))
            throw HTTPError.E401("wrong permissions")

        if (!errors.isEmpty()) 
            throw HTTPError.E422("validation of id failed")

    }catch (e){
        return res.status(e.status).json(e.body);
    }

    let ret = await callCtrlCheckErr(OrdCtrl.deleteInternalOrder, req.params.id, 204, 503);

    return res.status(ret.status).json(ret.body);
})

module.exports = router;