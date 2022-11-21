'use strict';
const HTTPError = require("./HTTPError");

class SKUController {
    #wh;
    #SKUDao;
    #SKUItemDao;
    constructor(wh, SKUDao, SKUITemDao) {
        this.#wh = wh;
        this.#SKUDao = SKUDao;
        this.#SKUItemDao = SKUITemDao
    }

    createTables = async () => {
        await this.#SKUDao.createTable();
        await this.#SKUItemDao.createTable();
    }

    //  SKU
    /*
        COMPLETED
    */ 

    getSKUs = async () => {
        let TestCtrl = this.#wh.TestCtrl;
        let skus = await this.#SKUDao.getSKUs()

        skus = await Promise.all(skus.map(async (sku) => {
            try{
                // TODO  only id for DTO
                sku.testDescriptors = await TestCtrl.getTestDescriptorBySKUId(sku.id);
                sku.testDescriptors = sku.testDescriptors.map((testDescriptor) => {
                    return testDescriptor.id;
                })
            }catch (e){}
            return sku;
        }))

        return skus
    }

    getSKUById = async (skuId) => {
        let TestCtrl = this.#wh.TestCtrl;
        let sku = await this.#SKUDao.getSKUById(skuId);

        if(sku == undefined)
            throw HTTPError.E404("No SKU with that SKUID");

        try{
            sku.testDescriptors = await TestCtrl.getTestDescriptorBySKUId(sku.id);
            sku.testDescriptors = sku.testDescriptors.map((testDescriptor) => {
                return testDescriptor.id;
            })
        }catch (e){}
        
        return {
            "description" : sku.description,
            "weight" : sku.weight,
            "volume" : sku.volume,
            "notes" : sku.notes,
            "position" : sku.position,
            "availableQuantity" : sku.availableQuantity,
            "price" : sku.price,
            "testDescriptors" : sku.testDescriptors
        }
    }

    postSKU = async (newSKU) => {
        await this.#SKUDao.insertNewSKU(newSKU);
    }

    putSKU = async (oldSkuId, skuMod) => {
        let oldSKU = await this.#SKUDao.getSKUById(oldSkuId);
        if(oldSKU == undefined)
            throw HTTPError.E404("No SKU with that SKUID");

        skuMod.id = oldSKU.id;
        skuMod.newDescription = skuMod.newDescription == undefined ? oldSKU.description : skuMod.newDescription;
        skuMod.newWeight = skuMod.newWeight == undefined ? oldSKU.weight : skuMod.newWeight;
        skuMod.newVolume = skuMod.newVolume == undefined ? oldSKU.volume : skuMod.newVolume;
        skuMod.newNotes = skuMod.newNotes == undefined ? oldSKU.notes : skuMod.newNotes;
        skuMod.newPrice = skuMod.newPrice == undefined ? oldSKU.price : skuMod.newPrice;
        skuMod.newAvailableQuantity = skuMod.newAvailableQuantity == undefined ? oldSKU.availableQuantity : skuMod.newAvailableQuantity;

        if(oldSKU.position != undefined
            && ( skuMod.newAvailableQuantity !== oldSKU.availableQuantity
                || skuMod.newWeight !== oldSKU.weight
                || skuMod.newVolume !== oldSKU.volume) ){

            let newWeight = skuMod.newWeight*skuMod.newAvailableQuantity
            let newVolume = skuMod.newVolume*skuMod.newAvailableQuantity

            try{
                await this.#wh.ItemCtrl.putPosition(oldSKU.position,
                    {
                        "newOccupiedWeight": newWeight,
                        "newOccupiedVolume": newVolume
                    })
            }catch (e){
                throw HTTPError.E422("position error")
            }
            
        }

