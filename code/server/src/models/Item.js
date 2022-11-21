'use strict';
const dayjs = require("dayjs");
var customParseFormat = require('dayjs/plugin/customParseFormat')
dayjs.extend(customParseFormat);
const DatabaseHelper = require("../database/DatabaseHelper");
const { pathDB } = require("../controllers/Warehouse");

const dbHelp = new DatabaseHelper(pathDB);
class ItemI {
    id;
    description;
    price;
    SKUId;
    supplierId

    constructor(id, description, price, SKUId, supplierId) {
        this.id = id;
        this.description = description;
        this.price = price;
        this.SKUId = SKUId;
        this.supplierId = supplierId;
    }
}

const buildItem = (rows) => {
    return rows.map((row) => {
        return new ItemI(row.id, row.description, row.price, row.SKUId, row.supplierId);
    })
}

exports.deleteTable = async () => {
    
    await dbHelp.queryDBRun(`
        DROP TABLE IF EXISTS Item;
    `);
}

exports.createTable = async () => {
    // Create the table of ItbuildItem in the db if it not exists (just first time)
    
    await dbHelp.queryDBRun(`
    CREATE TABLE IF NOT EXISTS Item (
        id int NOT NULL,
        SKUId int NOT NULL,
        supplierId int NOT NULL,
        description varchar(128),
        price double NOT NULL,
        CHECK(
            SKUId > 0 AND
            supplierId > 0 AND
            price  >= 0
        ),
        PRIMARY KEY(id, supplierId)
    );
    `)
}

exports.getItems = async () => {
    
    let rows = await dbHelp.queryDBAll(`
    SELECT *
    FROM Item;
`)
    return await buildItem(rows);
};

exports.getItem = async (id, supplierId) => {
    
    let rows = await dbHelp.queryDBAll(`
        SELECT *
        FROM Item
        WHERE id=? AND supplierId=?;
    `,
        [id, supplierId])
    return (buildItem(rows))[0];
}

exports.getItemsBySupplId = async (supplierId) => {
    
    let rows = await dbHelp.queryDBAll(`
    SELECT *
    FROM Item
    WHERE supplierId=?;
`, [supplierId]);

    return (buildItem(rows));
}

exports.getItemBySKUIdAndSupplId = async (skuId, supplierId) => {
    
    let rows = await dbHelp.queryDBAll(`
    SELECT *
    FROM Item
    WHERE SKUId=? AND supplierId=?;
    `, [skuId, supplierId]);

    return (buildItem(rows));
}

exports.insertNewItem = async (newid) => {
    
    await dbHelp.queryDBRun(`
    INSERT INTO Item(id, description,price, SKUId, supplierId)
    VALUES(?, ?, ?, ?, ?);
`, [newid.id, newid.description, newid.price, newid.SKUId, newid.supplierId]);

}

exports.updateItem = async (itemMod, id, supplierId) => {
    
    await dbHelp.queryDBRun(`
    UPDATE Item
    SET    description = ?, price = ?
    WHERE id=? AND supplierId=?;
`, [itemMod.newDescription, itemMod.newPrice , id, supplierId]);
}

exports.deleteItem = async (id, supplierId) => {
    
    await dbHelp
        .queryDBRun(`
        DELETE
        FROM Item
        WHERE id=? AND supplierId=?;
    `, [id, supplierId]);
}


  exports.deleteItemData = async () => {
    
    await dbHelp
        .queryDBRun(`
        DELETE
        FROM Item`);
  }
    