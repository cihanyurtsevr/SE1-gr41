const returnOrdDao = require('../src/models/ReturnOrder');



describe('ReturnOrdDao', () => {
    const sampleTestDesc = {

        returnDate:  "2021/11/29 09:33",
        restockOrderId: 1,
        products: [
            {
                SKUId:10,
                description:"altra CIHAN",
                price: 0.50,
                RFID:"12345678901234567890123456789016"
            },
            {
                SKUId:11,
                description:"altro Fonsiona",
                price: 1.50,
                RFID:"12345678901234567890123456789038"
            }
        ] 
    }

    const sampleTestDescRO = {

        returnDate:  "2021/11/29 09:33",
        restockOrderId: -13,
        products: [
            {
                SKUId:10,
                description:"altra CIHAN",
                price: 0.50,
                RFID:"12345678901234567890123456789016"
            },
            {
                SKUId:11,
                description:"altro Fonsiona",
                price: 1.50,
                RFID:"12345678901234567890123456789038"
            }
        ] 
    }
    
    beforeAll(async () => {
        await returnOrdDao.deleteTable();
        await returnOrdDao.createTable();
 
    });
    afterEach(async () => {
        await returnOrdDao.deleteTable();
        await returnOrdDao.createTable();

    });

    test('delete db', async () => {
        var res = await returnOrdDao.getReturnOrders();
        expect(res.length).toStrictEqual(0);
    }); 
    testNewReturn(sampleTestDesc);
    testNewReturnRO(sampleTestDescRO);
});

function testNewReturn(newReturnOrder) {
    test('create new internal order', async () => {
        
        await returnOrdDao.insertReturnOrder(newReturnOrder);
        // console.log("ARRIVED HERE AFTER INSERTION")
        var res = await returnOrdDao.getReturnOrders();
        // console.log(res)
        var ID= res[res.length-1].id 
        //expect(res.length).toStrictEqual(8);
      //  console.log(ID)
        res = await returnOrdDao.getReturnOrderById(ID);
        //console.log(res);
       
        expect(res.returnDate).toStrictEqual(newReturnOrder.returnDate);
        expect(res.restockOrderId).toStrictEqual(newReturnOrder.restockOrderId);
       
       
    })
};

function testNewReturnRO(newReturnOrder) {
    test('create new internal order', async () => {
        
        await returnOrdDao.insertReturnOrder(newReturnOrder);
        // console.log("ARRIVED HERE AFTER INSERTION")
        var res = await returnOrdDao.getReturnOrders();
        // console.log(res)
        var ID= res[res.length-1].id 
        //expect(res.length).toStrictEqual(8);
       // console.log(ID)
        res = await returnOrdDao.getReturnOrderById(ID);
        //console.log(res);
       
        expect(res.returnDate).toStrictEqual(newReturnOrder.returnDate);
        expect(res.restockOrderId).toStrictEqual(404);
       
       
    })
};

