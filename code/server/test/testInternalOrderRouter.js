'use strict';
const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
chai.should();

const internalOrderDao = require("../src/models/InternalOrder");

const app = require("../server");
const dayjs = require('dayjs');
const {body} = require("express-validator");
const agent = chai.request.agent(app);

let currId;

let productsToOrder = [
    {"SKUId":12,"description":"a product","price":10.99,"qty":3},
    {"SKUId":180,"description":"another product","price":11.99,"qty":3}
]

let wrongQtyProductsToOrder = [
    {"SKUId":12,"description":"a product","price":10.99,"qty":-1},
    {"SKUId":180,"description":"another product","price":11.99,"qty":3}
]

let wrongPriceProductsToOrder = [
    {"SKUId":12,"description":"a product","price":10.99,"qty":3},
    {"SKUId":180,"description":"another product","price":-2,"qty":3}
]

let wrongSkuIdProductsToOrder = [
    {"SKUId":-5,"description":"a product","price":10.99,"qty":3},
    {"SKUId":180,"description":"another product","price":11.99,"qty":3}
]

let productModWrongSKUId = [
    {"SkuID":-1,"RFID":"12345678901234567890123456789016"},
    {"SkuID":1,"RFID":"12345678901234567890123456789038"}
]

let productModWrongRFIDtooShort = [
    {"SkuID":2,"RFID":"1234567890123456789012345678901"},
    {"SkuID":2,"RFID":"12345678901234567890123456789038"}
]

let productModWrongRFIDtooLong = [
    {"SkuID":3,"RFID":"12345678901234567890123456789016"},
    {"SkuID":3,"RFID":"123456789012345678901234567890381"}
]

let productModRFIDStrange = [
    {"SkuID":4,"RFID":"12345678901234567890123456789016"},
    {"SkuID":4,"RFID":"1234567890123456789012345678903A"}
]

describe("test post internal order", () => {
    before(async function(){
        currId = 0;

        await internalOrderDao.deleteTable();
        await internalOrderDao.createTable();

        await internalOrderDao.deleteTableJoinIntOrdSKU();
        await internalOrderDao.createTableJoinIntOrdSKU();
    });

    newInternalOrder("test no errors", 201, "2021/11/29 09:33", productsToOrder, 1);
    newInternalOrder("test wrong data hour", 422, "2021/11/29 09:70", productsToOrder, 2);
    newInternalOrder("test wrong data day", 422, "2021/11/50 09:70", productsToOrder, 3);
    newInternalOrder("test no errors data no time", 201, "2021/11/29", productsToOrder, 4);

    newInternalOrder("test wrong qty of a product", 422, "2021/11/29 09:33", wrongQtyProductsToOrder, 5);
    newInternalOrder("test wrong price of a product", 422, "2021/11/29 09:33", wrongPriceProductsToOrder, 6);
    newInternalOrder("test wrong SKU of a product", 422, "2021/11/29 09:33", wrongSkuIdProductsToOrder, 7);

    newInternalOrder("test wrong customerId", 422, "2021/11/29 09:33", productsToOrder, -1);
})

describe("test put internal order", () => {
    before(async function(){
        currId = 0;

        await internalOrderDao.deleteTable();
        await internalOrderDao.createTable();

        await internalOrderDao.deleteTableJoinIntOrdSKU();
        await internalOrderDao.createTableJoinIntOrdSKU();

        await agent.post("/api/internalOrders")
            .send({
                "issueDate":"2021/11/29 09:33",
                "products": productsToOrder,
                "customerId" : 1
            });
        await agent.post("/api/internalOrders")
            .send({
                "issueDate":"2021/11/29 09:34",
                "products": productsToOrder,
                "customerId" : 2
            });
        await agent.post("/api/internalOrders")
            .send({
                "issueDate":"2021/11/29 09:35",
                "products": productsToOrder,
                "customerId" : 3
            });
        await agent.post("/api/internalOrders")
            .send({
                "issueDate":"2021/11/29 09:36",
                "products": productsToOrder,
                "customerId" : 4
            });
        await agent.post("/api/internalOrders")
            .send({
                "issueDate":"2021/11/29 09:37",
                "products": productsToOrder,
                "customerId" : 5
            });
    });

    // possible status ISSUED, ACCEPTED, REFUSED, CANCELED, COMPLETED

    updateInternalOrder("test no errors (accept)" , 200, 1, "ACCEPTED");
    updateInternalOrder("test with a strange state" , 422, 1, "Strange State");
    updateInternalOrder("test with wrong skuId of an item" , 422, 2, "COMPLETED", productModWrongSKUId);
    updateInternalOrder("test with wrong RFID too short" , 422, 2, "COMPLETED", productModWrongRFIDtooShort);
    updateInternalOrder("test with wrong RFID too long" , 422, 2, "COMPLETED", productModWrongRFIDtooLong);
    updateInternalOrder("test with strange RFID" , 200, 2, "COMPLETED", productModRFIDStrange);
    updateInternalOrder("test no errors (refuse)" , 200, 3, "REFUSED")
    updateInternalOrder("test with a invalid internal order id" , 422, -1, "REFUSED");
    updateInternalOrder("test with a unexciting internal order id" , 404, 85, "REFUSED");
    updateInternalOrder("test no errors (cancel)" , 200, 4, "CANCELED");

})

