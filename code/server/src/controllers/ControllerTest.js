'use strict';
const HTTPError = require("./HTTPError");

class TestController {
    #wh;
    #TestDescriptorDao;
    #TestResultDao
    constructor(wh, TestDescriptorDao, TestResultDao) {
        this.#wh = wh;
        this.#TestDescriptorDao = TestDescriptorDao;
        this.#TestResultDao = TestResultDao;
    }

    async createTables() {


        await this.#TestResultDao.createTable();
        await this.#TestDescriptorDao.createTable();
    }


    getTestResults = async (rfid) => {

        if (rfid == undefined)
            throw HTTPError.E422("Invalid Id");

        const testResults = await this.#TestResultDao.getTestResults(rfid);

        //if (testResults.length == 0)
        //    throw HTTPError.E404("Not Found");
            
        return testResults;
    };

    getTestResultById = async (rfid, id) => {

        const testResult = await this.#TestResultDao.getTestResultById(rfid,id);
        
        if (testResult == undefined)
            throw HTTPError.E404("Not Found");
        
        if (testResult.length > 1)
            throw HTTPError.E422("Validation of rfid or id  failed");

        return testResult;

    }

    postTestResult = async (newTestResult) => {

        const SKUCtrl = this.#wh.SKUCtrl;

        if (newTestResult.rfid === undefined
            || newTestResult.idTestDescriptor === undefined
            || newTestResult.Date === undefined
            || newTestResult.Result === undefined)
            throw HTTPError.E422("Invalid args");




        //Check the RFID
        try {
            await this.getTestResults(rfid);
            // RFID exists, because otherwise there is a throw exception

        } catch (e) {
            if (e.status === 404)
                throw HTTPError.E404("RFID Unprocessable Entity");

        }



        //Check the idTestDEscriptor
        try {
            await this.getTestDescriptor(newTestResult.idTestDescriptor);
            // RFID exists, because otherwise there is a throw exception

        } catch (e) {
            if (e.status === 404)
                throw HTTPError.E404("itemId Unprocessable Entity");

        }
        try {
            const Test = await TestCtrl.getTestDescriptor(newTestResult.idTestDescriptor);
            const SKU = await SKUCtrl.getSKUItem(newTestResult.rfid);

            if (SKU.id !== Test.idSKU)
                throw HTTPError.E422("Not valid test and SKU");


        } catch (e) {

        }


        await this.#TestResultDao.insertTestResult(newTestResult);

    }

    putTestResult = async (rfid, id, testMod) => {

        const SKUCtrl = this.#wh.SKUCtrl;

        //Check the id 
        if (id === undefined)
            throw HTTPError.E422("validation of id failed");

        if (rfid === undefined)
            throw HTTPError.E422("validation of id failed");

        try {
            await SKUCtrl.getSKUItem(rfid);
            // RFID exists, because otherwise there is a throw exception

        } catch (e) {
            if (e.status === 404)
                throw HTTPError.E404("RFID Unprocessable Entity");

        }



        //Check the idTestDEscriptor
        try {
            await this.getTestResultById(rfid, id);
            // RFID exists, because otherwise there is a throw exception

        } catch (e) {
            if (e.status === 404)
                throw HTTPError.E404("itemId Unprocessable Entity");

        }

        try {
            await this.getTestDescriptor(testMod.newIdTestDescriptor);
            // RFID exists, because otherwise there is a throw exception

        } catch (e) {
            if (e.status === 404)
                throw HTTPError.E404("itemId Unprocessable Entity");

        }

        try {
            const Test = await TestCtrl.getTestDescriptor(testMod.newIdTestDescriptor);
            const SKU = await SKUCtrl.getSKUItem(rfid);

            if (SKU.SKUId!== Test.idSKU)
                throw HTTPError.E422("Not valid test and SKU");


        } catch (e) {

        }
        //Check the body
        if (testMod.newIdTestDescriptor === undefined
            || testMod.newDate === undefined
            || testMod.newResult === undefined)
            throw HTTPError.E422("Invalid args")


            await this.#TestResultDao.updateTestResult(rfid,id,testMod);

    
    }

    deleteTestResult = async (rfid, id) => {

        if (id === undefined)
            throw HTTPError.E422("validation of id failed");

        if (rfid === undefined)
            throw HTTPError.E422("validation of id failed");
        /*
        try {
            await TestCtrl.getTestResultById(rfid, id);
            // RFID exists, because otherwise there is a throw exception

        } catch (e) {
            if (e.status === 404)
                throw HTTPError.E404("TestResultId does not exists");

        }
         */

      await this.#TestResultDao.deleteTestResult(rfid,id);

        // The throw of a HTTPError.E503 is implicit of a generic failure of the program, so we don't need to throw it

        return {}
    }

    // Test Descriptor

    getTestDescriptors = async () => {
        return this.#TestDescriptorDao.getTestDescriptors();
    };

    getTestDescriptor = async (id) => {
        const TestDescriptor = await this.#TestDescriptorDao.getTestDescriptorById(id);

        if (TestDescriptor == undefined)
            throw HTTPError.E404("Not Found");

        return TestDescriptor
    }

    // Protected method
    getTestDescriptorBySKUId = async (idSKU) => {
        return await this.#TestDescriptorDao.getTestDescriptorBySKUId(idSKU);
    }

    postTestDescriptor = async (newTestDescriptor) => {

        const SKUCtrl = this.#wh.SKUCtrl;

        try {
            await SKUCtrl.getSKUById(newTestDescriptor.idSKU);
        } catch (e) {
            if (e.status == 404)
                throw HTTPError.E404("idSKU doesn't exist");
            throw e;
        }

        await this.#TestDescriptorDao.insertTestDescriptor(newTestDescriptor);
    }

    putTestDescriptor = async (id, testMod) => {

        const SKUCtrl = this.#wh.SKUCtrl;

        try {
            await this.getTestDescriptor(id);
            // at this point we hare sure that the id exists, because otherwise there is a throw exception
            // The control of error 404 is implict in the call of the getTestDescriptor()
        } catch (e) {
            if (e.status == 404)
                throw HTTPError.E404("id doesn't exist");
            throw e;

        }
        try {
            await SKUCtrl.getSKUById(testMod.newIdSKU);
            // at this point we hare sure that the id exists, because otherwise there is a throw exception
            // The control of error 404 is implict in the call of the getTestDescriptor()
        } catch (e) {
            if (e.status == 404)
                throw HTTPError.E404("idSKU doesn't exist");
            throw e;

        }

        // at this point we hare sure that body is not empty and the idSKU exists, because otherwise there is a throw exception
        // The control of error 404 is implict in the call of the getSKUItem()

        // If only one field needs to be modified, the other one will contain the old value.
        testMod.id = id;
        testMod.newName = testMod.newName == undefined ? body.name : testMod.newName;
        testMod.newProcedureDescription = testMod.newProcedureDescription == undefined ? body.procedureDescription : testMod.newProcedureDescription;

        await this.#TestDescriptorDao.updateTestDescriptor(testMod);
    }

    deleteTestDescriptor = async (id) => {
        /*
        try {
            await this.getTestDescriptor(id);
            // at this point we hare sure that the TestDescriptor exists, because otherwise there is a throw exception
            // The control of error 404 is implict in the call of the getTestDescriptor()
        } catch (e) {
            if (e.status == 404)
                throw HTTPError.E404("id doesn't exist");
            throw e;
        }
         */

        await this.#TestDescriptorDao.deleteTestDescriptor(id)
    }
}

module.exports = TestController;