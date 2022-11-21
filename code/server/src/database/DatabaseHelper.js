"use strict"
const sqlite = require("sqlite3");

class DatabaseHelper{
    db;

    constructor(pathSQLite){
        this.db = new sqlite.Database(pathSQLite, (err) => {
            if(err){
                console.log("Error connection with: "+pathSQLite+" "+err);
                throw err;
            }
        });
    }

    queryDBAll(sql, data=[]){
        return new Promise((resolve, reject) => {
            this.db.all(sql, data, (err, rows) => {
                if(err){
                    console.log("Error query: "+sql);
                    reject(err);
                }else{
                    resolve(rows);
                }
            })
        })
    }

    queryDBRun(sql, data=[]){
        return new Promise((resolve, reject) => {
            this.db.run(sql, data, (err) => {
                if(err){
                    //console.log("Error query: "+sql);
                    reject(err);
                }
                else
                    resolve(true);
            })
        })
    }

}

module.exports = DatabaseHelper