'use strict';

const HTTPError = require("./HTTPError");

class ItemController {
    #wh;
    #ItemDao;
    #PositionDao;

    constructor(wh,ItemDao,PositionDao) {
        this.#wh = wh;
        this.#ItemDao = ItemDao;
        this.#PositionDao = PositionDao;
    }


    // Create the table of SKUItem in the db if it not exist (just first time)
    createTables = async () => {


        await this.#PositionDao.createTable();
        
        await this.#ItemDao.createTable();
    }



    getItems = async () => {


        const items = await this.#ItemDao.getItems();

        // The throw of a HTTPError.E500 is implicit of a generic failure of the program, so we don't need to throw it

        return items;

    };

    getItem = async (id, supplierId) => {
       
        const items = await this.#ItemDao.getItem(id, supplierId);

        if (items == undefined)
        throw HTTPError.E404("Not Found");

        return items;
    }

    getItemsBySupplId = async (supplierId) => {

        let supplier = await this.#wh.UserCtrl.getUser(supplierId)
        if (supplier.type !== "supplier")
            throw HTTPError.E422("The user is not a supplier")

        const items = await this.#ItemDao.getItemsBySupplId(supplierId);

        if (items.length == 0)
            return


        return items;
    }

    getItemBySKUIdAndSupplId = async (skuId, supplierId) => {

        const item = await this.#ItemDao.getItemsBySupplId(skuId,supplierId);
        
        if (item == undefined)
        throw HTTPError.E404("Not Found");

        return item;
    }

    postItem = async (newid) => {

        await this.#ItemDao.insertNewItem(newid);

    }

    putItem = async (id, supplierId, itemMod) => {



        
            const Item = await  this.getItem(id, supplierId);
            // if nothing is throwed, it means that the itemid is already used, throw exception 422
        

        // at this point we hare sure that body is not empty and the itemId exists, because otherwise there is a throw exception
        // The control of error 404 is implict in the call of the getItem()

        // If only one field needs to be modified, the other one will contain the old value.



        itemMod.newPrice = itemMod.newPrice == undefined ? Item.price : itemMod.newPrice;
        itemMod.newDescription = itemMod.newDescription == undefined ? Item.description : itemMod.newDescription;

        await this.#ItemDao.updateItem(itemMod, id, supplierId);
    }

    deleteItem = async (id, supplierId) => {

        if (id == undefined)
            throw HTTPError.E422("Invalid args")
        /*
        try {
            await this.getItem(id);
            // at this point we hare sure that the RFID exists, because otherwise there is a throw exception
            // The control of error 404 is implict in the call of the getSKUItem()
        } catch (e) {
            if (e.status === 404)
                throw HTTPError.E422("PositionID doesn't exist");
            throw e;
        }
         */
        await this.#ItemDao.deleteItem(id, supplierId);
    }

    getPositions = async () => {

        let Positions = await this.#PositionDao.getPositions();

        return Positions
    }

    getPosition = async (positionID) => {

        let position = await this.#PositionDao.getPositionById(positionID);

        if (position == undefined)
            throw HTTPError.E404("No Position with that PositionId");

        return position
    }

    postPosition = async (newPosition) => {
        /*
        try {
            var Position = await this.getPosition(newPosition.positionID);
        } catch (e) {

        }
        if (Position !== undefined)
            throw HTTPError.E422("PositionID already Exists");
         */

        await this.#PositionDao.insertNewPosition(newPosition);
    }

    putPositionChangeID = async (positionID, posMod) => {

        let Position = await this.getPosition(positionID);
        posMod.newPositionID = posMod.newPositionID == undefined ? Position.positionID : posMod.newPositionID;

        if (positionID !== posMod.newPositionID) {
            // check if the new rfid already exists
            try {
                var newPosition = await this.getPosition(posMod.newPositionID);
                // if nothing is throwed, it means that the rfid is already used, throw exception 422
            } catch (e) {
                // if here it means that the new RFID doesn't exists, so it can be modified
            }
            if (newPosition !== undefined)
                throw HTTPError.E422("PositionID already Exists");
        }
        await this.#PositionDao.updatePositionById(posMod,positionID);
    }

    putPosition = async (positionID, posMod) => {

        let Position = await this.getPosition(positionID);

        // If only one field needs to be modified, the other one will contain the old value.
        posMod.newAisleID = posMod.newAisleID == undefined ? Position.aisleID : posMod.newAisleID;
        posMod.newRow = posMod.newRow == undefined ? Position.row : posMod.newRow;
        posMod.newCol = posMod.newCol == undefined ? Position.col : posMod.newCol;
        posMod.newMaxWeight = posMod.newMaxWeight == undefined ? Position.maxWeight : posMod.newMaxWeight;
        posMod.newMaxVolume = posMod.newMaxVolume == undefined ? Position.maxVolume : posMod.newMaxVolume;
        posMod.newOccupiedWeight = posMod.newOccupiedWeight == undefined ? Position.occupiedWeight : posMod.newOccupiedWeight;
        posMod.newOccupiedVolume = posMod.newOccupiedVolume == undefined ? Position.occupiedVolume : posMod.newOccupiedVolume;
        let newPositionID = '' + posMod.newAisleID + posMod.newRow + posMod.newCol



        // only if the new RFID is differend than the previous
        if (positionID !== newPositionID) {
            // check if the new rfid already exists
            try {
                var newPosition = await this.getPosition(newPositionID);
                // if nothing is throwed, it means that the rfid is already used, throw exception 422
            } catch (e) {
                // if here it means that the new RFID doesn't exists, so it can be modified
            }
            if (newPosition !== undefined)
                throw HTTPError.E422("PositionID already Exists");
        }

        if(posMod.newOccupiedVolume > posMod.newMaxVolume
            || posMod.newOccupiedWeight > posMod.newMaxWeight)
            throw HTTPError.E422("Not enought space or too weight");

        await this.#PositionDao.updatePosition(posMod,positionID);

    }

    deletePosition = async (positionID) => {

        /*
        try {
            await this.getPosition(positionID);
        } catch (e) {
            if (e.status === 404)
                throw HTTPError.E422("PositionID doesn't exist");
            throw e;
        }
         */
        await this.#PositionDao.deletePosition(positionID);
    }
}





module.exports = ItemController;