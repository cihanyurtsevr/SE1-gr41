'use strict';
const dayjs = require("dayjs");
var customParseFormat = require('dayjs/plugin/customParseFormat')
dayjs.extend(customParseFormat);
const DatabaseHelper = require("../database/DatabaseHelper");
const {pathDB} = require("../controllers/Warehouse");

const dbHelp = new DatabaseHelper(pathDB);
class Position {
    positionID;
    aisleID;
    row;
    col;
    maxWeight;
    maxVolume;
    occupiedWeight;
    occupiedVolume;

    constructor(positionID, aisleID, row, col, maxWeight, maxVolume, occupiedVolume, occupiedWeight) {
        this.positionID = positionID;
        this.aisleID = aisleID;
        this.row = row;
        this.col = col;
        this.maxWeight = maxWeight;
        this.maxVolume = maxVolume;
        this.occupiedVolume = occupiedVolume;
        this.occupiedWeight = occupiedWeight;
    }
}

const buildPosition = (rows) => {
    return rows.map((row) => {
        return new Position(row.positionID, row.aisleID, row.row, row.col, row.maxWeight, row.maxVolume, row.occupiedVolume, row.occupiedWeight);
    })
}

exports.createTable = async () => {
    // Create the table of Position in the db if it not exists (just first time)
    
    await dbHelp.queryDBRun(`
        CREATE TABLE IF NOT EXISTS Position (
            positionID varchar(12) PRIMARY KEY,
            aisleID varchar(4) ,
            row varchar(4) ,
            col varchar(4) ,
            maxWeight double ,
            maxVolume double ,
            occupiedWeight double ,
            occupiedVolume double ,
            CHECK(
                length(positionID) == 12 AND
                length(aisleID) == 4 AND
                length(row) == 4 AND
                length(col) == 4 AND
                occupiedWeight <= maxWeight AND
                occupiedVolume <= maxVolume AND
                occupiedWeight >= 0 AND
                occupiedVolume >= 0
            )
        );
        `)
}

exports.deleteTable = async () => {
    
    await dbHelp.queryDBRun(`
        DROP TABLE IF EXISTS Position;
    `);
}


exports.getPositions = async () => {
    
    let rows = await dbHelp.queryDBAll(`
        SELECT *
        FROM Position;
    `);
    return await buildPosition(rows);
};

exports.getPositionById = async (positionID) => {
    
    let rows = await dbHelp.queryDBAll(`
        SELECT *
        FROM Position
        WHERE positionID = ?;
    `, [positionID])
    return (buildPosition(rows))[0];
}

exports.insertNewPosition = async (newPosition) => {
    
    await dbHelp.queryDBRun(`
            INSERT INTO Position(positionID, aisleID, row, col, maxWeight, maxVolume, occupiedWeight, occupiedVolume)
            VALUES(?, ?, ?, ? , ? , ?, ?, ? );
        `, [newPosition.positionID, newPosition.aisleID, newPosition.row, newPosition.col, newPosition.maxWeight == undefined ? "NULL" : newPosition.maxWeight, newPosition.maxVolume == undefined ? "NULL" : newPosition.maxVolume, 0, 0]);

}


exports.updatePosition = async (posMod,positionID) => {
    
    let newPositionID = '' + posMod.newAisleID + posMod.newRow + posMod.newCol;
    await dbHelp.queryDBRun(`
            UPDATE Position
            SET positionID = ? , aisleID = ?, row = ?, col = ?, maxWeight = ?, maxVolume = ?, occupiedWeight = ?,occupiedVolume = ?
            WHERE  positionID =?;
        `, [newPositionID, posMod.newAisleID, posMod.newRow, posMod.newCol, posMod.newMaxWeight, posMod.newMaxVolume, posMod.newOccupiedWeight, posMod.newOccupiedVolume, positionID]);
}

exports.updatePositionById = async (posMod,positionID) => {
    
    let newAisleID = posMod.newPositionID.slice(0, 4);
    let newRow = posMod.newPositionID.slice(4, 8);
    let newCol = posMod.newPositionID.slice(8, 12);
    await dbHelp.queryDBRun(`
    UPDATE Position
    SET positionID = ? , aisleID = ?, row = ?, col = ?
    WHERE  positionID =?;
`, [posMod.newPositionID, newAisleID, newRow, newCol, positionID]);
}



exports.deletePosition = async (positionID) => {
    
    await dbHelp
        .queryDBRun(`
            DELETE
            FROM Position
            WHERE positionID=?;
        `, [positionID]);
}

exports.deletePositionData = async () => {
    
    await dbHelp
        .queryDBRun(`
        DELETE
        FROM Position`);
}
