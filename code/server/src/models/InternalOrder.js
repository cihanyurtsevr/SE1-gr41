'use strict';
const DatabaseHelper = require("../database/DatabaseHelper");
const { pathDB } = require("../controllers/Warehouse");
const { StateInternal } = require("./StateOrders");

const dbHelp = new DatabaseHelper(pathDB);
class InternalOrder{
    id;
    issueDate;
    state;
    customerId;

    products; // if(COMPLETED)  Array of SKU+Qty (From Join)
              // else           Array of SKUItem

    constructor(id, issueDate, state, customerId){
        this.id = id;
        this.issueDate = issueDate;
        this.state = state;
        this.customerId = customerId;
    }
}

const buildInternalOrder = (rows) => {
    return rows.map((row) => {
        return new InternalOrder(row.id, row.issueDate, row.state, row.customerId);
    })
}

exports.createTable = async () => {
    
    await dbHelp.queryDBRun(`
        CREATE TABLE IF NOT EXISTS InternalOrder (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            issueDate DATETIME NOT NULL,
            customerId INTEGER NOT NULL,
            state int NOT NULL,
            CHECK(
                customerId > 0
            )
        );
        `)
}

exports.deleteTable = async () => {
    
    await dbHelp.queryDBRun(`
        DROP TABLE IF EXISTS InternalOrder;
    `)
}

exports.getInternalOrders = async () => {
    
    const rows = await dbHelp.queryDBAll(`
        SELECT *
        FROM InternalOrder;
    `)
    return buildInternalOrder(rows);
}

exports.getInternalOrderById = async (id) => {
    
    const rows = await dbHelp.queryDBAll(`
        SELECT *
        FROM InternalOrder
        WHERE id = ?;
    `,[id])
    return (buildInternalOrder(rows))[0];
}

exports.insertInternalOrder = async (newIntOrd) => {
    
    await dbHelp.queryDBRun(`
        INSERT INTO InternalOrder(issueDate, customerId, state)
        VALUES (?, ?, ?);
    `,[newIntOrd.issueDate, newIntOrd.customerId, StateInternal.ISSUED]);

    // get id
    let {id} = (await dbHelp.queryDBAll(`
            SELECT id
            FROM InternalOrder
            WHERE issueDate = ? AND customerId = ? AND state=?
            ORDER BY id DESC
            LIMIT 1;
        `, [newIntOrd.issueDate, newIntOrd.customerId, StateInternal.ISSUED]))[0]

    // for each SKU in array products do an Insert into Join table
    for(const product of newIntOrd.products){
        await this.insertJoin(id, product.SKUId, product.description, product.price, product.qty)
    }
}

exports.updateInternalOrder = async (id, state) => {
    
    await dbHelp.queryDBRun(`
            UPDATE InternalOrder
            SET state = ?
            WHERE id=? ;
        `,[state, id])
}

exports.deleteInternalOrder = async (id) => {
    

    this.deleteJoin(id);

    await dbHelp.queryDBRun(`
            DELETE
            FROM InternalOrder
            WHERE id=?;
        `, [id]);
}

class JoinIntOrdSKU{
    internalOrderId;
    SKUId;
    description;
    price;
    qty;

    constructor(internalOrderId, SKUId, description, price, qty){
        this.internalOrderId = internalOrderId;
        this.SKUId = SKUId;
        this.description = description;
        this.price = price;
        this.qty = qty;
    }
}

const buildJoin = (rows) => {
    return rows.map((row) => {
        return new JoinIntOrdSKU(row.internalOrderId, row.SKUId, row.description, row.price, row.qty);
    })
}

exports.createTableJoinIntOrdSKU = async () => {
    
    await dbHelp.queryDBRun(`
        CREATE TABLE IF NOT EXISTS JoinIntOrdSKU (
            internalOrderId INTEGER NOT NULL,
            SKUId INTEGER NOT NULL,
            description varchar(32) NOT NULL,
            price double NOT NULL,
            qty INTEGER NOT NULL,
            PRIMARY KEY(internalOrderId, SKUId),
            CHECK(
                internalOrderId > 0 AND
                SKUId > 0 AND
                qty >= 0 AND
                price >= 0
            )
        );
        `);
}

exports.deleteTableJoinIntOrdSKU = async () => {
    
    await dbHelp.queryDBRun(`
        DROP TABLE IF EXISTS JoinIntOrdSKU;
    `)
}

exports.getJoinByInterOrdId = async (internalOrderId) => {
    
    const rows = await dbHelp.queryDBAll(`
        SELECT *
        FROM JoinIntOrdSKU
        WHERE internalOrderId=?;
    `,[internalOrderId]);
    return buildJoin(rows);
}

exports.insertJoin = async (internalOrderId, SKUId, description, price, qty) => {
    
    await dbHelp.queryDBRun(`
        INSERT INTO JoinIntOrdSKU(internalOrderId, SKUId, description, price, qty)
        VALUES (?, ?, ?, ?, ?);
    `,[internalOrderId, SKUId, description, price, qty])
}

exports.deleteJoin = async (internalOrderId) => {
    
    await dbHelp.queryDBRun(`
            DELETE 
            FROM JoinIntOrdSKU
            WHERE internalOrderId=?;
        `,[internalOrderId])
}

exports.deleteJoinTable = async () => {
    
    await dbHelp.queryDBRun(`
        DELETE
        FROM JoinIntOrdSKU
        `) 
}