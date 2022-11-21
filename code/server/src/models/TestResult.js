'use strict';
const dayjs = require("dayjs");
const DatabaseHelper = require("../database/DatabaseHelper");
const {pathDB} = require("../controllers/Warehouse");
var customParseFormat = require('dayjs/plugin/customParseFormat')
dayjs.extend(customParseFormat);
const dbHelp = new DatabaseHelper(pathDB);

class TestResult {

    id;
    idTestDescriptor;
    rfid;
    Date;
    Result;

    constructor(id, idTestDescriptor, rfid, Date, Result) {
        this.id = id;
        this.idTestDescriptor = idTestDescriptor;
        this.rfid = rfid;
        this.Date = Date;
        this.Result = Result;
    }
}


const buildTestResult = (rows) => {
    return rows.map((row) => {
        return new TestResult(row.id, row.idTestDescriptor,row.rfid, row.Date, row.Result ? true : false );
    })
}

exports.deleteTable = async () => {
    await dbHelp.queryDBRun(`
        DROP TABLE IF EXISTS TestResult;
    `);
}

exports.createTable = async () => {
    // Create the table of Position in the db if it not exists (just first time)
    await dbHelp.queryDBRun(`
        CREATE TABLE IF NOT EXISTS TestResult (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            idTestDescriptor int NOT NULL,
            rfid varchar(32) NOT NULL,
            Date DATETIME NOT NULL,
            Result BOOLEAN ,
            CHECK(
                idTestDescriptor > 0 AND
                length(rfid) = 32
            )
        );
        `)
}


exports.getTestResults = async (rfid) => {
    let rows = await dbHelp.queryDBAll(`
    SELECT *
    FROM TestResult
    WHERE rfid=?;
`, [rfid])
    return buildTestResult(rows);
};

exports.getTestResultById = async (rfid,id) => {
    let rows = await dbHelp.queryDBAll(`
    SELECT *
    FROM TestResult
    WHERE rfid=? AND id=?;
`, [rfid, id])

    return (buildTestResult(rows))[0];
}

exports.insertTestResult = async (newTestResult) => {
    await dbHelp.queryDBRun(`
    INSERT INTO TestResult(rfid,idTestDescriptor, Date,Result)
    VALUES(?, ?, ?, ?);
    `, [newTestResult.rfid, newTestResult.idTestDescriptor, newTestResult.Date, newTestResult.Result]);

}

exports.updateTestResult = async (rfid, id, testMod) => {
    await dbHelp.queryDBRun(`
    UPDATE TestResult
    SET  idTestDescriptor = ? , Date=?, Result = ? 
    WHERE rfid=? AND id=?;
`, [testMod.newIdTestDescriptor, testMod.newDate, testMod.newResult, rfid, id]);
}

exports.deleteTestResult = async (rfid,id) => {
    await dbHelp
        .queryDBRun(`
        DELETE
        FROM TestResult
        WHERE rfid=? AND id=?;
    `, [rfid, id]);
}

exports.deleteTestResultData = async () => {
    await dbHelp
        .queryDBRun(`
        DELETE
        FROM TestResult`);
  }
    