'use strict';
const DatabaseHelper = require("../database/DatabaseHelper");
const {pathDB} = require("../controllers/Warehouse");
const CryptoJS = require("crypto-js");
const Base64 = require('crypto-js/enc-base64');
const dbHelp = new DatabaseHelper(pathDB);


class User{
    id;
    name;
    surname;
    email;
    password;
    type;

    constructor(id, name, surname, email, type){
        this.id = id;
        this.email = email;
        this.name = name;
        this.surname = surname;
        this.type = type;
    }
}

const buildUser = (rows) => {
    return rows.map((row) => {
        return new User(row.id, row.name, row.surname,row.email, row.type)
    })
}

exports.createTable = async () => {
    
    await dbHelp.queryDBRun(`
        CREATE TABLE IF NOT EXISTS User (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name varchar(32) NOT NULL,
            surname varchar(32) NOT NULL,
            email varchar(50) NOT NULL,
            passwordHash varchar(50) NOT NULL,
            type varchar(12) NOT NULL,
            UNIQUE (email, type),
            CHECK(
                type IN ("customer", "qualityEmployee", "clerk", "deliveryEmployee", "supplier", "manager")
            )
        );
    `);
}

exports.deleteTable = async () => {
    
    await dbHelp.queryDBRun(`
        DROP TABLE IF EXISTS User;
    `)
}

exports.getSuppliers = async () =>{
    
    const rows = await dbHelp.queryDBAll(`
        SELECT *
        FROM USER
        WHERE type="supplier";
    `)
    return buildUser(rows);
}

exports.getUsers = async () =>{
    
    const rows = await dbHelp.queryDBAll(`
        SELECT *
        FROM USER
        WHERE type<>"manager";
    `)
    return buildUser(rows);
}

exports.getUserById = async (id) =>{
    
    const rows = await dbHelp.queryDBAll(`
        SELECT *
        FROM USER
        WHERE id = ?;
    `, [id])
    return buildUser(rows)[0];
}

exports.getUserByEmailType = async (email, type) => {
    
    const rows = await dbHelp.queryDBAll(`
            SELECT *
            FROM USER
            WHERE email=? AND type=?;
        `,[email, type]);
    return buildUser(rows)[0];
}

exports.insertNewUser = async (newUser) => {
    
    await dbHelp.queryDBRun(`
        INSERT INTO USER(name, surname, email, passwordHash, type)
        VALUES (?, ?, ? ,?, ?)
    `,[newUser.name, newUser.surname, newUser.username, Base64.stringify(CryptoJS.SHA256(newUser.password)), newUser.type]);
}

exports.insertOrIgnoreNewUser = async (name, surname, email, password, type) => {
    
    await dbHelp.queryDBRun(`
            INSERT OR IGNORE INTO USER(name, surname, email, passwordHash, type)
            VALUES (?, ?, ? ,?, ?);
        `,[name, surname, email,Base64.stringify(CryptoJS.SHA256(password)), type]);
}

exports.updateUser = async (email, userMod) => {
    
    await dbHelp.queryDBRun(`
        UPDATE USER
        SET type = ?
        WHERE email=? AND type=?;
    `,[userMod.newType , email, userMod.oldType])
}

exports.deleteUser = async (email, type) => {
    
    await dbHelp.queryDBRun(`
        DELETE
        FROM USER
        WHERE email=? AND type=?;
    `, [email, type]);
}

exports.logIn = async (email, password, type) => {
    
    const rows = await dbHelp.queryDBAll(`
        SELECT *
        FROM USER
        WHERE email=? AND passwordHash=? AND type=?;
    `, [email, Base64.stringify(CryptoJS.SHA256(password)), type])
    return buildUser(rows)[0];
}