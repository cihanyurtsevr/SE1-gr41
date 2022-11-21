'use strict';
const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
chai.should();
const restockOrderDao = require('../src/models/RestockOrder');
const itemDao = require('../src/models/Item');
const userDao = require('../src/models/User');
const skuDao = require('../src/models/SKU');
const skuItemDao = require('../src/models/SKUItem');


const app = require("../server");
const dayjs = require('dayjs');
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
const itemsToAddWrongSample = [
    {
        "SKUId":3,
        "rfid":"12345678901234567890123456789008"
    },
    {
        "SKUId":3,
        "rfid":"12345678901234567890123456789009"
    },
    {
        "SKUId":3,
        "rfid":"12345678901234567890123456789010"
    },
    {
        "SKUId":3,
        "rfid":"12345678901234567890123456789011"
    }
]

let currentId ;

describe("Scenario 3-1/2 Restock Order of SKU S issued", () => {
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
    })

    newRestockOrder("test correct insert",201,
    "2021/11/29 09:33",
    [
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
    1
    )
    newRestockOrder("test wrong date1", 422,
        "2021/11/34 09:33",
        [
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
        1
    )
    newRestockOrder("test wrong date2", 422,
        "2021/11/20 09:90",
        [
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
        1
    )
    newRestockOrder("test SKUId that isn't in SKU but in Item ",201,
    "2021/11/29 09:33",
    [
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
    1
    )
    newRestockOrder("test correct insert with string SKU",201,
    "2021/11/29 09:33",
    [
        {
            "SKUId":"1",
            "itemId":1,
            "description":"altra pasta",
            "price": 0.50,
            "qty":20
        },
        {
            "SKUId":"2",
            "itemId":2,
            "description":"altro riso",
            "price": 1.50,
            "qty":10
        }
    ],
    1
    )
    newRestockOrder("test negative price", 422,
    "2021/11/29 09:33",
    [
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
            "price": -1.50,
            "qty":10
        }
    ],
    1
    )
    newRestockOrder("test negative qty",422,
    "2021/11/29 09:33",
    [
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
            "qty":-10
        }
    ],
    1
    )
    newRestockOrder("test SKUId Of item not given by that supplier",422,
    "2021/11/29 09:33",
    [
        {
            "SKUId":4,
            "itemId":4,
            "description":"altra pasta",
            "price": 0.50,
            "qty":20
        },
        {
            "SKUId":5,
            "itemId":5,
            "description":"altro riso",
            "price": 1.50,
            "qty":10
        }
    ],
    1
    )
    newRestockOrder("test wrong supplier",422,
    "2021/11/29 09:33",
    [
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
    3
    )

})

describe("update status restock order", () => {
    before(async function() {
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

        for(let i=0; i<restockOrderSamples.length; i++)
            await restockOrderDao.insertNewRestockOrder(restockOrderSamples[i]);
    })

    updateRestockOrderStatus("test change status to ISSUED", 200, 1, "ISSUED");
    updateRestockOrderStatus("test change status to DELIVERY", 200, 1, "DELIVERY");
    updateRestockOrderStatus("test change status to DELIVERED", 200, 1, "DELIVERED");
    updateRestockOrderStatus("test change status to TESTED", 200, 1, "TESTED");
    updateRestockOrderStatus("test change status to COMPLETEDRETURN", 200, 1, "COMPLETEDRETURN");
    updateRestockOrderStatus("test change status to COMPLETED", 200, 1, "COMPLETED");

    updateRestockOrderStatus("test change status to ISSUED", 404, 5, "ISSUED");
    updateRestockOrderStatus("test change status to DELIVERY", 404, 6, "DELIVERY");
    updateRestockOrderStatus("test change status to DELIVERED", 404, 7, "DELIVERED");
    updateRestockOrderStatus("test change status to TESTED", 404, 8, "TESTED");
    updateRestockOrderStatus("test change status to COMPLETEDRETURN", 404, 9, "COMPLETEDRETURN");
    updateRestockOrderStatus("test change status to COMPLETED", 404, 10, "COMPLETED");

    updateRestockOrderStatus("test change status to ISSUED", 422, 1, "cane");
    updateRestockOrderStatus("test change status to DELIVERY", 422, 1, 3);
    updateRestockOrderStatus("test change status to DELIVERED", 422, 1, undefined);
    updateRestockOrderStatus("test change status to TESTED", 422, 1, "TESTED1");

})

describe("update transport note", () => {
    before(async function() {
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
        await restockOrderDao.updateRestockOrderStatus(1, "DELIVERY")
        await restockOrderDao.updateRestockOrderStatus(2, "DELIVERY")
    })

    updateTransportNote("correct update transport note", 200, 1, transpNoteSample);
    updateTransportNote("transp note without delivery date", 422, 1, {});
    updateTransportNote("wrong restock id", 404, 4, transpNoteSample);
    updateTransportNote("wrong restock id", 422, "ciao", transpNoteSample);
    updateTransportNote("wrong restock id", 422, -1, transpNoteSample);

    updateTransportNote("order state != DELIVERY", 422, 3, transpNoteSample);

    it("deliveryDate is before issueDate", async function() {
        let bodyToSend = {
            "transportNote": "1999/12/14 12:30"
        }
        let res = await agent.put(`/api/restockOrder/1/transportNote`)
            .send(bodyToSend);
        res.should.have.status(422);
    } )
})

describe("Add a non empty list of skuItems to a restock order", () => {
    before(async function() {
        // setup sku
        await skuDao.deleteTable();
        await skuDao.createTable();

        for(let i=0; i<skuSamples.length; i++)
            await skuDao.insertNewSKU(skuSamples[i]);
        
        // setup skuItem
        await skuItemDao.deleteTable();
        await skuItemDao.createTable();

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
    })

    addSkuItems("correct addition", 200, 1, itemsToAddSample1);

    addSkuItems("correct addition items not requested", 200, 2, [itemsToAddSample2[0], itemsToAddSample2[4]]);
    addSkuItems("correct addition in restock with not empty array of skuItem [if before test works]", 200, 2, [itemsToAddSample2[1], itemsToAddSample2[5]]);
    
    addSkuItems("test wrong restockOrderId", 404, 4, [itemsToAddSample1[0], itemsToAddSample2[4]]);
    addSkuItems("test uncorrect restockOrderId", 422, "a", [itemsToAddSample1[0], itemsToAddSample2[4]]);
    addSkuItems("test uncorrect restockOrderId", 422, 0, [itemsToAddSample1[0], itemsToAddSample2[4]]);
    addSkuItems("test wrong body SKUId", 422, 1, [{
        "SKUId":"ciao",
        "itemId": 10,
        "rfid":"12345678901234567890123456789000"
    }]);
    addSkuItems("test SKUId don't saved into db", 422, 1, [{
        "SKUId":10,
        "itemId" : 10,
        "rfid":"12345678901234567890123456789000"
    }]);
    addSkuItems("test SKUId in string", 200, 1, [{
        "SKUId":"1",
        "itemId": 1,
        "rfid":"12345678901234567890123456789008"
    }]);
    addSkuItems("test rfid wrong with 33 chars", 422, 1, [{
        "SKUId":2,
        "itemId":2,
        "rfid":"123456789012345678901234567890001"
    }]);
    addSkuItems("test rfid wrong with 30 chars", 422, 1, [{
        "SKUId":2,
        "itemId":2,
        "rfid":"123456789012345678901234567890"
    }]);
    addSkuItems("test rfid with strange id", 200, 1, [{
        "SKUId":2,
        "itemId":2,
        "rfid":"12345678901234567890123456789aaa"
    }]);

    addSkuItems("test restockOrder that isn't DELIVERED", 422, 3, [{
        "SKUId": 2 ,
        "itemId": 1,
        "rfid":"12345678901234567890123456789009"
    }]);
})

function newRestockOrder(title, expectedHTTPStatus, issueDate, products, supplierId){
    it(title, async function(){
        let restockOrder = {
            "issueDate":issueDate,
            "products": products,
            "supplierId" : supplierId
        }

        let res = await agent.post("/api/restockOrder")
            .send(restockOrder);
        res.should.have.status(expectedHTTPStatus);

        if(res.status != 201)
            return

        currentId++;

        // check if everything is uploaded correctly

        let mapProd = {}
        for(const prod of products){
            mapProd[prod.SKUId] = prod;
        }

        res = await agent.get(`/api/restockOrders/${currentId}`)
        let insertedRO = res.body;
        dayjs(insertedRO.issueDate).format("YYYY/MM/DD HH:mm").should.equal(dayjs(issueDate).format("YYYY/MM/DD HH:mm"));
        insertedRO.state.should.equal("ISSUED")
        insertedRO.supplierId.should.equal(supplierId)
        for(const product of insertedRO.products){
            let insertedProd = mapProd[product.SKUId];
            product.SKUId.should.equal(parseInt(insertedProd.SKUId));
            product.itemId.should.equal(insertedProd.itemId);
            product.description.should.equal(insertedProd.description)
            product.price.should.equal(insertedProd.price);
            product.qty.should.equal(insertedProd.qty);
        }
    })
}

function updateRestockOrderStatus(title, expectedHTTPStatus, restockOrdId, newState){
    it(title, async function(){
        let bodyToSend = {
            "newState":newState
        }

        let res = await agent.put(`/api/restockOrder/${restockOrdId}`)
            .send(bodyToSend)
        res.should.have.status(expectedHTTPStatus);

        if(res.status != 200)
            return

        res = await agent.get(`/api/restockOrders/${restockOrdId}`)
        let modifiedRO = res.body;
        modifiedRO.state.should.equal(newState);
        
    })
}

function updateTransportNote(title, expectedHTTPStatus, restockOrderId, transpNote){
    it(title, async function() {
        let bodyToSend = {
            "transportNote": transpNote
        }

        let res = await agent.put(`/api/restockOrder/${restockOrderId}/transportNote`)
            .send(bodyToSend);
        res.should.have.status(expectedHTTPStatus);

        if(res.status != 200)
            return

        let restockOrd = await restockOrderDao.getRestockOrderById(restockOrderId);
        let transportNote = await restockOrderDao.getTransportNoteById(restockOrd.transportNote);
        dayjs(transportNote.deliveryDate).format("YYYY/MM/DD HH:mm").should.equal(dayjs(transpNote.deliveryDate).format("YYYY/MM/DD HH:mm"));
    })
}

function addSkuItems(title, expectedHTTPStatus, restockOrderId, skuItems){
    it(title, async function(){
        let bodyToSend;
        let res;

        // get the list of skuItem already present into the restockOrder
        res = await agent.get(`/api/restockOrders/${restockOrderId}`);
        // res.should.have.status(expectedHTTPStatus);
        if(res.status !== 200 )
            return;
        let oldSkuItems = [...(res.body.skuItems == undefined ? [] : res.body.skuItems)];

        // add the SKUItems in db before adding them on restock order
        for(const skuItem of skuItems){
            bodyToSend = {
                "RFID":skuItem.rfid,
                "SKUId":skuItem.SKUId,
                "DateOfStock": dayjs().format("YYYY/MM/DD HH:mm")
            }
            res = await agent.post("/api/skuitem")
                .send(bodyToSend);
        }

        bodyToSend = {
            "skuItems": skuItems
        };
        // add new items
        res = await agent.put(`/api/restockOrder/${restockOrderId}/skuItems`)
            .send(bodyToSend);
        res.should.have.status(expectedHTTPStatus);

        let shouldSkuItems;
        if(res.status === 200){
            // if passed do check on new skuItems
            shouldSkuItems = [...oldSkuItems, ...skuItems];
        }else{
            // if not passed do check on old skuItem
            shouldSkuItems = [...oldSkuItems]
        }

        // get the new list of skuItem
        res = await agent.get(`/api/restockOrders/${restockOrderId}`);
        // res.should.have.status(expectedHTTPStatus);
        if(res.status !== 200 )
            return;
        // compare the new list of skuItem with the list that there should be
        let count = 0;
        if(res.body.skuItems == undefined)
            res.body.skuItems = [];
        for(const skuItem of res.body.skuItems){
            for(const shouldSKUItem of shouldSkuItems){
                if(skuItem.SKUId == shouldSKUItem.SKUId
                    && skuItem.rfid == shouldSKUItem.rfid){
                        count++;
                        break;
                    }
            }
        }
        count.should.equal(shouldSkuItems.length);
        
    })
}