function newInternalOrder(title, expectedHTTPStatus, issueDate, products, customerId){
    it(title, async function(){
        let bodyToSend;
        let res;
        bodyToSend = {
            "issueDate":issueDate,
            "products": products,
            "customerId" : customerId
        }
        res = await agent.post("/api/internalOrders")
            .send(bodyToSend);
        res.should.have.status(expectedHTTPStatus);

        if(res.status !== 201)
            return;

        currId++;

        res = await agent.get(`/api/internalOrders/${currId}`);
        res.should.have.status(200);
        if(res.status !== 200)
            return;

        let byId = res.body;

        res = await agent.get(`/api/internalOrders`);
        res.should.have.status(200);
        if(res.status !== 200)
            return;

        let everything = res.body;
        everything = (everything.filter((ord) => {
            return ord.id == currId;
        }))[0];

        // create a map, in order to direct access to the prod
        let shouldOrd = {};
        for(const prod of products){
            shouldOrd[prod.SKUId] = prod;
        }

        byId.id.should.equal(currId);
        everything.id.should.equal(currId);

        byId.issueDate.should.equal(issueDate);
        everything.issueDate.should.equal(issueDate);

        byId.state.should.equal("ISSUED");
        everything.state.should.equal("ISSUED");

        byId.customerId.should.equal(customerId);
        everything.customerId.should.equal(customerId);


        for(const prod of byId.products){
            const insertedProd = shouldOrd[prod.SKUId];
            prod.SKUId.should.equal(insertedProd.SKUId);
            prod.description.should.equal(insertedProd.description);
            prod.price.should.equal(insertedProd.price);
            prod.qty.should.equal(insertedProd.qty);
        }
        for(const prod of everything.products){
            const insertedProd = shouldOrd[prod.SKUId];
            prod.SKUId.should.equal(insertedProd.SKUId);
            prod.description.should.equal(insertedProd.description);
            prod.price.should.equal(insertedProd.price);
            prod.qty.should.equal(insertedProd.qty);
        }

    })
}

function updateInternalOrder(title, expectedHTTPStatus, id, newState, products = undefined){
    it(title, async function(){
        let bodyToSend;
        let res;

        if(products === undefined){
            bodyToSend = {
                "newState":newState
            }
        }else{
            bodyToSend = {
                "newState":newState,
                "products":products
            }
        }

        res = await agent.put(`/api/internalOrders/${id}`)
            .send(bodyToSend);
        res.should.have.status(expectedHTTPStatus);
        if(res.status !== 200)
            return;

        res = await agent.get(`/api/internalOrders/${id}`);
        res.should.have.status(200);
        if(res.status !== 200)
            return;

        res.body.state.should.equal(newState);
        if(newState === "COMPLETED"){
            // create a map, in order to direct access to the prod
            let shouldProd = {};
            for(const prod of products){
                shouldProd[prod.RFID] = prod;
            }

            for(const product of res.body.products){
                const insertedProd = shouldProd[product.RFID];
                product.SKUId.should.equal(insertedProd.SkuId);
                product.RFID.should.equal(insertedProd.RFID);
            }

        }

    })
}