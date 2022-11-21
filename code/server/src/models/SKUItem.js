'use strict';
const DatabaseHelper = require("../database/DatabaseHelper");
const {pathDB} = require("../controllers/Warehouse");
const dayjs = require("dayjs");
const customParseFormat = require('dayjs/plugin/customParseFormat')
dayjs.extend(customParseFormat);

const dbHelp = new DatabaseHelper(pathDB);
class SKUItem {
    RFID;
    SKUId;
    itemId;
    Available;
    DateOfStock;
    restockOrderId;
    returnOrderId;
    internalOrderId;

    // Order  attributes
    description;
    price;

    constructor(RFID, SKUId, itemId, Available, DateOfStock, restockOrderId, returnOrderId, internalOrderId) {
        this.RFID = RFID;
        this.SKUId = SKUId;
        this.itemId = itemId;
        this.Available = Available;
        this.DateOfStock = DateOfStock;
        this.restockOrderId = restockOrderId;
        this.returnOrderId = returnOrderId;
        this.internalOrderId = internalOrderId;
    }
}



const buildSkuItem = (rows) => {
    const SKUItems = rows.map(row => {
        const skuItem = new SKUItem(row.RFID, row.SKUId, row.itemId, row.Available, row.DateOfStock, row.restockOrderId, row.returnOrderId, row.internalOrderId);
        return skuItem;
    })
    return SKUItems
}

exports.createTable = async () => {
    // Create the table of Position in the db if it not exists (just first time)
    
    await dbHelp.queryDBRun(`
        CREATE TABLE IF NOT EXISTS SKUItem (
            RFID varchar(32) PRIMARY KEY,
            SKUId int NOT NULL,
            itemId int,
            Available boolean,
            DateOfStock DATETIME NOT NULL,
            restockOrderId int,
            returnOrderId int,
            internalOrderId int,

            CHECK(length(RFID) == 32 AND
                SKUId > 0 AND 
                restockOrderId > 0 AND
                returnOrderId > 0 AND
                internalOrderId > 0 )
        );
        `)
}

exports.deleteTable = async () => {
    
    await dbHelp.queryDBRun(`
        DROP TABLE IF EXISTS SKUItem;
    `)
}

exports.getSKUItems = async () => {
    
    const rows = await dbHelp.queryDBAll(`
            SELECT *
            FROM SKUItem;
        `)
    return await buildSkuItem(rows);
};

exports.getSKUItemById = async (skuId) => {
    
    const rows = await dbHelp.queryDBAll(`
            SELECT *
            FROM SKUItem
            WHERE SKUId=? AND Available=TRUE;
        `,
        [skuId])

    return await buildSkuItem(rows);
}

exports.getSKUItemByRFID = async (RFID) => {
    
    const rows = await dbHelp.queryDBAll(`
    SELECT *
    FROM SKUItem
    WHERE RFID=?;
`,
        [RFID])
    return (buildSkuItem(rows))[0];
}

exports.getSKUItemByInternalOrderId = async (internalOrderId) => {
    
    const rows = await dbHelp.queryDBAll(`
        SELECT *
        FROM SKUItem
        WHERE internalOrderId = ?;
    `, [internalOrderId]);
    return buildSkuItem(rows);
}

exports.getSKUItemByRestockOrderId = async (restockOrderId) => {
    
    const rows = await dbHelp.queryDBAll(`
        SELECT *
        FROM SKUItem
        WHERE restockOrderId = ?;
    `, [restockOrderId])
    return buildSkuItem(rows);
}

exports.getSKUItemByReturnOrderId = async (returnOrderId) => {
    
    const rows = await dbHelp.queryDBAll(`
        SELECT *
        FROM SKUItem
        WHERE returnOrderId = ?;
    `, [returnOrderId])
    return buildSkuItem(rows);
}

exports.insertNewSKUItem = async (newSkuItem) => {
    
    let date = newSkuItem.DateOfStock;
    if (date != undefined)
        date = dayjs(date, ["YYYY/MM/DD HH:mm", "YYYY/MM/DD"]);
    await dbHelp.queryDBRun(`
            INSERT INTO SKUItem(RFID, SKUId, Available, DateOfStock)
            VALUES(?, ?, ?, ?);
        `, [newSkuItem.RFID, newSkuItem.SKUId, 0, date == undefined ? "NULL" : date.format("YYYY/MM/DD HH:mm")]);
}

exports.insertInternalOrder = async (RFID, intOrdId) => {
    
    await dbHelp.queryDBRun(`
        UPDATE SKUItem
        SET internalOrderId = ?
        WHERE RFID = ?;
    `, [intOrdId, RFID]);
}

exports.insertRestockOrder= async (RFID, restockOrdId, itemId) => {
    
    await dbHelp.queryDBRun(`
        UPDATE SKUItem
        SET restockOrderId = ?, itemId = ?
        WHERE RFID = ?;
    `, [restockOrdId, itemId, RFID])
}

exports.insertReturnOrder = async (RFID, returnOrdId) => {
    
    await dbHelp.queryDBRun(`
        UPDATE SKUItem
        SET returnOrderId = ?
        WHERE RFID = ?;
    `, [returnOrdId, RFID])
}

exports.updateSKUItem = async (skuMod, RFID) => {
    
    let date = skuMod.newDateOfStock;
    if (date != undefined)
        date = dayjs(date, ["YYYY/MM/DD HH:mm", "YYYY/MM/DD"]);
    await dbHelp.queryDBRun(`
            UPDATE SKUItem
            SET RFID = ?, Available = ?, DateOfStock = ?
            WHERE RFID=?;
        `, [skuMod.newRFID, skuMod.newAvailable, date == undefined ? "NULL" : date.format("YYYY/MM/DD HH:mm"), RFID]);
}

exports.deleteSKUItem = async (RFID) => {
    
    await dbHelp.queryDBRun(`
    DELETE
    FROM SKUItem
    WHERE rfid=?;
`, [RFID]);
}

exports.deleteSkuItemData = async () => {
    
    await dbHelp
        .queryDBRun(`
        DELETE
        FROM SKUItem`);
}
