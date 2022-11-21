'use strict';
const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
chai.should();
const ItemDao = require('../src/models/Item');
const UserDao = require('../src/models/User');
const skuDao = require('../src/models/SKU');
const { Warehouse } = require('../src/controllers/Warehouse');
const wh = Warehouse.getInstance();
const ItemCtrl = wh.ItemCtrl;



let mockItem = {
    newDescription: "pasta riccha",
    newPrice: 500,
}

const app = require("../server");
const ItemController = require('../src/controllers/ControllerItem');
const agent = chai.request.agent(app);

describe('Item Controller Post and Get', function () {

    beforeEach(async function () {


        await ItemDao.deleteTable();
        await ItemDao.createTable();
    })

    postAndGetItem1("test correct post Item but incorrect get", 1, "a new Item", 10.99, 1, 1);
    postAndGetItem2("test incorrect post", 1, "a new Item", 10.99, 1, 1);
    putAndGetItem1("test correct put Item and correct get", 1, "a new Item", 10.99, 1, 1);
    putAndGetItem2("test incorrect put", 1, "a new Item", 10.99, 1, 1);




});



function postAndGetItem1(title, id, description, price, SKUId, supplierId) {
    it(title, async function () {
        // Creation of request body
        let item = {
            id: id,
            description: description,
            price: price,
            SKUId: SKUId,
            supplierId: supplierId
        }
        // send the request
        try {
            await ItemCtrl.postItem(item);
            await ItemCtrl.getItem(2,4);
        }
        catch (e) {
            e.status.should.equal(404);

        }
    })


}

function postAndGetItem2(title, id, description, price, SKUId, supplierId) {
    it(title, async function () {
        // Creation of request body
        let item = {
            id: id,
            description: description,
            price: price,
            SKUId: SKUId,
            supplierId: supplierId
        }
        // send the request

        await ItemCtrl.postItem(item);
        let res = await ItemCtrl.getItem(id,supplierId);
        res.id.should.equal(id);
        res.description.should.equal(description);
        res.price.should.equal(price);
        res.SKUId.should.equal(SKUId);
        res.supplierId.should.equal(supplierId);
    })
}

function putAndGetItem1(title, id, description, price, SKUId, supplierId) {
    it(title, async function () {
        // Creation of request body
        let item = {
            id: id,
            description: description,
            price: price,
            SKUId: SKUId,
            supplierId: supplierId
        }
        // send the request

        await ItemCtrl.postItem(item);
        await ItemCtrl.putItem(id,supplierId ,mockItem);
        let res = await ItemCtrl.getItem(id, supplierId);
        res.id.should.equal(id);
        res.description.should.equal(mockItem.newDescription);
        res.price.should.equal(mockItem.newPrice);
        res.SKUId.should.equal(SKUId);
        res.supplierId.should.equal(supplierId);
    })
}

function putAndGetItem2(title, id, description, price, SKUId, supplierId) {
    it(title, async function () {
        // Creation of request body
        let item = {
            id: id,
            description: description,
            price: price,
            SKUId: SKUId,
            supplierId: supplierId
        }
        // send the request
        try {
            await ItemCtrl.postItem(item);
            await ItemCtrl.putItem(9, mockItem);
        }
        catch(e) {

            e.status.should.equal(404);
            
            
        }
    })
}



