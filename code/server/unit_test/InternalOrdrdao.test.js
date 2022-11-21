const internalOrdDao = require('../src/models/InternalOrder');



describe('internalOrdDao', () => {
    const sampleTestDesc = {

        issueDate: "2021/11/29 09:33",
        customerId: 1,
        products: [
            {
                SKUId:10,
                description:"altra pasta",
                price: 0.50,
                qty:20
            },
            {
                SKUId:11,
                description:"altro riso",
                price: 1.50,
                qty:10
            }
        ]

        
    }
    
    beforeAll(async () => {
        await internalOrdDao.deleteTable();
        await internalOrdDao.createTable();
        await internalOrdDao.deleteTableJoinIntOrdSKU();
        await internalOrdDao.createTableJoinIntOrdSKU();
        
    });
    afterEach(async () => {
        await internalOrdDao.deleteTable();
        await internalOrdDao.createTable();
        await internalOrdDao.deleteJoinTable();
        await internalOrdDao.createTableJoinIntOrdSKU();
    });

    test('delete db', async () => {
        var res = await internalOrdDao.getInternalOrders();
        expect(res.length).toStrictEqual(0);
    }); 
    testNewInternal(sampleTestDesc);
});

function testNewInternal(newIntOrd) {
    test('create new internal order', async () => {
        
        await internalOrdDao.insertInternalOrder(newIntOrd);
        // console.log("ARRIVED HERE AFTER INSERTION")
        var res = await internalOrdDao.getInternalOrders();
        // console.log(res)
        var ID= res[res.length-1].id 
        //expect(res.length).toStrictEqual(8);
       // console.log(ID)
        res = await internalOrdDao.getInternalOrderById(ID);
        //console.log(res);
       
        expect(res.issueDate).toStrictEqual(newIntOrd.issueDate);
        expect(res.customerId).toStrictEqual(newIntOrd.customerId);
       
       
    })
};



