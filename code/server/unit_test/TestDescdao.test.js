const testDescDao = require('../src/models/TestDescriptor');



describe('testDesDao', () => {
    const sampleTestDesc = {

        name: "test descriptor 5",
        procedureDescription: "This  is described by CIHAN",
        idSKU: 2,
    }
    
    beforeAll(async () => {
        await testDescDao.deleteTestDescriptorData();
    });
    afterEach(async () => {
        await testDescDao.deleteTestDescriptorData();
    });

    test('delete db', async () => {
        var res = await testDescDao.getTestDescriptors();
        expect(res.length).toStrictEqual(0);
    });

    testNewItem(sampleTestDesc);

});

function testNewItem(newTestDescriptor) {
    test('create new item', async () => {
        
        await testDescDao.insertTestDescriptor(newTestDescriptor);
        // console.log("ARRIVED HERE AFTER INSERTION")
        var res = await testDescDao.getTestDescriptors();
        // console.log("ARRIVED HERE AFTER GET")

        //expect(res.length).toStrictEqual(8);
        
        res = await testDescDao.getTestDescriptorBySKUId(newTestDescriptor.idSKU);
       // console.log(res[0]);
        
        expect(res[0].name).toStrictEqual(newTestDescriptor.name);
        expect(res[0].procedureDescription).toStrictEqual(newTestDescriptor.procedureDescription);
        expect(res[0].idSKU).toStrictEqual(newTestDescriptor.idSKU);
       
    })
};