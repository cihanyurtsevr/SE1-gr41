"use strict";

const {StateRestock, StateInternal} = require("../models/StateOrders")
const HTTPError = require("./HTTPError");
const dayjs = require("dayjs");

class OrderController {
    #wh;
    #restockOrdDao
    #internalOrdDao
    #returnOrdDao
    constructor(wh, restockOrderDao, returnOrderDao, internalOrderDao) {
        this.#wh = wh;
        this.#restockOrdDao = restockOrderDao;
        this.#internalOrdDao = internalOrderDao;
        this.#returnOrdDao = returnOrderDao;
    }

    async createTables() {
        // Create the table of TransportNote in the DB if it not exists (just first time)
        await this.#restockOrdDao.createTableTransportNote();

        // Create the table of RestockOrder in the DB if it not exists (just first time)
        await this.#restockOrdDao.createTableRestockOrder();

        // Create the table of JoinRstkOrdSKU in the DB if it not exists (just first time)
        await this.#restockOrdDao.createTableJoinRstkOrdSKU();

        // Create the table of ReturnOrder in the DB if it not exists (just first time)
        await this.#returnOrdDao.createTable();

        // Create the table of InternalOrder in the DB if it not exists (just first time)
        await this.#internalOrdDao.createTable();

        // Create the table of JoinIntOrdSKU in the DB if it not exists (just first time)
        await this.#internalOrdDao.createTableJoinIntOrdSKU();
    }

    // RESTOCK ORDER
    /*
        COMPLETED
     */
    getTransportNote = async (id) => {
        const transpNote = await this.#restockOrdDao.getTransportNoteById(id);

        if(transpNote == undefined)
            throw HTTPError.E404("Not Found");

        return {
            "deliveryDate": transpNote.deliveryDate
        };
    }

    postTransportNote = async (transportNote) => {
        return await this.#restockOrdDao.insertTransportNote(transportNote);
    }

