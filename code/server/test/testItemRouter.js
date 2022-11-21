'use strict';
const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
chai.should();
const ItemDao = require('../src/models/Item');
const UserDao = require('../src/models/User');
const skuDao = require('../src/models/SKU')


let mockSupplier = {
    username:"supplier2@ezwh.com",
    name:"Supplier",
    surname : "Surname",
    password : "testpassword",
    type : "supplier"

}

let mockSKU = {
    description: "test descriptor 3",
    weight:"This test is described by...",
    volume: 1,
    notes:"first SKU",
    price: 10.99,
    availableQuantity: 50
}

let mockSKU2 = {
    description: "test descriptor 5",
    weight:"This test is described by...",
    volume: 1,
    notes:"second SKU",
    price: 10.99,
    availableQuantity: 50
}

let mockItem ={
    id : 12,
    description : "a new item",
    price : 10.99,
    SKUId : 2,
    supplierId : 1
}

const app = require("../server");
const agent = chai.request.agent(app);

describe('Scenario 11-1', function () {

    beforeEach(async function () {

        await ItemDao.deleteTable();
        await ItemDao.createTable();
        await ItemDao.insertNewItem(mockItem);
        await skuDao.deleteTable();
        await skuDao.createTable();
        await skuDao.insertNewSKU(mockSKU);
        await skuDao.insertNewSKU(mockSKU2);
        await UserDao.deleteTable();
        await UserDao.createTable();
        await UserDao.insertNewUser(mockSupplier);
    })

    newItem("test correct new Item", 201, 1, "a new Item", 10.99 ,1,1);
    newItem("test new Item incorrect id", 422, undefined, "a new Item", 10.99 ,1,1);
    newItem("test new Item incorrect desc", 422, 1, undefined, 10.99 ,1,1);
    newItem("test new Item incorrect price", 422, 1, "a new Item", undefined ,1,1);
    newItem("test new Item incorrect SKUid", 422, 1, "a new Item", 10.99 ,undefined,1);
    newItem("test new Item suppId", 422, 1, "a new Item", 10.99 ,1,undefined);
    newItem("test new Item incorrect price", 422, 1, "a new Item", -30 ,1,1);
    newItem("test new Item already ex", 422, 12, "a new Item", 30 ,1,1);
    newItem("test new Item already ex", 422, 1, "a new Item", 30 ,2,1);

   
    
});

describe('Scenario 11-2', function () {

    beforeEach(async function () {

        await ItemDao.deleteTable();
        await ItemDao.createTable();
        await ItemDao.insertNewItem(mockItem);
        await skuDao.deleteTable();
        await skuDao.createTable();
        await skuDao.insertNewSKU(mockSKU);
        await skuDao.insertNewSKU(mockSKU2);
        await UserDao.deleteTable();
        await UserDao.createTable();
        await UserDao.insertNewUser(mockSupplier);
    })

    putItem("test correct put Item", 200, 12, "a new sku", 10.99,1);
    putItem("test incorrect put Item no correct id", 422, undefined, "a new sku", 10.99,1);
    putItem("test incorrect put Item no exixting id", 404, 4, "a new sku", 10.99,1);
  

   
    
});

function newItem(title, expectedHTTPStatus, id, description, price, SKUId, supplierId) {
    it(title, async function () {
        // Creation of request body
        let item = {
            id: id,
            description: description,
            price: price,
            SKUId: SKUId,
            supplierId : supplierId
        }
        // send the request
        let res = await agent.post('/api/item')
            .send(item)
        res.should.have.status(expectedHTTPStatus)
    })
}

function putItem(title,expectedHTTPStatus,id, newDescription, newPrice,supplierId) {
    it(title, async function () {
        // Creation of request body
        let item = {
            newDescription: newDescription,
            newPrice: newPrice
        }
        // send the request
        let res = await agent.put(`/api/item/${id}/${supplierId}`)
            .send(item)
        res.should.have.status(expectedHTTPStatus)
    })
}

