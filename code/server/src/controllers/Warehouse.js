'use strict';
const SKUController = require("./ControllerSKU");
const UserController = require("./ControllerUser");
const ItemController = require("./ControllerItem");
const TestController = require("./ControllerTest");
const OrderController = require("./OrderController");
const pathDB = "./src/database/ezwhDB.sqlite"
exports.pathDB = pathDB;

const SKUDao = require("../models/SKU");
const SKUItemDao = require("../models/SKUItem");
const PositionDao = require("../models/Position");
const TestDescriptorDao = require("../models/TestDescriptor");
const TestResultDao = require("../models/TestResult");
const UserDao = require("../models/User");
const RestockOrderDao = require("../models/RestockOrder");
const ReturnOrderDao = require("../models/ReturnOrder");
const InternalOrderDao = require("../models/InternalOrder");
const ItemDao = require("../models/Item");

class Warehouse {
    static #whSingle;

    constructor() {
        this.SKUCtrl = new SKUController(this, SKUDao, SKUItemDao);
        this.UserCtrl = new UserController(this, UserDao);
        this.ItemCtrl = new ItemController(this, ItemDao, PositionDao);
        this.TestCtrl = new TestController(this, TestDescriptorDao, TestResultDao);
        this.OrderCtrl = new OrderController(this, RestockOrderDao, ReturnOrderDao, InternalOrderDao);
    }

    static getInstance = () => {
        if(Warehouse.#whSingle === undefined)
            Warehouse.#whSingle = new Warehouse();
        return Warehouse.#whSingle;
    }

    async createTables(){
        await this.SKUCtrl.createTables();
        await this.UserCtrl.createTables();
        await this.ItemCtrl.createTables();
        await this.TestCtrl.createTables();
        await this.OrderCtrl.createTables();
    }

    hasPermissions = (...args) => {
        //let currUser = this.UserCtrl.getUserInfo();
        //return args.some((type) => type===currUser.type)
        return true
    }

}

exports.Warehouse = Warehouse;