    #mapAndFillRestOrder = async (restockOrders, state) => {
        return await Promise.all(restockOrders
            .filter( (restockOrder) => {
                // take only orders with the state passed by param
                if(state != undefined)
                    return restockOrder.state === state;
                return true
            })
            .map( async (restOrd) => {
            // if state != ISSUED => show the  transport note
            if( restOrd.state !== StateRestock.ISSUED ){
                try{
                    restOrd.transportNote = await this.getTransportNote(restOrd.transportNote);
                }catch (e){
                    restOrd.transportNote = {}
                }
            }

            // products: use the Join table
            restOrd.products = await this.#restockOrdDao.getJoinByRstkOrdId(restOrd.id);
            restOrd.products = restOrd.products.map((prod) => {
                return {
                    "SKUId":prod.SKUId,
                    "itemId":prod.itemId,
                    "description":prod.description,
                    "price":prod.price,
                    "qty":prod.qty
                }
            })

            // skuItems: directly from skuItem
            if(restOrd.state !== StateRestock.ISSUED && restOrd.state !== StateRestock.DELIVERY){
                try{
                    restOrd.skuItems = await this.#wh.SKUCtrl.getSKUItemsByRestockOrderId(restOrd.id)
                }catch (e) {
                    restOrd.skuItems = [];
                }
            }else{
                restOrd.skuItems = [];
            }


            return restOrd;
        }))
    }

    getRestockOrders = async (state = undefined) => {
        let restockOrders = await this.#restockOrdDao.getRestockOrders();

        return await this.#mapAndFillRestOrder(restockOrders, state);
    }

    getRestockOrder = async (id) => {
        const restockOrder = await this.#restockOrdDao.getRestockOrderById(id);

        if(restockOrder == undefined)
            throw HTTPError.E404("No Restock Order with that RestockOrderID")

        return (await this.#mapAndFillRestOrder([restockOrder]))[0];
    }

    getRestockOrderReturnItems = async (id) =>{
        let restockOrder = await this.getRestockOrder(id);

        if( restockOrder.state !== StateRestock.COMPLETEDRETURN )
            throw HTTPError.E422("the order isn't in COMPLETEDRETURN state")

        let returnItems = [];
        for( const skuItem of restockOrder.skuItems ){
            let skuItemResults = await this.#wh.TestCtrl.getTestResults(skuItem.RFID);

            if ( skuItemResults.some( (testResult) => {
                return testResult.Result == false;
            }) ){
                returnItems = [...returnItems, {
                    "SKUId": skuItem.SKUId,
                    "itemId": skuItem.itemId,
                    "rfid" : skuItem.RFID
                }];
            }
        }
        return returnItems;

    }

    postRestockOrder = async (newRestOrd) => {

        // check if the supplier exists
        let supplier
        try{
            supplier = await this.#wh.UserCtrl.getUser(newRestOrd.supplierId)
        }catch (e) {
            throw HTTPError.E422("supplierId isn't associated to any user")
        }
        // check if the user is a supplier
        if (supplier.type !== "supplier")
            throw HTTPError.E422("The user is not a supplier")
        
        let items = await this.#wh.ItemCtrl.getItemsBySupplId(supplier.id)
        
        // check that all the products inside the order exist
        for( const product of newRestOrd.products){
            // check if the supplier sells that skuItem
            if( !items.some((i) => i.SKUId == product.SKUId && i.id == product.itemId ) )
                throw HTTPError.E422("the supplier doesn't sell some items in the order")
        }
        

        await this.#restockOrdDao.insertNewRestockOrder(newRestOrd);
    }

    putRestockOrderState = async (id, newState) => {

        // validation of the state
        let isStateCorrect = false;
        for( const state in StateRestock){
            if(StateRestock[state] === newState)
                isStateCorrect = true;
        }
        if(!isStateCorrect)
            throw HTTPError.E422("Invalid state");

        // check if the order exists
        let restockOrder = await this.getRestockOrder(id);

        if(newState === restockOrder.state) return ;
        /*
        if( newState === StateRestock.COMPLETED || newState === StateRestock.COMPLETEDRETURN){
            let passedSKUQty = {}
            for(const skuItem of restockOrder.skuItems){
                // TODO Ask to the professors

                if(passedSKUQty[skuItem.SKUId] == undefined) passedSKUQty[skuItem.SKUId]=1
                else passedSKUQty[skuItem.SKUId]++;
                await this.#wh.SKUCtrl.putSKUItem(skuItem.RFID, { "newAvailable" : 1, "newDateOfStock" : skuItem.DateOfStock })

                //
                // let skuItemResults = await this.#wh.TestCtrl.getTestResults(skuItem.RFID);

                // if ( !skuItemResults.some( (testResult) => {
                //     return testResult.Result == false;
                // }) ){
                //     if(passedSKUQty[skuItem.SKUId] == undefined) passedSKUQty[skuItem.SKUId]=1
                //     else passedSKUQty[skuItem.SKUId]++;
                //     await this.#wh.SKUCtrl.putSKUItem(skuItem.RFID, { "newAvailable" : 1, "newDateOfStock" : skuItem.DateOfStock })
                // }
                // 
            }

            for(const sku in passedSKUQty){
                let skuComplete = await this.#wh.SKUCtrl.getSKUById(sku);
                const newAvailability = skuComplete.availableQuantity + passedSKUQty[sku];
                await this.#wh.SKUCtrl.putSKU(sku, { "newAvailableQuantity" : newAvailability} )
            }
        }
        */

        await this.#restockOrdDao.updateRestockOrderStatus(id, newState)
    }

    putRestockOrderSKUItems = async (id, skuItems) => {
        // check if the restock order exits
        let restockOrd;
        try {
            restockOrd = await this.getRestockOrder(id)
        }catch (e){
            throw HTTPError.E404("the order doesn't exist")
        }

        if(restockOrd.state !== StateRestock.DELIVERED)
            throw HTTPError.E422("the order isn't DELIVERED")

        //let dic = {}
        let item = {}
        // check if the skuids exist
        for( const skuItem of skuItems){
            try{
                await this.#wh.SKUCtrl.getSKUById(skuItem.SKUId);
            }catch (e) {
                throw HTTPError.E422("no SKUId associated");
            }

            /*
            if(dic[sku.id] == undefined) dic[sku.id] = 1;
            else dic[sku.id]++;
            */
            // check that the rfid is unique
            let skuItemObj;
            try{
                skuItemObj = await this.#wh.SKUCtrl.getSKUItemsBySKUId(skuItem.rfid);
            }catch (e) {}
            if(skuItemObj != undefined)
                throw HTTPError.E422("rfid already exists");

            // check unicity in the array passed by params
            if(item[skuItem.rfid] != undefined)
                throw HTTPError.E422("rfid not unique")

            item[skuItem.rfid] = 1;

        }
        /*
        for(const product of restockOrd.products)
            if(product.qty != dic[product.SKUId])
                throw HTTPError.E422("number of skuitem and product are not coherent")
        */

        // finally update
        for (const skuItem of skuItems){
            await this.#wh.SKUCtrl.setRestockOrd(skuItem.rfid, id, skuItem.itemId)
        }
    }

    putRestockOrderTranspNote = async (id, transpNote) => {
        // check if the restock order exits
        let restockOrd = await this.getRestockOrder(id)
        if(restockOrd.state !== StateRestock.DELIVERY)
            throw HTTPError.E422("the order isn't DELIVERY")

        let dateD = dayjs(transpNote.deliveryDate);
        let dateI = dayjs(restockOrd.issueDate);

        if(dateD.isBefore(dateI))
            throw HTTPError.E422("delivery date is before the issue date")

        let transpNoteId = await this.postTransportNote(transpNote)

        await this.#restockOrdDao.updateRestockOrderTranspNote(id, transpNoteId);
    }

    deleteRestockOrder = async (id) => {

        // check if the restock order exits
        /*
        const restockOrder = await this.#restockOrdDao.getRestockOrderById(id);

        if(restockOrder == undefined)
            throw HTTPError.E422("No Restock Order with that RestockOrderID")
         */

        // ROOLBACK
        /*
        let restockOrder = await this.getRestockOrder(id);

        if( restockOrder.state === StateRestock.COMPLETED || restockOrder.state === StateRestock.COMPLETEDRETURN){
            let passedSKUQty = {}
            for(const skuItem of restockOrder.skuItems){
                let skuItemResults = await this.#wh.TestCtrl.getTestResults(skuItem.RFID);

                if ( !skuItemResults.some( (testResult) => {
                    return testResult.Result == false;
                }) ){
                    if(passedSKUQty[skuItem.SKUId] == undefined) passedSKUQty[skuItem.SKUId]=1
                    else passedSKUQty[skuItem.SKUId]++;
                    await this.#wh.SKUCtrl.putSKUItem(skuItem.RFID, { "newAvailable" : 0, "newDateOfStock" : skuItem.DateOfStock })
                }
            }

            for(const sku in passedSKUQty){
                let skuComplete = await this.#wh.SKUCtrl.getSKUById(sku);
                const newAvailability = skuComplete.availableQuantity - passedSKUQty[sku];
                await this.#wh.SKUCtrl.putSKU(sku, { "newAvailableQuantity" : newAvailability} )
            }
        }
        */

        await this.#restockOrdDao.deleteRestockOrder(id);
    }

    // RETURN ORDER
    /*
        TODO When the availabilty and quantity have to decrease or increase? restock or return order?
    */
    #mapAndFillReturnOrder = async (returnOrders) => {
        return await Promise.all(returnOrders
            .map( async (returnOrder) => {
                try{
                    returnOrder.products = await this.#wh.SKUCtrl.getSKUItemsByReturnOrderId(returnOrder.id);
                }catch (e){
                    returnOrder.products = [];
                }
                returnOrder.products = returnOrder.products.map((product) => {
                    return {
                        "SKUId": product.SKUId,
                        "itemId": product.itemId,
                        "description": product.description,
                        "price": product.price,
                        "RFID": product.RFID
                    }
                })
                return returnOrder;
        }))
    }

    getReturnOrders = async () => {
        let returnOrders = await this.#returnOrdDao.getReturnOrders();

        return await this.#mapAndFillReturnOrder(returnOrders);
    }

    getReturnOrder = async (id) => {
        let returnOrder = await this.#returnOrdDao.getReturnOrderById(id);

        if(returnOrder == undefined)
            throw HTTPError.E404("Not Found return order");

        return (await this.#mapAndFillReturnOrder([returnOrder]))[0];
    }

    postReturnOrder = async (newReturnOrder) => {
        /*let restockOrder = */await this.getRestockOrder(newReturnOrder.restockOrderId);
        /*
        if(restockOrder.state !== StateRestock.COMPLETEDRETURN)
            throw HTTPError.E422("The restock order isn't in COMPLETE RETURN status");
        */

        let id = await this.#returnOrdDao.insertReturnOrder(newReturnOrder);

        // let passedSKUQty = {}
        for(const product of newReturnOrder.products){
            await this.#wh.SKUCtrl.setReturnOrd(product.RFID, id);
            /*
            let skuItem = await this.#wh.SKUCtrl.getSKUItem(product.RFID);
            await this.#wh.SKUCtrl.putSKUItem(skuItem.RFID, { "newAvailable" : 0, "newDateOfStock" : skuItem.DateOfStock })

            if(passedSKUQty[skuItem.SKUId] == undefined) passedSKUQty[skuItem.SKUId]=1
            else passedSKUQty[skuItem.SKUId]++;
             */
        }
        /*
        for(const sku in passedSKUQty){
            let skuComplete = await this.#wh.SKUCtrl.getSKUById(sku);
            const newAvailability = skuComplete.availableQuantity - passedSKUQty[sku];
            await this.#wh.SKUCtrl.putSKU(sku, { "newAvailableQuantity" : newAvailability} )
        }*/
    }

    deleteReturnOrder = async (id) => {
        /*
        let returnOrder = await this.#returnOrdDao.getReturnOrderById(id);

        if(returnOrder == undefined)
            throw HTTPError.E422("Not Found return order");
         */

        await this.#returnOrdDao.deleteReturnOrder(id);
    }

    // INTERNAL ORDER
    /*
        COMPLETED
    */
    #mapAndFillIntOrder = async (internalOrders, state) => {
        return await Promise.all(internalOrders
            .filter((internalOrder) => {
                if(state != undefined)
                    return internalOrder.state === state;
                return true;
            })
            .map( async (internalOrder) => {
                // Assign the correct array of products
                if(internalOrder.state === StateInternal.COMPLETED){
                    // SKUItem List: take them directly from the SKUItem Controller
                    try{
                        internalOrder.products = await this.#wh.SKUCtrl.getSKUItemsByInternalOrderId(internalOrder.id);
                    }catch (e){
                        internalOrder.products = [];
                    }

                }else{
                    // SKU List: use the Join table
                    const products = await this.#internalOrdDao.getJoinByInterOrdId(internalOrder.id)

                    internalOrder.products = await Promise.all(products.map( async (product) => {
                        /*  Should return something like this =>
                        {"SKUId":12,"description":"a product","price":10.99,"qty":2}
                        */
                        return {
                            SKUId : product.SKUId,
                            description : product.description,
                            price : product.price,
                            qty : product.qty
                        }
                    }))
                }
                return internalOrder;
        }))
    }

    getInternalOrders = async (state = undefined) => {
        let  internalOrders = await this.#internalOrdDao.getInternalOrders();

        return await this.#mapAndFillIntOrder(internalOrders, state);
    }

    getInternalOrder = async (id) => {

        const internalOrder = await this.#internalOrdDao.getInternalOrderById(id);

        if(internalOrder == undefined)
            throw HTTPError.E404("No Internal Order with that IntOrdID")

        // retrieve the products from the SKUCtrl
        return (await this.#mapAndFillIntOrder([internalOrder]))[0];
    }

    #rollback = async (intOrd) => {
        let products = intOrd.products
        let dictionary = {}

        // if the state is completed set the skuItem available
        if(intOrd.state === StateInternal.COMPLETED){
            for( const skuProd of intOrd.products){
                if(dictionary[skuProd.SKUId] == undefined){
                    dictionary[skuProd.SKUId] = 1
                }else{
                    dictionary[skuProd.SKUId]++;
                }
                let skuItem = await this.#wh.SKUCtrl.getSKUItem(skuProd.RFID)
                await this.#wh.SKUCtrl.putSKUItem(skuProd.RFID, { "newAvailable" : 1, "DateOfStock" : skuItem.DateOfStock})
            }

            products = []
            for(const skuId in dictionary){
                products.push({ "SKUId" : skuId, "qty" : dictionary[skuId] })
            }
        }

        // set the sku available quantity as before the order
        for( const skuProd of products ){
            let skuComplete = await this.#wh.SKUCtrl.getSKUById(skuProd.SKUId)

            let newAvailability = skuComplete.availableQuantity + skuProd.qty

            await this.#wh.SKUCtrl.putSKU(skuProd.SKUId,{ "newAvailableQuantity" : newAvailability} )
        }
    }

    #updateSKUs = async (intOrd) => {
        let SKUs = []
        // get the skus
        for (const product of intOrd.products){
            const sku = await this.#wh.SKUCtrl.getSKUById(product.SKUId)
            SKUs.push({...sku, "qty" : product.qty});
        }

        // if they are available decrease it and increase the availability in the position
        for( const sku of SKUs){
            const newAvailability = sku.availableQuantity - sku.qty

            await this.#wh.SKUCtrl.putSKU(sku.id, { "newAvailableQuantity" : newAvailability} )
        }
    }

    postInternalOrder = async (newIntOrd) => {
        // update sku availability
        // await this.#updateSKUs(newIntOrd);

        await this.#internalOrdDao.insertInternalOrder(newIntOrd);
    }

    putInternalOrder = async (id, body) => {
        await this.getInternalOrder(id);

        // validation of the state
        let isStateCorrect = false;
        for( const state in StateInternal){
            if(StateInternal[state] === body.newState)
                isStateCorrect = true;
        }
        if(!isStateCorrect)
            throw HTTPError.E422("Invalid state");

        if ( body.newState === StateInternal.CANCELLED || body.newState === StateInternal.REFUSED){
            // await this.#rollback(intOrd)
        }else if( body.newState === StateInternal.COMPLETED ) {
            // check if the item is available
            /*
            for(const product of body.products) {
                let skuItem = this.#wh.SKUCtrl.getSKUItem(product.RFID);
                if (skuItem.Available == 0)
                    throw HTTPError.E422("some skuItem is not available")
            }
            */

            // set the internal order to those skuItem
            for(const product of body.products) {
                await this.#wh.SKUCtrl.setIntOrd(product.RFID, id)
                // await this.#wh.SKUCtrl.putSKUItem(product.RFID, {"newAvailable" : 0})
            }
        }else if( body.newState === StateInternal.ISSUED || body.newState === StateInternal.ACCEPTED ){
            // await this.#updateSKUs(intOrd);
        }

        await this.#internalOrdDao.updateInternalOrder(id, body.newState);

    }

    deleteInternalOrder = async (id) => {
        /*
        const internalOrder = await this.#internalOrdDao.getInternalOrderById(id);

        if(internalOrder == undefined)
            throw HTTPError.E422("No Internal Order with that IntOrdID")
        // await this.#rollback(intOrd);
         */

        await this.#internalOrdDao.deleteInternalOrder(id);
    }

}

module.exports = OrderController;