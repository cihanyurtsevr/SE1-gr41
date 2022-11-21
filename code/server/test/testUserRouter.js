'use strict';
const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
chai.should();
const userDao = require('../src/models/User');

const app = require("../server");
const { before } = require('mocha');
const agent = chai.request.agent(app);

let userSample = {
    "username":"michelino@ezwh.it",
    "name":"Michele",
    "surname" : "Cerra",
    "password" : "passwordDebole",
    "type" : "customer"
}

describe("Scenario 4-1 Create user and define rights", () => {
    beforeEach(async function() {
        await userDao.deleteTable();
        await userDao.createTable();
    })

    newUser("test correct user", 201, "michele@ezwh.com", "Michele", "Cerra", "fortissi", "customer")

    newUser("test no email", 422, undefined, "Michele", "Cerra", "fortissi", "customer")
    newUser("test no name", 422, "michele@ezwh.com", undefined, "Cerra", "fortissi", "customer")
    newUser("test no surname", 422, "michele@ezwh.com", "Michele", undefined, "fortissi", "customer")
    newUser("test no password", 422, "michele@ezwh.com", "Michele", "Cerra", undefined, "customer")
    newUser("test no type", 422, "michele@ezwh.com", "Michele", "Cerra", "fortissi", undefined)

    newUser("test short password", 422, "michele@ezwh.com", "Michele", "Cerra", "debole1", "customer")
    newUser("test wrong email", 422, "myMail", "Michele", "Cerra", "fortissi", "customer")
    newUser("test strange name or surname", 201, "michele@ezwh.com", "Michele1", "Cerra1", "fortissi", "customer")
    newUser("test creation type manager", 422, "michele@ezwh.com", "Michele", "Cerra", "fortissi", "manager")

    it("create a user with same name and type of another", async function() {
        let res = await agent.post("/api/newUser")
            .send(userSample);
        res.should.have.status(201)

        let anotherUserSample = {
            "username":userSample.username,
            "name":"Giovanni",
            "surname" : "Muciaccia",
            "password" : "artisticPassword",
            "type" : userSample.type
        }

        res = await agent.post("/api/newUser")
            .send(anotherUserSample);
        res.should.have.status(409);

        let user = await userDao.getUserByEmailType(userSample.username, userSample.type)
        if(user != undefined){
            user.email.should.equal(userSample.username);
            user.name.should.equal(userSample.name);
            user.surname.should.equal(userSample.surname);
            user.type.should.equal(userSample.type);
        }

    })
})

describe("Scenario 4-2 Modify user rights", () => {
    beforeEach(async function() {
        await userDao.deleteTable();
        await userDao.createTable();

        await userDao.insertNewUser(userSample);
    })

    updateUser("test correct update", 200, "michelino@ezwh.it", "customer", "supplier");
    updateUser("test update with same type", 200, "michelino@ezwh.it", "customer", "customer");

    updateUser("test wrong old type", 404, "michelino@ezwh.it", "clerk", "supplier");
    updateUser("test wrong email", 404, "michelino1@ezwh.it", "customer", "supplier");
    updateUser("test not existing user", 404, "anotherUser@ezwh.it", "clerk", "supplier");

    updateUser("test undefined oldType", 422, "michelino@ezwh.it", undefined, "customer");
    updateUser("test undefined oldType", 422, "michelino@ezwh.it", "customer", undefined);

    updateUser("test uncorrect mail", 422, "myEmail", "customer", "supplier");
    updateUser("test uncorrect oldType", 422, "michelino@ezwh.it", "seller", "supplier");
    updateUser("test uncorrect newType", 422, "michelino@ezwh.it", "customer", "chef");
    updateUser("test newType Manager or administrator", 422, "michelino@ezwh.it", "customer", "manager");
    updateUser("test oldType Manager or administrator", 422, "michelino@ezwh.it", "manager", "supplier");

})

describe("Scenario 4-3 Delete user", () => {
    beforeEach(async function() {
        await userDao.deleteTable();
        await userDao.createTable();

        await userDao.insertNewUser(userSample);
    })

    deleteUser("test correct deletion", 204, userSample.username, userSample.type);
    deleteUser("test username not in db", 204, "michele1@ezwh.com", userSample.type);
    deleteUser("test wrong type", 422, userSample.username, "unknownType")
    deleteUser("test uncorrect username", 422, "myEmail", userSample.type);
    deleteUser("test undefined username", 422, undefined, userSample.type);
    deleteUser("test undefined type", 422, userSample.username, undefined);

    it("Test attempt to delete a manager/admin", async function() {
        let username = "michelino@ezwh.it"
        let type = "manager"
        await userDao.insertNewUser({
            "username":username,
            "name":"Michele",
            "surname" : "Cerra",
            "password" : "passwordDebole",
            "type" : type
        })

        let res = await agent.delete(`/api/users/michelino@ezwh.it/manager`)
        res.should.have.status(422);

        let user = await userDao.getUserByEmailType(username, type);
        if(res.status === 204){
            user.should.equal(undefined)
        }else{
            user.email.should.equal(username);
            user.type.should.equal(type);
        }
    })

})

