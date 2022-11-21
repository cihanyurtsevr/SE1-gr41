'use strict';
const DatabaseHelper = require("../database/DatabaseHelper");
const { pathDB } = require("../controllers/Warehouse");

const dbHelp = new DatabaseHelper(pathDB);
class ReturnOrder{
    id;
    returnDate;
    restockOrderId;

    products; // Array of SKUItem

    constructor(id, returnDate, restockOrderId){
        this.id = id;
        this.returnDate = returnDate;
        this.restockOrderId = restockOrderId;
    }
}

const buildReturnOrder = (rows) => {
    return rows.map((row) => {
        return new ReturnOrder(row.id, row.returnDate,  row.restockOrderId);
    })
}

exports.createTable = async () => {
    
    await dbHelp.queryDBRun(`
        CREATE TABLE IF NOT EXISTS ReturnOrder (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            returnDate DATETIME NOT NULL,
            restockOrderId INTEGER NOT NULL,
            CHECK(
                restockOrderId > 0
            )
        );
        `);
}

exports.deleteTable = async () => {
    
    await dbHelp.queryDBRun(`
        DROP TABLE IF EXISTS ReturnOrder;
        `);
}

exports.getReturnOrders = async () => {
    
    const rows = await dbHelp.queryDBAll(`
        SELECT *
        FROM ReturnOrder;
    `)
    return buildReturnOrder(rows);
}

exports.getReturnOrderById = async (id) => {
    
    const rows = await dbHelp.queryDBAll(`
        SELECT *
        FROM ReturnOrder
        WHERE id=?;
    `, [id])
    return (buildReturnOrder(rows))[0];
}

exports.insertReturnOrder = async (newReturnOrder) => {
    
    await dbHelp.queryDBRun(`
            INSERT INTO ReturnOrder(returnDate, restockOrderId)
            VALUES (?, ?);
        `,[newReturnOrder.returnDate, newReturnOrder.restockOrderId]);
    let {id} = (await dbHelp.queryDBAll(`
            SELECT id
            FROM ReturnOrder
            WHERE returnDate = ? AND restockOrderId = ?
            ORDER BY id DESC
            LIMIT 1;
        `, [newReturnOrder.returnDate, newReturnOrder.restockOrderId]))[0]
    return id;
}

exports.deleteReturnOrder = async (id) => {
    
    await dbHelp.queryDBRun(`
            DELETE
            FROM ReturnOrder
            WHERE id = ?;
        `, [id])
}