'use strict';
const express = require('express');
const { Warehouse } = require('../src/controllers/Warehouse');
const { callCtrlCheckErr } = require("../callCtrlCheckErr");
const HTTPError = require("../src/controllers/HTTPError");
const router = express.Router();
const { validationResult, body, param } = require('express-validator');

const wh = Warehouse.getInstance();

const SKUCtrl = wh.SKUCtrl;
const ItemCtrl = wh.ItemCtrl;
const UserCtrl = wh.UserCtrl;



//GET /api/items
router.get('', async (req, res) => {


    // Permission Check
    try {
        if (!wh.hasPermissions("manager", "supplier"))
            throw HTTPError.E401("wrong permissions")



    } catch (e) {
        console.log(e.message)
        res.status(e.status).json(e.body);
    }



    let ret = await callCtrlCheckErr(ItemCtrl.getItems, 200, 500);

    return res.status(ret.status).json(ret.body);
})

//GET /api/items/:id/:supplierId
router.get('/:id/:supplierId', [
    param('id').isInt({ min: 0 }).isLength({ min: 0, max: 12 }),
    param('supplierId').isInt({min : 1})
], async (req, res) => {

    const errors = validationResult(req);




    // Permission Check
    try {
        if (!wh.hasPermissions("manager", "supplier"))
            throw HTTPError.E401("wrong permissions")
        if (!errors.isEmpty())
            throw HTTPError.E422("validation of paramiters failed");
        // The Item existancy check
        try {
            await ItemCtrl.getItem(req.params.id, req.params.supplierId);
            // if nothing is throwed, it means that the itemid is already used, throw exception 422
        } catch (e) {
            if (e.status === 404)
                throw HTTPError.E404("Item doesn't exist");
        }

    } catch (e) {
        console.log(e.message)
        res.status(e.status).json(e.body);
    }



    // E500 is implicit of a generic failure of the program
    let ret = await callCtrlCheckErr(ItemCtrl.getItem, req.params.id, req.params.supplierId, 200, 500);

    return res.status(ret.status).json(ret.body);
})

//POST /api/item
router.post('', async (req, res) => {

    try {
        if (!wh.hasPermissions("manager"))
            throw HTTPError.E401("wrong permissions")

        if (req.body.id === undefined
            || req.body.description === undefined
            || req.body.price === undefined
            || req.body.SKUId === undefined
            || req.body.supplierId === undefined
            || req.body.price < 0
        )
            throw HTTPError.E422("Invalid args")

        await SKUCtrl.getSKUById(req.body.SKUId);    
        try {
            var Item = await ItemCtrl.getItem(req.body.id, req.body.supplierId);
            // if nothing is throwed, it means that the itemid is already used, throw exception 422
        } catch (e) { }
        if (Item != undefined)
            throw HTTPError.E422("itemId Unprocessable Entity");

        //Checking the SKU

        //Check if the supplier Exists
        let supplier = await UserCtrl.getUser(req.body.supplierId);
        if (supplier.type !== "supplier")
            throw HTTPError.E422("user isn't a supplier")

        // checks no repetition of item by supplier
        let items = await ItemCtrl.getItemsBySupplId(req.body.supplierId);

        if (items !== undefined)
            items.forEach(i => {
                if (i.SKUId === req.body.SKUId || i.id === req.body.id)
                    throw HTTPError.E422("The item is already insert")

            });


    } catch (e) {
        console.log(e.message)
        return res.status(e.status).json(e.body);
    }

    let ret = await callCtrlCheckErr(ItemCtrl.postItem, req.body, 201, 503);

    return res.status(ret.status).json(ret.body);
})

//PUT /api/item/:id/:supplierId
router.put('/:id/:supplierId', [
    param('id').isInt({ min: 0 }).isLength({ min: 0, max: 12 }),
    param('supplierId').isInt({min : 1})
], async (req, res) => {

    // Permission Check

    const errors = validationResult(req);
    // Permission Check
    try {
        if (!wh.hasPermissions("manager", "supplier"))
            throw HTTPError.E401("wrong permissions");



        if (!errors.isEmpty())
            throw HTTPError.E422("validation of paramiters failed");


        // The Item existancy check
        try {
            await ItemCtrl.getItem(req.params.id, req.params.supplierId);
            // if nothing is throwed, it means that the itemid is already used, throw exception 422
        } catch (e) {
            if (e.status === 404)
                throw HTTPError.E404("Item doesn't exist");
        }

    } catch (e) {
        console.log(e.message)
        res.status(e.status).json(e.body);
    }



    let ret = await callCtrlCheckErr(ItemCtrl.putItem, req.params.id, req.params.supplierId, req.body, 200, 503);


    return res.status(ret.status).json(ret.body);
})

//DELETE /api/items/:id/:supplierId
router.delete('/:id/:supplierId', [
    param('id').isInt({ min: 0 }).isLength({ min: 0, max: 12 }),
    param('supplierId').isInt({min : 1})
], async (req, res) => {

    const ItemCtrl = Warehouse.getInstance().ItemCtrl;
    const errors = validationResult(req);

    // Permission Check
    try {
        if (!wh.hasPermissions("manager", "supplier"))
            throw HTTPError.E401("wrong permissions")
        if (!errors.isEmpty())
            throw HTTPError.E422("validation of paramiters failed");
        try {
            // await ItemCtrl.getItem(req.params.id);
            // if nothing is throwed, it means that the itemid is already used, throw exception 422
        } catch (e) {
            if (e.status === 404)
                throw HTTPError.E404("Item doesn't exist");
        }


    } catch (e) {
        console.log(e.message)
        res.status(e.status).json(e.body);
    }





    let ret = await callCtrlCheckErr(ItemCtrl.deleteItem, req.params.id, req.params.supplierId, 204, 503);
    return res.status(ret.status).json(ret.body);
})

module.exports = router;