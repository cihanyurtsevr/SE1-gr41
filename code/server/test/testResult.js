'use strict';
const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
chai.should();
const TestResultDao = require('../src/models/TestResult');
const skuDao = require('../src/models/SKU');
const TestDescriptorDao = require('../src/models/TestDescriptor');
const SKUITemDao = require('../src/models/SKUItem');

let mockTestDescriptor = {
    name: "test descriptor 3",
    procedureDescription:"This test is described by...",
    idSKU: 1
}
let mockSKU = {
    description: "test descriptor 3",
    weight:"This test is described by...",
    volume: 1,
    notes:"first SKU",
    price: 10.99,
    availableQuantity: 50
}

let mockSKUItem = {
    RFID:"12345678901234567890123456789015",
    SKUId:1,
    DateOfStock:"2021/11/29 12:30"
}

let mockTestResult = {
    rfid:"12345678901234567890123456789015",
    idTestDescriptor:1,
    Date:"2021/11/28",
    Result: true
}
const app = require("../server");
const agent = chai.request.agent(app);

describe('post TestResult Request', function () {

    beforeEach(async function () {

        await TestResultDao.deleteTable();
        await TestResultDao.createTable();
        await skuDao.deleteTable();
        await skuDao.createTable();
        await skuDao.insertNewSKU(mockSKU);
        await TestDescriptorDao.deleteTable();
        await TestDescriptorDao.createTable();
        await TestDescriptorDao.insertTestDescriptor(mockTestDescriptor);
        await SKUITemDao.deleteTable();
        await SKUITemDao.createTable();
        await SKUITemDao.insertNewSKUItem(mockSKUItem);
    })

    newTestResult("test correct new TestResult", 201, "12345678901234567890123456789015", 1,  "2021/11/29 12:30",true);
    newTestResult("test new TestResult incorrect rfid" , 422, undefined, 1,  "2021/11/29 12:30",true);
    newTestResult("test correct new TestResult incorect idSKU", 422, "12345678901234567890123456789015", undefined,  "2021/11/29 12:30",true);
    newTestResult("test correct new TestResult incorect date", 422, "12345678901234567890123456789015", 1,undefined ,true);
    newTestResult("test correct new TestResult incorrect result", 422, "12345678901234567890123456789015", 1,  "2021/11/29 12:30",undefined);
    newTestResult("test correct new TestResult no existing testDesc", 404, "12345678901234567890123456789015", 5,  "2021/11/29 12:30",true);
    newTestResult("test correct new TestResult no existing SKUitem", 404, "12345678901234567890123456789017", 5,  "2021/11/29 12:30",true);
    newTestResult("test correct new TestResult no correct format Date", 422, "12345678901234567890123456789017", 5,  "12:30 2021/11/29 ",true);
   
    
});

describe('put test Result', function () {
    beforeEach(async function () {
        await TestResultDao.deleteTable();
        await TestResultDao.createTable();
        await TestResultDao.insertTestResult(mockTestResult);
        await skuDao.deleteTable();
        await skuDao.createTable();
        await skuDao.insertNewSKU(mockSKU);
        await TestDescriptorDao.deleteTable();
        await TestDescriptorDao.createTable();
        await TestDescriptorDao.insertTestDescriptor(mockTestDescriptor);
        await SKUITemDao.deleteTable();
        await SKUITemDao.createTable();
        await SKUITemDao.insertNewSKUItem(mockSKUItem);
    });

    putTestResult("test correct put TestResult", 200, "12345678901234567890123456789015",1 ,1, "2021/11/28", true);
    putTestResult("test put TestResult incorrect newidtestdesc", 422, "12345678901234567890123456789015",1 ,undefined, "2021/11/28", true);
    putTestResult("test put TestResult incorrect newDate", 422, "12345678901234567890123456789015",1 ,1, undefined, true);
    putTestResult("test put TestResult incorrect newResult", 422, "12345678901234567890123456789015",1 ,1, "2021/11/28", undefined);
    putTestResult("test put TestResult incorrect rfid", 404, "12345678901234567890123456789017",1 ,1, "2021/11/28", true);
    putTestResult("test put TestResult incorrect idTestDesc", 404, "12345678901234567890123456789015",5 ,1, "2021/11/28", true);
    putTestResult("test put TestResult incorrect newidDesc", 404, "12345678901234567890123456789015",1 ,5, "2021/11/28", true);


});







function newTestResult(title, expectedHTTPStatus, rfid, idTestDescriptor, Date, Result) {
    it(title, async function () {
        // Creation of request body
        let test = {
            rfid: rfid,
            idTestDescriptor: idTestDescriptor,
            Date: Date,
            Result : Result,
        }
        // send the request
        let res = await agent.post('/api/skuitems/testResult')
            .send(test)
        res.should.have.status(expectedHTTPStatus)
    })
}

function putTestResult(title,expectedHTTPStatus,rfid,id,newIdTestDescriptor, newDate, newResult) {
    it(title, async function () {
        // Creation of request body
        let test = {
            newIdTestDescriptor: newIdTestDescriptor,
            newDate: newDate,
            newResult: newResult,
        }
        // send the request
        let res = await agent.put(`/api/skuitems/${rfid}/testResult/${id}`)
            .send(test)
        res.should.have.status(expectedHTTPStatus)
    })
}