describe("Scenario 7-1 Login", () => {

    beforeEach(async function(){
        await userDao.insertOrIgnoreNewUser("user0N", "user0S", "user1@ezwh.com", "testpassword", "customer");

        await userDao.insertOrIgnoreNewUser("qualityEmployee0N", "qualityEmployee0S", "qualityEmployee1@ezwh.com", "testpassword", "qualityEmployee");

        await userDao.insertOrIgnoreNewUser("clerk0N", "clerk0S", "clerk1@ezwh.com", "testpassword", "clerk");

        await userDao.insertOrIgnoreNewUser("deliveryEmployee0N", "deliveryEmployee0S", "deliveryEmployee1@ezwh.com", "testpassword", "deliveryEmployee");

        await userDao.insertOrIgnoreNewUser("supplier0N", "supplier0S", "supplier1@ezwh.com", "testpassword", "supplier");

        await userDao.insertOrIgnoreNewUser("manager0N", "manager0S", "manager1@ezwh.com", "testpassword", "manager");
    })

    let types = ["manager", "customer", "clerk", "qualityEmployee", "deliveryEmployee", "supplier"]

    for(const type of types){
        login(`test correct login ${type}`, 200, `${type !== "customer" ? type : "user" }1@ezwh.com`,"testpassword", type);
    }

    for(const type of types){
        login(`test wrong password login ${type}`, 401, `${type}1@ezwh.com`,"wrongPassword", type);
    }

    for(const type of types){
        login(`test wrong email login ${type}`, 401, `${type}@ezwh.com`,"testpassword", type);
    }

    for(let i=0;i<types.length-1; i++){
        login(`test wrong type ${types[i+1%types.length]} instead of ${types[i]}`, 401, `${types[i]}@ezwh.com`, "testpassword", types[i+1%types.length]);
    }
})

describe("Scenario 7-2 Logout", () => {
    it("test logout", async function(){
        let res = await agent.post("/api/logout")
        res.should.have.status(200)
    })
})

function newUser(title, expectedHTTPStatus, username, name, surname, password, type){
    it(title, async function(){
        let newUser = {
            "username":username,
            "name":name,
            "surname" : surname,
            "password" : password,
            "type" : type
        }

        let res = await agent.post("/api/newUser")
            .send(newUser);
        res.should.have.status(expectedHTTPStatus);

        let user = await userDao.getUserByEmailType(username, type)
        if(user != undefined){
            user.email.should.equal(username);
            user.name.should.equal(name);
            user.surname.should.equal(surname);
            user.type.should.equal(type);
        }
    })
}

function updateUser(title, expectedHTTPStatus, username, oldType, newType){
    it(title, async function(){
        let mod = {
            "oldType" : oldType,
            "newType" : newType
        }

        let res = await agent.put(`/api/users/${username}`)
            .send(mod);
        res.should.have.status(expectedHTTPStatus);

        let newUser = await userDao.getUserByEmailType(username, newType);
        if(newUser != undefined && res.status == 200){
            newUser.type.should.equal(newType);
        }
    })
}

function deleteUser(title, expectedHTTPStatus, username, type){
    it(title, async function(){
        let res = await agent.delete(`/api/users/${username}/${type}`)
        res.should.have.status(expectedHTTPStatus);

        let user = await userDao.getUserByEmailType(username, type);
        if(user != undefined){
            user.email.should.equal(username);
            user.type.should.equal(type);
        }
    })
}

function login(title, expectedHTTPStatus, username, password, type){
    it(title, async function(){
        let session = {
            "username" : username,
            "password" : password
        }
        let res = await agent.post(`/api/${type}Sessions`)
            .send(session)
        res.should.have.status(expectedHTTPStatus);

        let user = await userDao.getUserByEmailType(username, type);
        if(res.status !== 401 && user != undefined){
            res.body.username.should.equal(user.email);
            res.body.id.should.equal(user.id);
            res.body.name.should.equal(user.name);
        }

    })
}