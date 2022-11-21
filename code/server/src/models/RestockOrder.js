'use strict';
const DatabaseHelper = require("../database/DatabaseHelper");
const { pathDB } = require("../controllers/Warehouse");
const {StateRestock} = require("./StateOrders");

const dbHelp = new DatabaseHelper(pathDB);
class TransportNote{
    id;
    deliveryDate;

    constructor(id, deliveryDate){
        this.id = id;
        this.deliveryDate = deliveryDate;
    }
}

const buildTransportNote = (rows) => {
    return rows.map((row) => {
        return new TransportNote(row.id, row.deliveryDate);
    })
}

exports.createTableTransportNote = async () => {
    
    await dbHelp.queryDBRun(`
        CREATE TABLE IF NOT EXISTS TransportNote (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            deliveryDate DATETIME NOT NULL
        );
    `)
}

exports.deleteTableTransportNote = async () => {
    
    await dbHelp.queryDBRun(`
        DROP TABLE IF EXISTS TransportNote;
    `)
}

exports.getTransportNoteById = async (id) => {
    
    const rows = await dbHelp.queryDBAll(`
        SELECT *
        FROM TransportNote
        WHERE id=?;
    `,[id])
    return buildTransportNote(rows)[0];
}

exports.insertTransportNote = async (transportNote) => {
    
    await dbHelp.queryDBRun(`
        INSERT INTO TransportNote(deliveryDate)
        VALUES (?);
    `,[transportNote.deliveryDate]);

    let {id} =  (await dbHelp.queryDBAll(`
        SELECT id
        FROM TransportNote
        WHERE deliveryDate = ?
        ORDER BY id DESC
        LIMIT 1;
    `, [transportNote.deliveryDate]))[0];
    return id;
}

class RestockOrder{
    id;
    issueDate;
    state;
    supplierId;
    transportNote;

    products; // Array of Item+Qty (From Join)
    skuItems; // Array of SKUItem

    constructor(id, issueDate, state, supplierId, transportNote){
        this.id = id;
        this.issueDate = issueDate;
        this.state = state;
        this.supplierId = supplierId;
        this.transportNote = transportNote;
    }
}

const buildRestockOrder = (rows) => {
    return rows.map((row) => {
        return new RestockOrder(row.id, row.issueDate, row.state, row.supplierId, row.transportNote);
    })
}

exports.createTableRestockOrder = async () => {
    
    await dbHelp.queryDBRun(`
        CREATE TABLE IF NOT EXISTS RestockOrder (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            issueDate DATETIME NOT NULL,
            state int NOT NULL,
            supplierId INTEGER NOT NULL,
            transportNote INTEGER,
            CHECK(
                supplierId >= 0 AND
                transportNote >= 0
            )
        );
    `)
}

exports.deleteTableRestockOrder = async () => {
    
    await dbHelp.queryDBRun(`
        DROP TABLE IF EXISTS RestockOrder;
    `)
}

exports.getRestockOrders = async () => {
    
    const rows = await dbHelp.queryDBAll(`
        SELECT *
        FROM RestockOrder;
    `)
    return buildRestockOrder(rows);
}

exports.getRestockOrderById = async (id) => {
    
    const rows = await dbHelp.queryDBAll(`
        SELECT *
        FROM RestockOrder
        WHERE id = ?;
    `,[id])
    return (buildRestockOrder(rows))[0];
}

exports.insertNewRestockOrder = async (newRestOrd) => {
    
    await dbHelp.queryDBRun(`
        INSERT INTO RestockOrder(issueDate, supplierId, state)
        VALUES (?, ?, ?);
    `, [newRestOrd.issueDate, newRestOrd.supplierId, StateRestock.ISSUED]);
    
    // get the id
    let {id} = (await dbHelp.queryDBAll(`
        SELECT id
        FROM RestockOrder
        WHERE issueDate = ? AND supplierId = ? AND state = ?
        ORDER BY id DESC
        LIMIT 1;
    `, [newRestOrd.issueDate, newRestOrd.supplierId, StateRestock.ISSUED]))[0]

    // for each SKU in array products do an Insert into Join table
    for(const product of newRestOrd.products){
        await this.insertJoin(id, product.SKUId, product.itemId, product.description, product.price, product.qty)
    }
}

exports.updateRestockOrderStatus = async (id, state) => {
    
    await dbHelp.queryDBRun(`
        UPDATE RestockOrder
        SET state = ?
        WHERE id=? ;
    `,[state, id])
}

exports.updateRestockOrderTranspNote = async (id, transpNoteId) => {
    
    await dbHelp.queryDBRun(`
        UPDATE RestockOrder
        SET transportNote = ?
        WHERE id=? ;
    `,[transpNoteId, id])
}

exports.deleteRestockOrder = async (id) => {
    

    await this.deleteJoin(id);

    await dbHelp.queryDBRun(`
        DELETE
        FROM RestockOrder
        WHERE id = ?;
    `, [id]);
}

class JoinRstkOrdSKU{
    restockOrdID;
    SKUId;
    itemId;
    description;
    price;
    qty;

    constructor(restockOrdID, SKUId, itemId, description, price, qty){
        this.restockOrdID = restockOrdID;
        this.SKUId = SKUId;
        this.itemId = itemId;
        this.description = description;
        this.price = price;
        this.qty = qty;
    }
}

const buildJoin = (rows) => {
    return rows.map((row) => {
        return new JoinRstkOrdSKU(row.restockOrdId, row.SKUId, row.itemId, row.description, row.price, row.qty);
    })
}

exports.createTableJoinRstkOrdSKU = async () => {
    
    await dbHelp.queryDBRun(`
        CREATE TABLE IF NOT EXISTS JoinRstkOrdSKU (
            restockOrdId INTEGER NOT NULL,
            SKUId INTEGER NOT NULL,
            itemId INTEGER NOT NULL,
            description varchar(32) NOT NULL,
            price double NOT NULL,
            qty INTEGER NOT NULL,
            PRIMARY KEY(restockOrdId, itemId),
            CHECK(
                restockOrdId > 0 AND
                SKUId > 0 AND
                qty >= 0 AND
                price >= 0
            )
        );
    `)
}

exports.deleteTableJoinRstkOrdSKU = async () => {
    
    await dbHelp.queryDBRun(`
        DROP TABLE IF EXISTS JoinRstkOrdSKU;
    `);
}

exports.getJoinByRstkOrdId = async (restockOrderId) => {
    
    const rows = await dbHelp.queryDBAll(`
        SELECT *
        FROM JoinRstkOrdSKU
        WHERE restockOrdId=?;
    `,[restockOrderId])
    return buildJoin(rows);
}

exports.insertJoin = async (restockOrdId, SKUId, itemId, description, price, qty) => {
    
    await dbHelp.queryDBRun(`
        INSERT INTO JoinRstkOrdSKU(restockOrdId, SKUId, itemId, description, price, qty)
        VALUES (?, ?, ?, ?, ?, ?);
    `,[restockOrdId, SKUId, itemId, description, price, qty])
}

exports.deleteJoin = async (restockOrderId) => {
    
    await dbHelp.queryDBRun(`
        DELETE
        FROM JoinRstkOrdSKU
        WHERE restockOrdId = ?;
    `, [restockOrderId])
}
exports.deleteJoinTable = async () => {
    
    await dbHelp.queryDBRun(`
        DELETE
        FROM JoinRstkOrdSKU
        `) 
}

exports.deleteRestockOrderData = async () => {
    
    await dbHelp
        .queryDBRun(`
        DELETE
        FROM RestockOrder`);
  }