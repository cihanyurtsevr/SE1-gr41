'use strict';
const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
chai.should();
const skuItemDao = require('../src/models/SKUItem');
const skuDao = require('../src/models/SKU');


const app = require("../server");
const dayjs = require("dayjs");
const agent = chai.request.agent(app);

const skuSample = {
    description: "pasta",
    weight : 0.5,
    volume : 1,
    notes : "barilla",
    price : 0.47,
    availableQuantity : 8
}

const skuItemSample = {
    RFID : "12345678901234567890123456789015",
    SKUId : 1,
    DateOfStock : "2021/11/29 12:30"
}

describe('post SKU Item', () => {
    beforeEach(async function(){
        await skuItemDao.deleteTable();
        await skuDao.deleteTable();
        await skuItemDao.createTable();
        await skuDao.createTable();

        await skuDao.insertNewSKU(skuSample);
    })

    newSKUItem("test correct data with hours", 201, "12345678901234567890123456789015", 1, "2021/11/29 12:30");
    newSKUItem("test correct data without hours", 201, "12345678901234567890123456789015", 1, "2021/11/29");
    newSKUItem("test skuId is string", 201, "12345678901234567890123456789015", "1", "2021/11/29");
    newSKUItem("test strange RFID", 201, "123456789012345678901234567890aa", 1, "2021/11/29");

    newSKUItem("test wrong rfid", 422, "123456789012345678901234567890151", 1, "2021/11/29 12:30");
    newSKUItem("test wrong SKUId", 422, "12345678901234567890123456789015", 0, "2021/11/29 12:30");
    newSKUItem("test wrong DateOfStock1", 422, "12345678901234567890123456789015", 1, "20221/11/29")
    newSKUItem("test wrong DateOfStock2", 422, "12345678901234567890123456789015", 1, "2022/11/29 12:30:11")
    newSKUItem("test wrong DateOfStock3", 422, "12345678901234567890123456789015", 1, "2022/13/32 12:30")

    newSKUItem("test not existing SKU", 404, "12345678901234567890123456789015", 2, "2021/11/29 12:30")
    
})

describe('put SKU Item', () => {
    beforeEach(async function(){
        await skuItemDao.deleteTable();
        await skuDao.deleteTable();
        await skuItemDao.createTable();
        await skuDao.createTable()

        await skuDao.insertNewSKU(skuSample);
        await skuItemDao.insertNewSKUItem(skuItemSample);
    })

    updateSKUItem("test correct put", 200, "12345678901234567890123456789015", "12345678901234567890123456789016", 0, "2021/12/29");
    updateSKUItem("test update only rfid", 200, "12345678901234567890123456789015", "12345678901234567890123456789016", undefined, undefined);
    updateSKUItem("test update only availability", 200, "12345678901234567890123456789015", undefined, 0, undefined);
    updateSKUItem("test update only dateofStock", 200, "12345678901234567890123456789015", undefined, undefined, "2021/12/29");


    updateSKUItem("test wrong rfid", 422, "123456789012345678901234567890151", "12345678901234567890123456789015", 1, "2021/11/29 12:30")
    updateSKUItem("test wrong rfid", 422, "12345678901234567890123456789015", "123456789012345678901234567890156", undefined, undefined)
    updateSKUItem("test wrong availability", 422, "12345678901234567890123456789015", undefined, 2, undefined);
    updateSKUItem("test wrong dateOfStock1", 422, "12345678901234567890123456789015", undefined, undefined, "20221/11/29");
    updateSKUItem("test wrong dateOfStock2", 422, "12345678901234567890123456789015", undefined, undefined, "2022/11/29 12:30:11");
    updateSKUItem("test wrong dateOfStock3", 422, "12345678901234567890123456789015", undefined, undefined, "2022/13/32 12:30");

    updateSKUItem("test rfid doesn't exists", 404, "12345678901234567890123456789014", "12345678901234567890123456789015", 1, "2021/11/29 12:30")

    it("test update with an rfid already existing", async function(){

        await skuItemDao.insertNewSKUItem({
            RFID : "12345678901234567890123456789016",
            SKUId : 1,
            DateOfStock : "2021/11/29 12:30"
        })

        let oldRfid = "12345678901234567890123456789015"
        let newRfid = "12345678901234567890123456789016"

        let mod = {
            "newRFID" : newRfid
        }

        let oldSkuItem = await skuItemDao.getSKUItemByRFID(oldRfid);
        let res = await agent.put(`/api/skuitems/${oldRfid}`)
            .send(mod);
        res.should.have.status(422)

        if(oldSkuItem == undefined)
            return

        let rfid = oldSkuItem.RFID;
        let available = oldSkuItem.Available;
        let dateOfStock = oldSkuItem.DateOfStock;
        if(res.status == 200){
            rfid = newRfid != undefined ? newRfid : oldSkuItem.RFID;
            available = newAvailable != undefined ? newAvailable : oldSkuItem.Available;
            dateOfStock = newDateOfStock;
        }

        let skuItem = await skuItemDao.getSKUItemByRFID(rfid);
        skuItem.Available.should.equal(available);
        dayjs(skuItem.DateOfStock).format("YYYY/MM/DD HH:mm").should.equal(dateOfStock == undefined ? "Invalid Date" : dayjs(dateOfStock).format("YYYY/MM/DD HH:mm"))
    })
})

function newSKUItem(title, expectedHTTPStatus, rfid, skuId, dateOfStock){
    it(title, async function(){
        let SKUItem = {
            "RFID" : rfid,
            "SKUId" : skuId,
            "DateOfStock" : dateOfStock
        }
        let res = await agent.post("/api/skuitem")
        .send(SKUItem);
        res.should.have.status(expectedHTTPStatus);

        let skuItem = await skuItemDao.getSKUItemByRFID(rfid)
        if(skuItem != undefined){
            skuItem.RFID.should.equal(rfid);
            skuItem.SKUId.should.equal(parseInt(skuId));
            skuItem.Available.should.equal(0);
            dayjs(skuItem.DateOfStock).format("YYYY/MM/DD HH:mm").should.equal(dayjs(dateOfStock).format("YYYY/MM/DD HH:mm"));
        }
        
    })    
}

function updateSKUItem(title, expectedHTTPStatus, oldRfid, newRfid, newAvailable, newDateOfStock){
    it(title, async function(){
        let mod = {
            "newRFID" : newRfid,
            "newAvailable" : newAvailable,
            "newDateOfStock" : newDateOfStock
        }
        let oldSkuItem = await skuItemDao.getSKUItemByRFID(oldRfid);
        let res = await agent.put(`/api/skuitems/${oldRfid}`)
            .send(mod);
        res.should.have.status(expectedHTTPStatus)

        if(oldSkuItem == undefined)
            return

        let rfid = oldSkuItem.RFID;
        let available = oldSkuItem.Available;
        let dateOfStock = oldSkuItem.DateOfStock;
        if(res.status == 200){
            rfid = newRfid != undefined ? newRfid : oldSkuItem.RFID;
            available = newAvailable != undefined ? newAvailable : oldSkuItem.Available;
            dateOfStock = newDateOfStock;
        }

        let skuItem = await skuItemDao.getSKUItemByRFID(rfid);
        skuItem.Available.should.equal(available);
        dayjs(skuItem.DateOfStock).format("YYYY/MM/DD HH:mm").should.equal(dateOfStock == undefined ? "Invalid Date" : dayjs(dateOfStock).format("YYYY/MM/DD HH:mm"))

    })
}