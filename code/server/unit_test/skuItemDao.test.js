const skuItemDao = require('../src/models/SKUItem');


describe('testDao', () => {
    
    const sampleSkuItem = {

        RFID : "12345678912345678912346578912345",
        SKUId : 5,
        DateOfStock : "2022/02/02 00:00"

    }
    
    beforeAll(async () => {
        await skuItemDao.deleteSkuItemData();
    });
    
    afterEach(async () => {
        await skuItemDao.deleteSkuItemData();
    });

    
    test('delete db', async () => {
        var res = await skuItemDao.getSKUItems();
        expect(res.length).toStrictEqual(0);
    });


    testInsertNewSkuItem(sampleSkuItem);
    testInsertNewSkuItemErr();
    testInsertOrder();
    

});


function testInsertNewSkuItem(skuItemToTest) {

    test('create new sku item', async () => {
        
        await skuItemDao.insertNewSKUItem(skuItemToTest);
        // console.log("ARRIVED HERE AFTER INSERTION")
        var res = await skuItemDao.getSKUItems();
        // console.log("ARRIVED HERE AFTER GET")

        expect(res.length).toStrictEqual(1);
        
        
        res = await skuItemDao.getSKUItemByRFID(skuItemToTest.RFID);
        expect(res.RFID).toStrictEqual(skuItemToTest.RFID);
        expect(res.Available).toStrictEqual(0);
        expect(res.DateOfStock).toStrictEqual(skuItemToTest.DateOfStock);
        
    });

    test('get sku item by id', async () => {

        const updateSkuItem = {

            newRFID : "12345678912345678912346578912347",
            newAvailable : 1,
            newDateOfStock : "2022/02/01 00:00"
    
        }
        
        await skuItemDao.insertNewSKUItem(skuItemToTest);
        await skuItemDao.updateSKUItem(updateSkuItem, skuItemToTest.RFID);
        
        
        var res = await skuItemDao.getSKUItemById(skuItemToTest.SKUId);
        
        
        expect(res.length).toStrictEqual(1);
        
    });



    test('delete sku item', async () => {

        const sampleSkuItem = {

            RFID : "12345678912345678912346578912345",
            SKUId : 5,
            DateOfStock : "2022/02/02 00:00"
    
        }

        
        await skuItemDao.insertNewSKUItem(sampleSkuItem);
        // console.log("ARRIVED HERE AFTER INSERTION")
        await skuItemDao.deleteSKUItem(sampleSkuItem.RFID)
        var res = await skuItemDao.getSKUItems();
        // console.log("ARRIVED HERE AFTER GET")

        expect(res.length).toStrictEqual(0);
        
    });


    test('create new sku item and change RFID, available and date of stock', async () => {
        
        const sampleSkuItem = {

            RFID : "12345678912345678912346578912345",
            SKUId : 5,
            DateOfStock : "2022/02/02 00:00"
    
        }

        const updateSkuItem = {

            newRFID : "12345678912345678912346578912347",
            newAvailable : 1,
            newDateOfStock : "2022/02/01 00:00"
    
        }

        await skuItemDao.insertNewSKUItem(sampleSkuItem);
        await skuItemDao.updateSKUItem(updateSkuItem, sampleSkuItem.RFID);
        
        var res = await skuItemDao.getSKUItemByRFID(updateSkuItem.newRFID);

        expect(res.RFID).toStrictEqual(updateSkuItem.newRFID);
        expect(res.Available).toStrictEqual(updateSkuItem.newAvailable);
        expect(res.DateOfStock).toStrictEqual(updateSkuItem.newDateOfStock);

        

    });


}


function testInsertNewSkuItemErr(){

    test('create new sku item with RFID not 32 char long', async () => {
        
        const sampleSkuItemErrRFID = {

            RFID : "1234567891234567891234657891234",
            SKUId : 5,
            DateOfStock : "2022/02/02 00:00"
    
        }
    
        var res = "no error";
        try{
            await skuItemDao.insertNewSKUItem(sampleSkuItemErrRFID);
        }
        catch(err){
            res = "error";
        }
        expect(res).toStrictEqual("error");

    });


    test('create new sku item with SKUID = 0', async () => {
        const sampleSkuItemErrSKUid = {

            RFID : "12345678912345678912346578912345",
            SKUId : 0,
            DateOfStock : "2022/02/02 00:00"
    
        }
    
        var res = "no error";
        try{
            await skuItemDao.insertNewSKUItem(sampleSkuItemErrSKUid);
        }
        catch(err){
            res = "error";
        }
        expect(res).toStrictEqual("error");
        

    });

    
}

function testInsertOrder(){

    test('create new sku item and insert internal, return and restock order', async () => {

        const sampleSkuItem = {

            RFID : "12345678912345678912346578912345",
            SKUId : 1,
            DateOfStock : "2022/02/02 00:00"
    
        }
        await skuItemDao.insertNewSKUItem(sampleSkuItem);
        
        await skuItemDao.insertInternalOrder(sampleSkuItem.RFID, 6);
        await skuItemDao.insertRestockOrder(sampleSkuItem.RFID, 7);
        await skuItemDao.insertReturnOrder(sampleSkuItem.RFID, 8);

        var res1 = await skuItemDao.getSKUItemByRFID(sampleSkuItem.RFID);
       // console.log(res1);
        expect(res1.internalOrderId).toStrictEqual(6);
        expect(res1.restockOrderId).toStrictEqual(7);
        expect(res1.returnOrderId).toStrictEqual(8);
        
        var res2 = await skuItemDao.getSKUItemByInternalOrderId(6);
        expect(res2.length).toStrictEqual(1);

    });
}
