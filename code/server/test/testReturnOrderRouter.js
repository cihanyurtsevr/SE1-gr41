'use strict';
const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
chai.should();

const app = require("../server");
const dayjs = require('dayjs');
const skuDao = require("../src/models/SKU");
const skuItemDao = require("../src/models/SKUItem")
const itemDao = require("../src/models/Item");
const userDao = require("../src/models/User");
const restockOrderDao = require("../src/models/RestockOrder");
const returnOrderDao = require("../src/models/ReturnOrder")
const {Warehouse} = require("../src/controllers/Warehouse");
const agent = chai.request.agent(app);

const skuSamples = [
    {
        "description": "pasta",
        "weight" : 0.5,
        "volume" : 1,
        "notes" : "barilla",
        "price" : 0.47,
        "availableQuantity" : 8
    },
    {
        "description" : "riso",
        "weight" : 1,
        "volume" : 2,
        "notes" : "basmati",
        "price" : 1.32,
        "availableQuantity" : 10
    }
]

const itemSamples = [
    {
        "id" : 1,
        "description" : "pasta",
        "price" : 0.47,
        "SKUId" : 1,
        "supplierId" : 1
    },
    {
        "id" : 2,
        "description" : "riso",
        "price" : 1.32,
        "SKUId" : 2,
        "supplierId" : 1
    },
    {
        "id" : 3,
        "description" : "farro",
        "price" : 2,
        "SKUId" : 3,
        "supplierId" : 1
    },
    {
        "id" : 4,
        "description" : "pasta",
        "price" : 0.64,
        "SKUId" : 1,
        "supplierId" : 2
    },
    {
        "id" : 5,
        "description" : "riso",
        "price" : 0.89,
        "SKUId" : 2,
        "supplierId" : 2
    }
]

const supplierSamples = [
    {
        "username":"michelino@ezwh.it",
        "name":"Michele",
        "surname" : "Cerra",
        "password" : "passwordDebole",
        "type" : "supplier"
    },
    {
        "username":"michele@ezwh.it",
        "name":"Miao",
        "surname" : "Gatto",
        "password" : "passwordCarina",
        "type" : "supplier"
    }
]

const restockOrderSamples = [
    {
        "issueDate":"2021/11/29 09:33",
        "products": [
            {
                "SKUId":1,
                "itemId":1,
                "description":"altra pasta",
                "price": 0.50,
                "qty":20
            },
            {
                "SKUId":2,
                "itemId":2,
                "description":"altro riso",
                "price": 1.50,
                "qty":10
            }
        ],
        "supplierId" : 1
    },
    {
        "issueDate":"2021/11/29",
        "products": [
            {
                "SKUId":1,
                "itemId":4,
                "description":"altra pasta",
                "price": 0.50,
                "qty":20
            },
            {
                "SKUId":2,
                "itemId":5,
                "description":"altro riso",
                "price": 1.50,
                "qty":10
            }
        ],
        "supplierId" : 2
    },
    {
        "issueDate":"2021/11/15 09:33",
        "products": [
            {
                "SKUId":3,
                "itemId":3,
                "description":"altro farro",
                "price": 0.50,
                "qty":20
            },
            {
                "SKUId":2,
                "itemId":2,
                "description":"altro riso",
                "price": 1.50,
                "qty":10
            }
        ],
        "supplierId" : 1
    }

]

const transpNoteSample = {
    "deliveryDate":"2021/12/29"
}

