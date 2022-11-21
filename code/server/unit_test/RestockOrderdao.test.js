const restockOrdDao = require('../src/models/RestockOrder');



describe('testDesDao', () => {
    const sampleTestDesc = {

        issueDate: "2021/11/29 09:33",
        supplierId: 1,
        products: [
            {
                SKUId:7,
                description:"altra pasta",
                price: 0.50,
                qty:20
            },
            {
                SKUId:8,
                description:"altro riso",
                price: 1.50,
                qty:10
            }
        ]
    }

    const sampleRestock = {

        issueDate: "2021/11/29 09:33",
        supplierId: -2,
        products: [
            {
                SKUId:7,
                description:"altra pasta",
                price: 0.50,
                qty:20
            },
            {
                SKUId:8,
                description:"altro riso",
                price: 1.50,
                qty:10
            }
        ]
    }

    
    
    beforeAll(async () => {
        await restockOrdDao.deleteTableRestockOrder();
        await restockOrdDao.createTableRestockOrder();
        await restockOrdDao.deleteJoinTable();
    });
    afterEach(async () => {
        await restockOrdDao.deleteTableRestockOrder();
        await restockOrdDao.createTableRestockOrder();
        await restockOrdDao.deleteJoinTable();
    });

    test('delete db', async () => {
        var res = await restockOrdDao.getRestockOrders();
        expect(res.length).toStrictEqual(0);
    }); 
    testNewRestock(sampleTestDesc);
    testNewRestockRR(sampleRestock);
});

function testNewRestock(newRestOrd) {
    test('create new item', async () => {
        
        await restockOrdDao.insertNewRestockOrder(newRestOrd);
        // console.log("ARRIVED HERE AFTER INSERTION")
        var res = await restockOrdDao.getRestockOrders();
        // console.log("ARRIVED HERE AFTER GET")
        var ID= res[res.length-1].id 
        //expect(res.length).toStrictEqual(8);
        
        res = await restockOrdDao.getRestockOrderById(ID);
        //console.log(res);
        
        expect(res.issueDate).toStrictEqual(newRestOrd.issueDate);
        expect(res.supplierId).toStrictEqual(newRestOrd.supplierId);
       
       
    })
};


function testNewRestockRR(newRestOrd) {
    test('create new item', async () => {
        
        await restockOrdDao.insertNewRestockOrder(newRestOrd);
        // console.log("ARRIVED HERE AFTER INSERTION")
        var res = await restockOrdDao.getRestockOrders();
        // console.log("ARRIVED HERE AFTER GET")
        var ID= res[res.length-1].id 
        //expect(res.length).toStrictEqual(8);
        
        res = await restockOrdDao.getRestockOrderById(ID);
        //console.log(res);
        
        expect(res.issueDate).toStrictEqual(newRestOrd.issueDate);
        expect(res.supplierId).toStrictEqual(404);
       
       
    })
};


