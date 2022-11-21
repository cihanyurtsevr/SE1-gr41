'use strict';
const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
chai.should();
const TestDescriptorDao = require('../src/models/TestDescriptor');
const skuDao = require('../src/models/SKU');

let mockTestDescriptor = {
    name: "test descriptor 3",
    procedureDescription:"This test is described by...",
    idSKU: 1
}
let mockTestSKU = {
    description: "test descriptor 3",
    weight:"This test is described by...",
    volume: 1,
    notes:"first SKU",
    price: 10.99,
    availableQuantity: 50
}
const app = require("../server");
const agent = chai.request.agent(app);

describe('test Scenario 12-1', function () {

    beforeEach(async function () {
       
        await skuDao.deleteTable();
        await skuDao.createTable();
        await skuDao.insertNewSKU(mockTestSKU);
        await TestDescriptorDao.deleteTable();
        await TestDescriptorDao.createTable();
    })

    newTestDescriptor("test correct new TestDescriptor", 201, "test descriptor 3", "this test ...",  1);
    newTestDescriptor("test new TestDescriptor invalid name", 422, undefined, "this test ...",  1);
    newTestDescriptor("test new TestDescriptor invalid procedure description", 422, "test descriptor 3", undefined,  1);
    newTestDescriptor("test new TestDescriptor invalid idSKU", 422, "test descriptor 3", "this test ...",  undefined);
    newTestDescriptor("test new TestDescriptor not existing idSKU", 404, "test descriptor 3", "this test ...",  2);
    
});

describe('test Scenario 12-2', function () {
    beforeEach(async function () {
       
            await skuDao.deleteTable();
            await skuDao.createTable();
            await skuDao.insertNewSKU(mockTestSKU);
            await TestDescriptorDao.deleteTable();
            await TestDescriptorDao.createTable();
            await TestDescriptorDao.insertTestDescriptor(mockTestDescriptor);
    });

    putTestDescriptor("test correct put TestDescriptor", 200, 1, "test descriptor 1", "this test other...", 1);
    putTestDescriptor("test put TestDescriptor incorrect newName", 422, 1, undefined, "this test other...", 1);
    putTestDescriptor("test put TestDescriptor incorrect newProcedureDescription", 422, 1, "test desc 1", undefined, 1);
    putTestDescriptor("test put TestDescriptor incorrect newIdSKU", 422, 1, "test desc 1", "this test other...", undefined);
    putTestDescriptor("test put TestDescriptor no existing SKU", 404, 1, "test descriptor 1", "this test other...", 5);
    putTestDescriptor("test put TestDescriptor no existing testDescriptor", 404, 5, "test descriptor 1", "this test other...", 1);
    



})





function newTestDescriptor(title, expectedHTTPStatus, name, procedureDescription, idSKU) {
    it(title, async function () {
        // Creation of request body
        let test = {
            name: name,
            procedureDescription: procedureDescription,
            idSKU: idSKU,
        }
        // send the request
        let res = await agent.post('/api/testDescriptor')
            .send(test)
        res.should.have.status(expectedHTTPStatus)
    })
}

function putTestDescriptor(title,expectedHTTPStatus,TestDescriptorID, newName, newProcedureDescription,newIdSKU) {
    it(title, async function () {
        // Creation of request body
        let TestDescriptor = {
            newName: newName,
            newProcedureDescription: newProcedureDescription,
            newIdSKU: newIdSKU,
        }
        // send the request
        let res = await agent.put(`/api/TestDescriptor/${TestDescriptorID}`)
            .send(TestDescriptor)
        res.should.have.status(expectedHTTPStatus)
    })
}


