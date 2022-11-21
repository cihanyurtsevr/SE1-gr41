const SKUDao = require('../src/models/SKU');



describe('SKUDao', () => {
    const sampleTest = {

    description:  "a new sku",
    weight:1,
    volume:50,
    notes: "first SKU",
    price: 10.99,
    availableQuantity:50

    }
    const wrongTest = {

        description:  "a new sku",
        weight:-1,
        volume:50,
        notes: "first SKU",
        price: 10.99,
        availableQuantity:50
    
        }
        const wrongTest1 = {

            description:  "a new sku",
            weight:1,
            volume:-50,
            notes: "first SKU",
            price: 10.99,
            availableQuantity:50
        
            }
    
    beforeAll(async () => {
        await SKUDao.deleteTable();
        await SKUDao.createTable();
    });
    afterEach(async () => {
        await SKUDao.deleteTable();
        await SKUDao.createTable();
    });

    test('delete db', async () => {
        var res = await SKUDao.getSKUs();
        expect(res.length).toStrictEqual(0);
    });

    testNewResultP(sampleTest);
    testNewResultN(wrongTest)
    testNewResultD(wrongTest1)

});

function testNewResultP(newSKU) {
    test('create new item', async () => {
        
        await SKUDao.insertNewSKU(newSKU);
        // console.log("ARRIVED HERE AFTER INSERTION")
        var res = await SKUDao.getSKUs();
        // console.log("ARRIVED HERE AFTER GET")
        var ID= res[res.length-1].id 
        //expect(res.length).toStrictEqual(8);
        
        res = await SKUDao.getSKUById(ID);
        

        
        expect(res.description).toStrictEqual(newSKU.description);
        expect(res.weight).toStrictEqual(newSKU.weight);
        expect(res.volume).toStrictEqual(newSKU.volume);
        expect(res.notes).toStrictEqual(newSKU.notes);
        expect(res.price).toStrictEqual(newSKU.price);
        expect(res.availableQuantity).toStrictEqual(newSKU.availableQuantity);
        
    })
};

function testNewResultN(newSKU) {
    test('create new item', async () => {
        
        await SKUDao.insertNewSKU(newSKU);
        // console.log("ARRIVED HERE AFTER INSERTION")
        var res = await SKUDao.getSKUs();
        // console.log("ARRIVED HERE AFTER GET")
        var ID= res[res.length-1].id 
        //expect(res.length).toStrictEqual(8);
        
        res = await SKUDao.getSKUById(ID);
        

        
        expect(res.description).toStrictEqual(newSKU.description);
        expect(res.weight).toStrictEqual(404);
        expect(res.volume).toStrictEqual(newSKU.volume);
        expect(res.notes).toStrictEqual(newSKU.notes);
        expect(res.price).toStrictEqual(newSKU.price);
        expect(res.availableQuantity).toStrictEqual(newSKU.availableQuantity);
        
    })
};

function testNewResultD(newSKU) {
    test('create new item', async () => {
        
        await SKUDao.insertNewSKU(newSKU);
        // console.log("ARRIVED HERE AFTER INSERTION")
        var res = await SKUDao.getSKUs();
        // console.log("ARRIVED HERE AFTER GET")
        var ID= res[res.length-1].id 
        //expect(res.length).toStrictEqual(8);
        
        res = await SKUDao.getSKUById(ID);
        

        
        expect(res.description).toStrictEqual(newSKU.description);
        expect(res.weight).toStrictEqual(newSKU.weight);
        expect(res.volume).toStrictEqual(404);
        expect(res.notes).toStrictEqual(newSKU.notes);
        expect(res.price).toStrictEqual(newSKU.price);
        expect(res.availableQuantity).toStrictEqual(newSKU.availableQuantity);
        
    })
};