const itemsToAddSample1 = [
    {
        "SKUId":1,
        "itemId":1,
        "rfid":"12345678901234567890123456789000"
    },
    {
        "SKUId":1,
        "itemId":1,
        "rfid":"12345678901234567890123456789001"
    },
    {
        "SKUId":1,
        "itemId":1,
        "rfid":"12345678901234567890123456789002"
    },
    {
        "SKUId":1,
        "itemId":1,
        "rfid":"12345678901234567890123456789003"
    },
    {
        "SKUId":2,
        "itemId":2,
        "rfid":"12345678901234567890123456789004"
    },
    {
        "SKUId":2,
        "itemId":2,
        "rfid":"12345678901234567890123456789005"
    },
    {
        "SKUId":2,
        "itemId":2,
        "rfid":"12345678901234567890123456789006"
    },
    {
        "SKUId":2,
        "itemId":2,
        "rfid":"12345678901234567890123456789007"
    }
]
const itemsToAddSample2 = [
    {
        "SKUId":1,
        "itemId":4,
        "rfid":"12345678901234567890123456789010"
    },
    {
        "SKUId":1,
        "itemId":4,
        "rfid":"12345678901234567890123456789011"
    },
    {
        "SKUId":1,
        "itemId":4,
        "rfid":"12345678901234567890123456789012"
    },
    {
        "SKUId":1,
        "itemId":4,
        "rfid":"12345678901234567890123456789013"
    },
    {
        "SKUId":2,
        "itemId":5,
        "rfid":"12345678901234567890123456789014"
    },
    {
        "SKUId":2,
        "itemId":5,
        "rfid":"12345678901234567890123456789015"
    },
    {
        "SKUId":2,
        "itemId":5,
        "rfid":"12345678901234567890123456789016"
    },
    {
        "SKUId":2,
        "itemId":5,
        "rfid":"12345678901234567890123456789017"
    }
]

const productsReturnSample = [
    {
        "SKUId":1,
        "itemId":1,
        "description": "a product",
        "price": 10.99,
        "RFID":"12345678901234567890123456789003"
    },
    {
        "SKUId":2,
        "itemId":2,
        "description" : "another product",
        "price": 11.99,
        "RFID":"12345678901234567890123456789004"
    }
]
const productsReturnSample2 = [
    {
        "SKUId":1,
        "itemId":4,
        "description": "a product",
        "price": 10.99,
        "RFID":"12345678901234567890123456789005"
    },
    {
        "SKUId":2,
        "itemId":5,
        "description" : "another product",
        "price": 11.99,
        "RFID":"12345678901234567890123456789006"
    }
]

let currentId

