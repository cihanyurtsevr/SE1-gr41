'use strict';
const DatabaseHelper = require("../database/DatabaseHelper");
const {pathDB} = require("../controllers/Warehouse");

const dbHelp = new DatabaseHelper(pathDB);
class TestDescriptor{

    id;
    name;
    procedureDescription;
    idSKU;

    constructor(id,name,procedureDescription,idSKU){
        this.id = id;
        this.name = name;
        this.procedureDescription = procedureDescription;
        this.idSKU = idSKU;
    }
}

exports.createTable = async () => {
    
    await dbHelp.queryDBRun(`
        CREATE TABLE IF NOT EXISTS TestDescriptor (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name varchar(32) NOT NULL,
            procedureDescription varchar(64) NOT NULL,
            idSKU int NOT NULL,
            CHECK(
                idSKU > 0
            )
        );
    `)
}
exports.deleteTable = async () => {
    
    await dbHelp.queryDBRun(`
        DROP TABLE IF EXISTS TestDescriptor;
    `);
}

const buildTestDescriptor = (rows) => {
    return rows.map(row => {
        return new TestDescriptor(row.id, row.name, row.procedureDescription, row.idSKU);
    })
}

exports.getTestDescriptors = async () => {
    
    const rows = await dbHelp.queryDBAll(`
            SELECT *
            FROM TestDescriptor;
        `)

    return buildTestDescriptor(rows);
}

exports.getTestDescriptorById = async (id) => {
    
    const rows = await dbHelp.queryDBAll(`
            SELECT *
            FROM TestDescriptor
            WHERE id=?  ;
        `, [id])
    return (buildTestDescriptor(rows))[0];
}

exports.getTestDescriptorBySKUId = async (SKUId) => {
    
    const rows = await dbHelp.queryDBAll(`
            SELECT *
            FROM TestDescriptor
            WHERE idSKU=?  ;
        `,
        [SKUId])
    return buildTestDescriptor(rows);
}

exports.insertTestDescriptor = async (newTestDescriptor) => {
    
    await dbHelp.queryDBRun(`
        INSERT INTO TestDescriptor(name, procedureDescription, idSKU)
        VALUES(?, ?, ?);
    `, [newTestDescriptor.name, newTestDescriptor.procedureDescription, newTestDescriptor.idSKU]);
}

exports.updateTestDescriptor = async (testMod) => {
    
    await dbHelp.queryDBRun(`
            UPDATE TestDescriptor
            SET name = ?, procedureDescription = ?, idSKU = ?
            WHERE id=?;
        `, [testMod.newName, testMod.newProcedureDescription, testMod.newIdSKU, testMod.id]);
}

exports.deleteTestDescriptor = async (id) => {
    
    await dbHelp.queryDBRun(`
            DELETE
            FROM TestDescriptor
            WHERE id=?;
        `, [id]);
}


exports.deleteTestDescriptorData = async () => {
    
    await dbHelp
        .queryDBRun(`
        DELETE
        FROM TestDescriptor`);
  }
    