        await this.#SKUDao.updateSKU(skuMod);
    }

    putSKUPosition = async (skuId, positionId) => {

        let sku = await this.#SKUDao.getSKUById(skuId);
        if(sku == undefined)
            throw HTTPError.E404("sku not existing")
        let position = await this.#wh.ItemCtrl.getPosition(positionId)

        // check if the position is empty
        if(position.occupiedWeight !== 0 || position.occupiedVolume !==0)
            throw HTTPError.E422("position not empty")

        if(position.maxWeight < sku.weight*sku.availableQuantity
            || position.maxVolume < sku.volume*sku.availableQuantity)
            throw HTTPError.E422("no space in that position")

        let newWeight = sku.weight*sku.availableQuantity
        let newVolume = sku.volume*sku.availableQuantity

        await this.#wh.ItemCtrl.putPosition(positionId,
            {
                "newOccupiedWeight": newWeight,
                "newOccupiedVolume": newVolume
            })

        await this.#SKUDao.updateSKUPosition(skuId, positionId);
    }

    deleteSKU = async (skuId) => {
        /*
        let sku = await this.#SKUDao.getSKUById(skuId);
        if(sku == undefined)
            throw HTTPError.E422("No SKU with that SKUID");
         */

        await this.#SKUDao.deleteSKU(skuId);
    }

    //  SKU ITEM
    /*
        COMPLETED
    */ 
    getSKUItems = async () => {

        let SKUItems = await this.#SKUItemDao.getSKUItems();
        SKUItems = SKUItems.map((skuItem) => {
            return {
                "RFID" : skuItem.RFID,
                "SKUId" : skuItem.SKUId,
                "Available" : skuItem.Available,
                "DateOfStock" : skuItem.DateOfStock
            }
        })
        return SKUItems
    };

    getSKUItemsBySKUId = async (skuId) => {

        let SKUItems =await this.#SKUItemDao.getSKUItemById(skuId);

        if(SKUItems.length === 0)
            throw HTTPError.E404("Non SKUItem with that SKUID");

        SKUItems = SKUItems.map((skuItem) => {
            return {
                "RFID" : skuItem.RFID,
                "SKUId" : skuItem.SKUId,
                "DateOfStock" : skuItem.DateOfStock
            }
        })

        return SKUItems
    }

    getSKUItem = async (RFID) => {

        let skuItem = await this.#SKUItemDao.getSKUItemByRFID(RFID);

        if(skuItem == undefined)
            throw HTTPError.E404("Not Found");

        return {
            "RFID" : skuItem.RFID,
            "SKUId" : skuItem.SKUId,
            "Available" : skuItem.Available,
            "DateOfStock" : skuItem.DateOfStock
        }
    }

    postSKUItem = async (newSkuItem) => {

        let sku = await this.#SKUDao.getSKUById(newSkuItem.SKUId);
        if(sku == undefined)
            throw HTTPError.E404("No SKU with that SKUID");
        /*
        let SKUItem = await this.#SKUItemDao.getSKUItemByRFID(newSkuItem.RFID);
        if(SKUItem != undefined)
            throw HTTPError.E422("RFID already Exists");
         */

        await this.#SKUItemDao.insertNewSKUItem(newSkuItem);

    }
    
    putSKUItem = async (RFID, skuMod) => {
        let oldSKUItem = await this.#SKUItemDao.getSKUItemByRFID(RFID);
        if(oldSKUItem == undefined)
            throw HTTPError.E404("Non SKUItem with that SKUID");

        skuMod.newRFID = skuMod.newRFID == undefined ? RFID : skuMod.newRFID;
        skuMod.newAvailable = skuMod.newAvailable == undefined ? oldSKUItem.Available : skuMod.newAvailable;

        // only if the new RFID is differend than the previous
        if (RFID !== skuMod.newRFID) {
            // check if the new rfid already exists
            let newSkuItem = await this.#SKUItemDao.getSKUItemByRFID(skuMod.newRFID);

            if (newSkuItem != undefined)
                throw HTTPError.E422("RFID already Exists");
        }

        await this.#SKUItemDao.updateSKUItem(skuMod,RFID);
    }

    deleteSKUItem = async (RFID) => {
        /*
        let SKUItem = await this.#SKUItemDao.getSKUItemByRFID(RFID);
        if(SKUItem == undefined)
            throw HTTPError.E422("RFID doesn't exist");
         */

        await this.#SKUItemDao.deleteSKUItem(RFID);

    }

    /* INTERNAL METHODS OF SKU ITEM

      They should have the PACKAGE PROTECTION but this doesn't exist on javascript D:
    */

    getSKUItemsByInternalOrderId = async (internalOrderId) => {

        let SKUItems = await this.#SKUItemDao.getSKUItemByInternalOrderId(internalOrderId);

        SKUItems = await Promise.all(SKUItems.map( async (skuItem) => {
            const sku = await this.getSKUById(skuItem.SKUId);
            skuItem.description = sku.description;
            skuItem.price = sku.price;
            return skuItem;
        }))

        if(SKUItems.length === 0)
            throw HTTPError.E404("Internal Order hasn't SKUItems or internal order is doesn't exist");

        return SKUItems
    }

    getSKUItemsByRestockOrderId = async (restockOrderId) => {

        const SKUItems = await this.#SKUItemDao.getSKUItemByRestockOrderId(restockOrderId);

        if(SKUItems.length === 0)
            throw HTTPError.E404("Internal Order hasn't SKUItems or return order is doesn't exist");

        return SKUItems.map((skuItem) => {
            return {
                "SKUId":skuItem.SKUId,
                "itemId":skuItem.itemId,
                "rfid":skuItem.RFID
            }
        })
    }

    getSKUItemsByReturnOrderId = async (returnOrderId) => {
        const SKUItems = await this.#SKUItemDao.getSKUItemByReturnOrderId(returnOrderId);

        const returnOrders = await Promise.all(SKUItems.map( async (skuItem) => {
            let sku = await this.getSKUById(skuItem.SKUId);
            skuItem.description = sku.description;
            skuItem.price = sku.price;
            return skuItem
        }))

        if(returnOrders.length === 0)
            throw HTTPError.E404("Internal Order hasn't SKUItems or return order is doesn't exist");

        return returnOrders
    }

    // TODO these ones should be inside the dao for skuitem

    setIntOrd = async (RFID, intOrdId) => {
        /*
          This method is thought for working together with
          getInternalOrders Of class OrderController
          So it'll return only thing usefully for that method

          If you want to add some information you can add it.
        */

        let skuItem = await this.#SKUItemDao.getSKUItemByRFID(RFID);
        if (skuItem == undefined)
            return;


        
        await this.#SKUItemDao.insertInternalOrder(RFID, intOrdId);
    }

    setRestockOrd = async (RFID, restockOrdId, itemId) => {

        let skuItem = await this.#SKUItemDao.getSKUItemByRFID(RFID);
        if (skuItem == undefined)
            return;


        await this.#SKUItemDao.insertRestockOrder(RFID, restockOrdId, itemId);
    }

    setReturnOrd = async (RFID, returnOrderId) => {

        let skuItem = await this.#SKUItemDao.getSKUItemByRFID(RFID);
        if (skuItem == undefined)
            return;


        await this.#SKUItemDao.insertReturnOrder(RFID, returnOrderId);
    }
}

module.exports = SKUController;