describe("test post return order", () => {
    before(async function() {
        currentId = 0;
        // setup skuItem
        await skuDao.deleteTable();
        await skuDao.createTable();

        for(let i=0; i<skuSamples.length; i++)
            await skuDao.insertNewSKU(skuSamples[i]);

        // setup item
        await itemDao.deleteTable();
        await itemDao.createTable();

        for(let i=0; i<itemSamples.length; i++)
            await itemDao.insertNewItem(itemSamples[i]);

        // setup supplier
        await userDao.deleteTable();
        await userDao.createTable();

        for(let i=0; i<supplierSamples.length; i++)
            await userDao.insertNewUser(supplierSamples[i]);

        // setup restock order table
        await restockOrderDao.deleteTableRestockOrder();
        await restockOrderDao.createTableRestockOrder();
        await restockOrderDao.deleteTableJoinRstkOrdSKU();
        await restockOrderDao.createTableJoinRstkOrdSKU();
        await restockOrderDao.deleteTableTransportNote();
        await restockOrderDao.createTableTransportNote();

        for(let i=0; i<restockOrderSamples.length; i++){
            await restockOrderDao.insertNewRestockOrder(restockOrderSamples[i]);
        }

        await restockOrderDao.updateRestockOrderStatus(1, "DELIVERED")
        await restockOrderDao.updateRestockOrderStatus(2, "DELIVERED")


        await skuItemDao.deleteTable();
        await skuItemDao.createTable();
        for(const item of itemsToAddSample1){
            await skuItemDao.insertNewSKUItem({
                "RFID":item.rfid,
                "SKUId":item.SKUId,
                "DateOfStock": dayjs().format("YYYY/MM/DD HH:mm")
            });
        }
        await skuItemDao.insertNewSKUItem({
            "rfid": "1234567890123456789012345678900A",
            "SKUId": 1,
            "DateOfStock": dayjs().format("YYYY/MM/DD HH:mm")
        });

        await Warehouse.getInstance().OrderCtrl.putRestockOrderSKUItems(1, itemsToAddSample1)
        let res = await Warehouse.getInstance().OrderCtrl.putRestockOrderSKUItems(1, [{
            "rfid": "1234567890123456789012345678900A",
            "itemId":1,
            "SKUId": 1
        }])
        console.log(res);
        await Warehouse.getInstance().OrderCtrl.putRestockOrderSKUItems(2, itemsToAddSample2)


        await returnOrderDao.deleteTable();
        await returnOrderDao.createTable();
    })

    newReturnOrder("test correct return order", 201, "2021/11/29 09:33", productsReturnSample, 2);

    newReturnOrder("test restock order doesn't exist", 404, "2021/11/29 09:33", productsReturnSample, 4);
    newReturnOrder("test validation of restock order", 422, "2021/11/29 09:33", productsReturnSample, -2);
    newReturnOrder("test validation return date1", 422, "2021/11/29 50:33", productsReturnSample, 1);
    newReturnOrder("test validation return date2", 422, "2021/11/50 09:33", productsReturnSample, 1);
    newReturnOrder("test validation return date2", 201, "2021/11/24", productsReturnSample2, 1);
    newReturnOrder("test validation invalid sku", 422, "2021/11/25", [{
        "SKUId":-1,
        "itemId":1,
        "description": "a product",
        "price": 10.99,
        "RFID":"12345678901234567890123456789003"
    }], 1);

    newReturnOrder("test not existing sku", 201, "2021/11/26", [{
        "SKUId":13,
        "itemId":1,
        "description": "a product",
        "price": 10.99,
        "RFID":"12345678901234567890123456789006"
    }], 1);

    newReturnOrder("test not existing itemId", 201, "2021/11/26", [{
        "SKUId":1,
        "itemId":113,
        "description": "a product",
        "price": 10.99,
        "RFID":"12345678901234567890123456789006"
    }], 1);

    newReturnOrder("test validation rfid too short", 422, "2021/11/27", [{
        "SKUId":1,
        "itemId":1,
        "description": "a product",
        "price": 10.99,
        "RFID":"1234567890123456789012345678900"
    }], 1);
    newReturnOrder("test validation rfid too long", 422, "2021/11/28", [{
        "SKUId":1,
        "itemId":1,
        "description": "a product",
        "price": 10.99,
        "RFID":"123456789012345678901234567890033"
    }], 1);

    newReturnOrder("test validation rfid with chars", 201, "2021/11/24", [{
        "SKUId":1,
        "itemId":1,
        "description": "a product",
        "price": 10.99,
        "RFID":"1234567890123456789012345678900A"
    }], 1);

    newReturnOrder("test validation negative price", 422, "2021/11/24", [{
        "SKUId":1,
        "itemId":1,
        "description": "a product",
        "price": -10.99,
        "RFID":"12345678901234567890123456789003"
    }], 1);


})

function newReturnOrder(title, expectedHTTPStatus, returnDate, products, restockOrderId){
    it(title, async function(){
        let returnOrder = {
            "returnDate": returnDate,
            "products": products,
            "restockOrderId" : restockOrderId
        }

        let res = await  agent.post("/api/returnOrder")
            .send(returnOrder);
        res.should.have.status(expectedHTTPStatus);

        if(res.status !== 201)
            return

        currentId++;

        let mapProd = {}
        for(const prod of products){
            mapProd[prod.RFID] = prod;
        }

        res = await agent.get(`/api/returnOrders/${currentId}`)
        let insertedREO = res.body;
        dayjs(insertedREO.returnDate).format("YYYY/MM/DD HH:mm").should.equal(dayjs(returnDate).format("YYYY/MM/DD HH:mm"));
        insertedREO.restockOrderId.should.equal(restockOrderId)
        for(const product of insertedREO.products){
            let insertedProd = mapProd[product.RFID];
            let skuItem = await agent.get(`/api/skuitems/${insertedProd.RFID}`)
            console.log("skuId: actual: ",product.SKUId," expected: ",skuItem.body.SKUId);
            product.SKUId.should.equal(parseInt(skuItem.body.SKUId));
            console.log("itemId: actual: ",product.itemId," expected: ",skuItem.body.itemId);
            product.itemId.should.equal(skuItem.body.SKUId);
            // product.description.should.equal(insertedProd.description)
            // product.price.should.equal(insertedProd.price);
            product.RFID.should.equal(insertedProd.RFID);
        }
    })
}