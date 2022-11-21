const itemDao = require('../src/models/Item');



describe('testDao', () => {
    const sampleNewId= {

        id: 6,
        description: "a new CIHAN item",
        price: 19.99,
        SKUId: 2,
        supplierId: 5
    }
    const sampleNewIdW= {

        id: 6,
        description: "a new CIHAN item",
        price: -1,
        SKUId: 2,
        supplierId: 5
    }

    beforeAll(async () => {
        await itemDao.deleteItemData();
    });
    afterEach(async () => {
        await itemDao.deleteItemData();
    });

    test('delete db', async () => {
        var res = await itemDao.getItems();
        expect(res.length).toStrictEqual(0);
    });

    testNewItem(sampleNewId);
    testNewItemW(sampleNewIdW);
});

function testNewItem(newid) {
    test('create new item', async () => {
        
        await itemDao.insertNewItem(newid);
        // console.log("ARRIVED HERE AFTER INSERTION")
        var res = await itemDao.getItems();
        // console.log("ARRIVED HERE AFTER GET")

        expect(res.length).toStrictEqual(1);
        
        res = await itemDao.getItem(newid.id);

        expect(res.description).toStrictEqual(newid.description);
        expect(res.price).toStrictEqual(newid.price);
        expect(res.SKUId).toStrictEqual(newid.SKUId);
        expect(res.supplierId).toStrictEqual(newid.supplierId);
    });
}

function testNewItemW(newid) {
    test('create new item', async () => {
        
        await itemDao.insertNewItem(newid);
        // console.log("ARRIVED HERE AFTER INSERTION")
        var res = await itemDao.getItems();
        // console.log("ARRIVED HERE AFTER GET")

        expect(res.length).toStrictEqual(1);
        
        res = await itemDao.getItem(newid.id);

        expect(res.description).toStrictEqual(newid.description);
        expect(res.price).toStrictEqual(404);
        expect(res.SKUId).toStrictEqual(newid.SKUId);
        expect(res.supplierId).toStrictEqual(newid.supplierId);
    });
}