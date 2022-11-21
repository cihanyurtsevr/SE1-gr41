'use strict';
const DatabaseHelper = require("../database/DatabaseHelper");
const {pathDB} = require("../controllers/Warehouse");

const dbHelp = new DatabaseHelper(pathDB);
class SKU {
    id;
    description;
    weight;
    volume;
    notes;
    position;
    availableQuantity;
    price;
    testDescriptors;

    constructor(id, description, weight, volume, notes, position, price, availableQuantity){
        this.id = id;
        this.description = description;
        this.weight = weight;
        this.volume = volume;
        this.notes = notes;
        this.position = position;
        this.price = price;
        this.availableQuantity = availableQuantity;
        this.testDescriptors = [];
    }

}

exports.createTable = async () => {
    // Create the table of SKU in the db if it not exists (just first time)
    
    await dbHelp.queryDBRun(`
        CREATE TABLE IF NOT EXISTS SKU (
            id INTEGER PRIMARY KEY AUTOINCREMENT ,
            description varchar(100) NOT NULL,
            weight double NOT NULL,
            volume double NOT NULL,
            notes varchar(50) NOT NULL,
            position varchar(12),
            availableQuantity int NOT NULL,
            price double NOT NULL,

            CHECK (weight >= 0 AND
                volume >= 0 AND
                length(position) == 12 AND
                availableQuantity >= 0 AND
                price >= 0)
        );
        `)
}

exports.deleteTable = async () => {
    
    await dbHelp.queryDBRun(`
        DROP TABLE IF EXISTS SKU;
    `);
}

const buildSKU = (rows) => {
    return rows.map( (row) => {
        return new SKU(row.id, row.description, row.weight , row.volume, row.notes, row.position, row.price, row.availableQuantity);
    })
}

exports.getSKUs = async () => {
    
    let rows = await dbHelp.queryDBAll(`
        SELECT *
        FROM SKU;
    `);
    return buildSKU(rows);
};

exports.getSKUById = async (id) => {
    
    let rows = await dbHelp.queryDBAll(`
        SELECT *
        FROM SKU
        WHERE id = ?;
    `,[id])
    return (buildSKU(rows))[0];
}

exports.insertNewSKU = async (newSKU) => {
    
    await dbHelp.queryDBRun(`
        INSERT INTO SKU(description, weight, volume, notes, price, availableQuantity)
        VALUES(?,?,?,?,?,?);
    `,[newSKU.description, newSKU.weight, newSKU.volume, newSKU.notes, newSKU.price, newSKU.availableQuantity]);

}

exports.updateSKU = async (skuMod) => {
    
    await dbHelp.queryDBRun(`
        UPDATE SKU
        SET description = ?, weight = ?, volume = ?, notes = ?, price = ?, availableQuantity = ?
        WHERE id=?;
    `,[skuMod.newDescription, skuMod.newWeight, skuMod.newVolume, skuMod.newNotes, skuMod.newPrice, skuMod.newAvailableQuantity, skuMod.id]);

}

exports.updateSKUPosition = async (skuId, positionId) => {
    
    await dbHelp.queryDBRun(`
            UPDATE SKU
            SET position = ?
            WHERE id = ?;
        `,[positionId, skuId]);
}

exports.deleteSKU = async (skuId) => {
    
    await dbHelp.queryDBRun(`
            DELETE
            FROM SKU
            WHERE id=?;
        `, [skuId]);
}
