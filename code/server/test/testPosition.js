'use strict';
const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
chai.should();
const PositionDao = require('../src/models/Position');

let mockPosition = {
    positionID: "800234543412",
    aisleID: "8002",
    row: "3454",
    col: "3412",
    maxWeight: 1000,
    maxVolume: 1000
}

const app = require("../server");
const agent = chai.request.agent(app);

describe('post Position Request', function () {

    beforeEach(async function () {
        
        await PositionDao.deleteTable();
        await PositionDao.createTable();
    })

    newPosition("test correct new Position", 201, "800234543412", "8002", "3454", "3412", 1000, 1000);
    newPosition("test new Position no positionID", 422, undefined, "8002", "3454", "3412", 1000, 1000);
    newPosition("test new Position no aisleID", 422, "800234543412", undefined, "3454", "3412", 1000, 1000);
    newPosition("test new Position no row", 422, "800234543412", "8002", undefined, "3412", 1000, 1000);
    newPosition("test new Position no col", 422, "800234543412", "8002", "3454", undefined, 1000, 1000);
    newPosition("test new Position no maxWeight", 422, "800234543412", "8002", "3454", "3412", undefined, 1000);
    newPosition("test new Position no maxVolume", 422, "800234543412", "8002", "3454", "3412", 1000, undefined);
    newPosition("test new Position no correct  positionID lenght", 422, "80023", "8002", "3454", "3412", 1000, undefined);
    newPosition("test new Position no correct aisleID", 422, "800234543412", "80", "3454", "3412", 1000, 1000);
    newPosition("test new Position no correct row", 422, "800234543412", "8002", "34", "3412", 1000, 1000);
    newPosition("test new Position no correct col", 422, "800234543412", "8002", "3454", "12", 1000, 1000);
    newPosition("test new Position negative maxWeight", 422, "800234543412", "8002", "3454", "3412", -1000, 1000);
    newPosition("test new Position negative maxVolume", 422, "800234543412", "8002", "3454", "3412", 1000, -1000);



    
});

describe('putPositionRequest', function () {
    beforeEach(async function () {
        
        await PositionDao.deleteTable();
        await PositionDao.createTable();

        await PositionDao.insertNewPosition(mockPosition)
    });

    putPosition("test correct put Position", 200, "800234543412" ,"8002", "3454", "3412", 1000, 1000, 200, 100);
    putPosition("test put Position no correct newAisleId", 422, 800234543412 ,"80", "3454", "3412", 1000, 1000, 200, 100);
    putPosition("test put Position no correct newRow", 422, "800234543412" ,"8002", "34", "3412", 1000, 1000, 200, 100);
    putPosition("test put Position no correct newCol", 422, "800234543412" ,"8002", "3454", "34", 1000, 1000, 200, 100);
    putPosition("test put Position no correct newMaxWeight", 422, "800234543412" ,"8002", "3454", "3412", -1000, 1000, 200, 100);
    putPosition("test put Position no correct newMaxVolume", 422, "800234543412" ,"8002", "3454", "3412", 1000, -1000, 200, 100);
    putPosition("test put Position weight over max", 422, "800234543412" ,"8002", "3454", "3412", 1000, 1000, 2000, 100);
    putPosition("test put Position weight over max", 422, "800234543412" ,"8002", "3454", "3412", 1000, 1000, 100, 2000);
    putPosition("test put Position id undefined", 422, undefined ,"8002", "3454", "3412", 1000, 1000, 200, 100);

    it("test put newPositionID already used", async function () {
        await PositionDao.deleteTable();
        await PositionDao.createTable();

        await PositionDao.insertNewPosition({
            "positionID":"800234543412",
            "aisleID": "8002",
            "row": "3454",
            "col": "3412",
            "maxWeight": 10,
            "maxVolume": 10
        })
        await PositionDao.insertNewPosition({
            "positionID":"800234543413",
            "aisleID": "8002",
            "row": "3454",
            "col": "3412",
            "maxWeight": 10,
            "maxVolume": 10
        })

        let posMod = {
            newAisleID: "8002",
            newRow: "3454",
            newCol: "3413",
            newMaxWeight: 1000,
            newMaxVolume: 1000,
            newOccupiedWeight: 100,
            newOccupiedVolume: 100
        }
        let positionID = 800234543412;

        let res = await agent.put(`/api/position/${positionID}`)
            .send(posMod)
        res.should.have.status(422);
       

    })



});



function newPosition(title, expectedHTTPStatus, positionID, aisleID, row, col, maxWeight, maxVolume) {
    it(title, async function () {
        // Creation of request body
        let position = {
            positionID: positionID,
            aisleID: aisleID,
            row: row,
            col: col,
            maxWeight: maxWeight,
            maxVolume: maxVolume
        }
        // send the request
        let res = await agent.post('/api/position')
            .send(position)
        res.should.have.status(expectedHTTPStatus)
    })
}

function putPosition(title,expectedHTTPStatus,positionID, newAisleID, newRow, newCol, newMaxWeight, newMaxVolume, newOccupiedWeight, newOccupiedVolume) {
    it(title, async function () {
        // Creation of request body
        let position = {
            newAisleID: newAisleID,
            newRow: newRow,
            newCol: newCol,
            newMaxWeight: newMaxWeight,
            newMaxVolume: newMaxVolume,
            newOccupiedWeight: newOccupiedWeight,
            newOccupiedVolume: newOccupiedVolume
        }
        // send the request
        let res = await agent.put(`/api/position/${positionID}`)
            .send(position)
        res.should.have.status(expectedHTTPStatus)
    })
}

