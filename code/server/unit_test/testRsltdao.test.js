const testRsltDao = require('../src/models/TestResult');



describe('testDesDao', () => {
    const sampleTestDesc = {

    rfid: "12345678901234567890123456789015",
    idTestDescriptor:2,
    Date:"2003/10/14",
    Result: false
    }
    const sampleTest = {

        rfid: "12345678901234567890123456789015",
        idTestDescriptor:-22,
        Date:"2003/10/14",
        Result: false
        }

        const sampleTestAA = {

            rfid: "12345678901234567890123456789014",
            idTestDescriptor:12,
            Date:"1997/10/14",
            Result: true
            }
        
    beforeAll(async () => {
        await testRsltDao.deleteTestResultData();
    });
    afterEach(async () => {
        await testRsltDao.deleteTestResultData();
    });

    test('delete db', async () => {
        var res = await testRsltDao.getTestResults(sampleTestDesc.rfid);
        expect(res.length).toStrictEqual(0);
    });

    testNewResult(sampleTestDesc);
    testNewResultTT(sampleTest);
    testNewResultA(sampleTestAA);

});

function testNewResult(newTestResult) {
    test('create new item', async () => {
        
        await testRsltDao.insertTestResult(newTestResult);
        // console.log("ARRIVED HERE AFTER INSERTION")
        var res = await testRsltDao.getTestResults(newTestResult.rfid);
        // console.log("ARRIVED HERE AFTER GET")
        var ID= res[res.length-1].id 
        //expect(res.length).toStrictEqual(8);
        
        res = await testRsltDao.getTestResultById(newTestResult.rfid, ID);
      //  console.log(res);
        
        expect(res.rfid).toStrictEqual(newTestResult.rfid);
        expect(res.idTestDescriptor).toStrictEqual(newTestResult.idTestDescriptor);
        expect(res.Date).toStrictEqual(newTestResult.Date);
        expect(res.Result).toStrictEqual(newTestResult.Result);
       
    })
};

function testNewResultTT(newTestResult) {
    test('create new item', async () => {
        
        await testRsltDao.insertTestResult(newTestResult);
        // console.log("ARRIVED HERE AFTER INSERTION")
        var res = await testRsltDao.getTestResults(newTestResult.rfid);
        // console.log("ARRIVED HERE AFTER GET")
        var ID= res[res.length-1].id 
        //expect(res.length).toStrictEqual(8);
        
        res = await testRsltDao.getTestResultById(newTestResult.rfid, ID);
       // console.log(res);
        
        expect(res.rfid).toStrictEqual(newTestResult.rfid);
        expect(res.idTestDescriptor).toStrictEqual(404);
        expect(res.Date).toStrictEqual(newTestResult.Date);
        expect(res.Result).toStrictEqual(newTestResult.Result);
       
    })
};

function testNewResultA(newTestResult) {
    test('create new item', async () => {
        
        await testRsltDao.insertTestResult(newTestResult);
        // console.log("ARRIVED HERE AFTER INSERTION")
        var res = await testRsltDao.getTestResults(newTestResult.rfid);
        // console.log("ARRIVED HERE AFTER GET")
        var ID= res[res.length-1].id 
        //expect(res.length).toStrictEqual(8);
        
        res = await testRsltDao.getTestResultById(newTestResult.rfid, ID);
        //console.log(res);
        
        expect(res.rfid).toStrictEqual(newTestResult.rfid);
        expect(res.idTestDescriptor).toStrictEqual(newTestResult.idTestDescriptor);
        expect(res.Date).toStrictEqual(newTestResult.Date);
        expect(res.Result).toStrictEqual(newTestResult.Result);
       
    })
};