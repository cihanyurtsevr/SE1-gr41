const positionDao = require('../src/models/Position');



describe('testDao', () => {
    
    const sampleCreatePosition= {


        positionID: "123456789124",
        aisleID: "1234",
        row: "5678",
        col: "9124",
        maxWeight: 10,
        maxVolume: 10,
        occupiedVolume: 0,
        occupiedWeight: 0

    }

    const sampleCreatePositionErr= {


        positionID: "12345678912",
        aisleID: "1234",
        row: "5678",
        col: "9124",
        maxWeight: 10,
        maxVolume: 10,
        occupiedVolume: 0,
        occupiedWeight: 0

    }

    const samplePositionUpdateWeightVolume= {
        
        newAisleID: "1234",
        newRow: "5678",
        newCol: "9124",
        newMaxWeight: 10,
        newMaxVolume: 10,
        newOccupiedVolume: 2,
        newOccupiedWeight: 3

    }

    const samplePositionUpdateWeightVolumeErr= {

        newAisleID: "1235",
        newRow: "5678",
        newCol: "9124",
        newMaxWeight: 10,
        newMaxVolume: 10,
        newOccupiedVolume: 11,
        newOccupiedWeight: 3

    }

    const samplePositionUpdateById= {


        newPositionID: "999988887777",
        
    }

    const samplePositionUpdateByIdErr= {


        newPositionID: "99998888777",
        
    }

    const samplePositionUpdateAisleRowCol= {
        
        newAisleID: "3333",
        newRow: "3333",
        newCol: "5555",
        newMaxWeight: 10,
        newMaxVolume: 10,
        newOccupiedVolume: 2,
        newOccupiedWeight: 3

    }



    
    beforeAll(async () => {
        await positionDao.deletePositionData();
    });
    
    afterEach(async () => {
        await positionDao.deletePositionData();
    });

    
    test('delete db', async () => {
        var res = await positionDao.getPositions();
        expect(res.length).toStrictEqual(0);
    });

    testCreatePosition(sampleCreatePosition);
    testCreatePositionErr(sampleCreatePositionErr);
    testDeletePosition(sampleCreatePosition);    
    testUpdatePositionWeightVolume(samplePositionUpdateWeightVolume, sampleCreatePosition);
    testUpdatePositionWeightVolumeErr(samplePositionUpdateWeightVolumeErr, sampleCreatePosition);
    testUpdatePositionById(samplePositionUpdateById, sampleCreatePosition);
    testUpdatePositionByIdErr(samplePositionUpdateById, sampleCreatePosition);
    testUpdatePositionAisleRowCol(samplePositionUpdateAisleRowCol, sampleCreatePosition);
    

});

function testCreatePosition(positionToTest) {

    test('create new position', async () => {
        
        await positionDao.insertNewPosition(positionToTest);
        // console.log("ARRIVED HERE AFTER INSERTION")
        var res = await positionDao.getPositions();
        // console.log("ARRIVED HERE AFTER GET")

        expect(res.length).toStrictEqual(1);
        
        
        res = await positionDao.getPositionById(positionToTest.positionID);

        
        expect(res.positionID).toStrictEqual(positionToTest.positionID);
        expect(res.aisleID).toStrictEqual(positionToTest.aisleID);
        expect(res.row).toStrictEqual(positionToTest.row);
        expect(res.col).toStrictEqual(positionToTest.col);
        expect(res.maxWeight).toStrictEqual(positionToTest.maxWeight);
        expect(res.maxVolume).toStrictEqual(positionToTest.maxVolume);
        expect(res.occupiedVolume).toStrictEqual(positionToTest.occupiedVolume);
        expect(res.occupiedWeight).toStrictEqual(positionToTest.occupiedWeight);
        
    });
}


function testCreatePositionErr(positionToTest) {

    test('create new position with error', async () => {
        
        var res = "no error";
        try{
            await positionDao.insertNewPosition(positionToTest);
        }
        catch(err){
            res = "error";
        }
        expect(res).toStrictEqual("error");
        
    });
}

function testDeletePosition(positionToTest) {

    test('delete a position', async () => {
        
        await positionDao.insertNewPosition(positionToTest);
        await positionDao.deletePosition(positionToTest.positionID);
        
        var res = await positionDao.getPositions();
        
        expect(res.length).toStrictEqual(0);
        
    });
}

function testUpdatePositionWeightVolume(updatedPosition, originalPosition) {

    test('Modify weight and volume of P', async () => {
        
        await positionDao.insertNewPosition(originalPosition);
        await positionDao.updatePosition(updatedPosition, originalPosition.positionID);

        var res = await positionDao.getPositionById(originalPosition.positionID);

        expect(res.occupiedWeight).toStrictEqual(updatedPosition.newOccupiedWeight);
        expect(res.occupiedVolume).toStrictEqual(updatedPosition.newOccupiedVolume);

        
    });
}

function testUpdatePositionWeightVolumeErr(updatedPosition, originalPosition) {

    test('Modify weight and volume of P with error', async () => {
        
        var res = "no error";
        try{
            await positionDao.insertNewPosition(originalPosition);
            await positionDao.updatePosition(updatedPosition, originalPosition.positionID);

        }
        catch(err){
            res = "error";
        }
        
        expect(res).toStrictEqual("error");

        
    });
}

function testUpdatePositionById(updatedPosition, originalPosition) {

    test('Modify position ID of P', async () => {
        
        await positionDao.insertNewPosition(originalPosition);
        await positionDao.updatePositionById(updatedPosition, originalPosition.positionID);
        
        var res = await positionDao.getPositionById(updatedPosition.newPositionID);
        expect(res.positionID).toStrictEqual(updatedPosition.newPositionID);
        expect(res.aisleID).toStrictEqual(updatedPosition.newPositionID.slice(0,4));
        expect(res.row).toStrictEqual(updatedPosition.newPositionID.slice(4,8));
        expect(res.col).toStrictEqual(updatedPosition.newPositionID.slice(8,12));
        
        
    });
}

function testUpdatePositionByIdErr(updatedPosition, originalPosition) {

    test('Modify position ID of P with error', async () => {
        
        var res = "no error";
        try{
            await positionDao.insertNewPosition(originalPosition);
            await positionDao.updatePosition(updatedPosition, originalPosition.positionID);

        }
        catch(err){
            res = "error";
        }
        
        expect(res).toStrictEqual("error");

        
    });
}


function testUpdatePositionAisleRowCol(updatedPosition, originalPosition) {

    test('Modify aisle, row and col of P', async () => {
        
        await positionDao.insertNewPosition(originalPosition);
        await positionDao.updatePosition(updatedPosition, originalPosition.positionID);

        var res = await positionDao.getPositionById(''+ updatedPosition.newAisleID + updatedPosition.newRow + updatedPosition.newCol);

        expect(res.positionID).toStrictEqual(''+ updatedPosition.newAisleID + updatedPosition.newRow + updatedPosition.newCol)
        /*
        expect(res.aisleID).toStrictEqual(updatedPosition.newAisleID);
        expect(res.row).toStrictEqual(updatedPosition.newRow);
        expect(res.col).toStrictEqual(updatedPosition.newCol);
        */
        
    });
}

