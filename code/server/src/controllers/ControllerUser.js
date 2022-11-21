'use strict';
const HTTPError = require("./HTTPError");

class UserController{
    #wh;
    #isLogged;
    #currUser;
    #userDao;
    constructor(wh, userDao) {
        this.#wh = wh;
        this.#isLogged = false;
        this.#currUser = undefined;
        this.#userDao = userDao;
    }

    async createTables(){
       // Create the table of Users in the DB if it not exists (just first time)
        await this.#userDao.createTable();

        // Insert the row of the hardcoded accounts
        // TODO remove before sending it
        /*
        await this.#userDao.insertOrIgnoreNewUser("user0N", "user0S", "user1@ezwh.com", "testpassword", "customer");

        await this.#userDao.insertOrIgnoreNewUser("qualityEmployee0N", "qualityEmployee0S", "qualityEmployee1@ezwh.com", "testpassword", "qualityEmployee");

        await this.#userDao.insertOrIgnoreNewUser("clerk0N", "clerk0S", "clerk1@ezwh.com", "testpassword", "clerk");

        await this.#userDao.insertOrIgnoreNewUser("deliveryEmployee0N", "deliveryEmployee0S", "deliveryEmployee1@ezwh.com", "testpassword", "deliveryEmployee");

        await this.#userDao.insertOrIgnoreNewUser("supplier0N", "supplier0S", "supplier1@ezwh.com", "testpassword", "supplier");

        await this.#userDao.insertOrIgnoreNewUser("manager0N", "manager0S", "manager1@ezwh.com", "testpassword", "manager");
        */
    }

    //  USER
    /*
        COMPLETED
    */ 

    getUserInfo = () => {

        if(!this.#isLogged)
            throw HTTPError.E401("not logged in")
        
        return this.#currUser
    }

    getSuppliers = async () => {

        let suppliers = await this.#userDao.getSuppliers();
    
        return suppliers.map((supplier) => {
            return {
                "id": supplier.id,
                "name":supplier.name,
                "surname":supplier.surname,
                "email":supplier.email
            }
        })
    }

    getUsers = async () => {
        return await this.#userDao.getUsers();
    }

    getUser = async (userId) => {
        let user = await this.#userDao.getUserById(userId);

        if(user == undefined)
            throw HTTPError.E404("Not Found");

        return user
    }

    getUserByEmailType = async (email, type) => {
        let user = await this.#userDao.getUserByEmailType(email, type);

        if(user == undefined)
            throw HTTPError.E404("Not Found");

        return user
    }

    checkType(type){
        return type!=="customer"
            && type!=="qualityEmployee"
            && type!=="clerk"
            && type!=="deliveryEmployee"
            && type!=="supplier";
    }

    postNewUser = async (newUser) => {
        let type = newUser.type
        // Check that the types are those that are in the API
        if(this.checkType(type))
            throw HTTPError.E422("User type is not correct");

        // email and type must be unique
        const user = await this.#userDao.getUserByEmailType(newUser.username, newUser.type)
        if(user != undefined)
            throw HTTPError.E409("User with that type and email already Exists");

        await this.#userDao.insertNewUser(newUser);
    }

    putUser = async (email, userMod) => {

        let oldType = userMod.oldType
        let newType = userMod.newType
        // Check that the types are those that are in the API
        if(this.checkType(oldType) || this.checkType(newType))
            throw HTTPError.E422("User type is not correct");

        const oldUser = await this.#userDao.getUserByEmailType(email, oldType);
        if(oldUser == undefined)
            throw HTTPError.E404("User doesn't exist")

        // email and type must be unique
        if(oldType !== newType){
            const newUser = await this.#userDao.getUserByEmailType(email, newType)
            if(newUser != undefined)
                throw HTTPError.E422("User with that type and email already Exists");
        }

        await this.#userDao.updateUser(email,userMod);
    }

    deleteUser = async (email, type) => {
        // Check that the types are those that are in the API
        if(this.checkType(type))
            throw HTTPError.E422("User type is not correct");
        /*
        const oldUser = await this.#userDao.getUserByEmailType(email, type);
        if(oldUser == undefined)
             throw HTTPError.E422("User doesn't exist")
         */

        await this.#userDao.deleteUser(email, type)
    }

    session = async (email, password, type) => {

        const user = await this.#userDao.logIn(email, password, type)

        if(user == undefined)
            throw HTTPError.E401("Wrong username and/or password");

        // save the state of the current User
        this.#currUser = user;
        this.#isLogged = true;

        return {
            id: this.#currUser.id,
            username: this.#currUser.email,
            name: this.#currUser.name
        }
    }

    logout = () => {
        this.#isLogged = false;
        this.#currUser = undefined;
    }

}

module.exports = UserController;