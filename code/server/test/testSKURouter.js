'use strict';
const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
chai.should();
const skuDao = require('../src/models/SKU');
const positionDao = require('../src/models/Position');

const app = require("../server");
const agent = chai.request.agent(app);

const mockSKU = {
    description: "pasta",
    weight : 0.5,
    volume : 1,
    notes : "barilla",
    price : 0.47,
    availableQuantity : 8
}

describe('Scenario 1-1 Create SKU S', () => {

    beforeEach( async function () {
        await skuDao.deleteTable();
        await skuDao.createTable();
    })

    newSKU("test correct new SKU", 201, "pasta", 2, 1, "barilla", 0.47, 19);
    newSKU("test new SKU no description", 422, undefined , 0.5, 1, "barilla", 0.47, 19);
    newSKU("test new SKU no weight", 422, "pasta", undefined, 1, "barilla", 0.47, 19);
    newSKU("test new SKU no volume", 422, "pasta", 0.5, undefined, "barilla", 0.47, 19);
    newSKU("test new SKU no notes", 422, "pasta", 0.5, 1, undefined, 0.47, 19);
    newSKU("test new SKU no price", 422, "pasta", 0.5, 1, "barilla", undefined, 19);
    newSKU("test new SKU no availableQuantity", 422, "pasta", 0.5, 1, "barilla", 0.47, undefined);

    newSKU("test new SKU negative weight", 422, "pasta", -5, 1, "barilla", 0.47, 19);
    newSKU("test new SKU negative volume", 422, "pasta", 0.5, -1, "barilla", 0.47, 19);
    newSKU("test new SKU negative price", 422, "pasta", 0.5, -1, "barilla", -10, 19);
    newSKU("test new SKU negative quantity", 422, "pasta", 0.5, -1, "barilla", 0.47, -3);

    newSKU("test wrong paramiter weight", 422, "pasta", "ciao", 1, "barilla", 0.47, 19);
    newSKU("test wrong paramiter volume", 422, "pasta", 0.5, "ciao", "barilla", 0.47, 19);
    newSKU("test wrong paramiter price", 422, "pasta", 0.5, 1, "barilla", "ciao", 19);
    newSKU("test wrong paramiter availableQuantity", 422, "pasta", 0.5, 1, "barilla", 0.47, "ciao");

    
});

describe('Scenario 1-3 Modify SKU S', function () {
    beforeEach( async function () {
        await skuDao.deleteTable();
        await skuDao.createTable();
        
        await skuDao.insertNewSKU(mockSKU)
    })

    putSKU('test correct put SKU', 200, 1, "Riso", 1, 2, "basamati", 2, 30);
    putSKU('test change only description', 200, 1, "Riso", undefined, undefined, undefined, undefined, undefined);
    putSKU('test change only weight', 200, 1,  undefined, 1, undefined, undefined, undefined, undefined);
    putSKU('test change only volume', 200, 1,  undefined, undefined, 2, undefined, undefined, undefined);
    putSKU('test change only notes', 200, 1,  undefined, undefined, undefined, "basmati", undefined, undefined);
    putSKU('test change only price', 200, 1,  undefined, undefined, undefined, undefined, 2, undefined);
    putSKU('test change only availableQuantity', 200, 1, undefined, undefined, undefined, undefined, undefined, 30);

    putSKU("test new SKU negative weight", 422, 1, "pasta", -5, 1, "barilla", 0.47, 19);
    putSKU("test new SKU negative volume", 422, 1, "pasta", 0.5, -1, "barilla", 0.47, 19);
    putSKU("test new SKU negative price", 422, 1, "pasta", 0.5, -1, "barilla", -10, 19);
    putSKU("test new SKU negative quantity", 422, 1, "pasta", 0.5, -1, "barilla", 0.47, -3);

    putSKU("test wrong paramiter weight", 422, 1, "pasta", "ciao", 1, "barilla", 0.47, 19);
    putSKU("test wrong paramiter volume", 422, 1, "pasta", 0.5, "ciao", "barilla", 0.47, 19);
    putSKU("test wrong paramiter price", 422, 1, "pasta", 0.5, 1, "barilla", "ciao", 19);
    putSKU("test wrong paramiter availableQuantity", 422, 1, "pasta", 0.5, 1, "barilla", 0.47, "ciao");

    putSKU("test not existing SKU", 404, 2, "Riso", 1, 2, "basamati", 2, 30)
    putSKU("test invalid SKU", 404, -1, "Riso", 1, 2, "basamati", 2, 30)

    it("test change of position", async function () {
        await positionDao.deleteTable();
        await positionDao.createTable();

        await positionDao.insertNewPosition({
            "positionID": "800234543412",
            "aisleID": "8002",
            "row": "3454",
            "col": "3412",
            "maxWeight": 10,
            "maxVolume": 10
        })

        let mod = {
            "newDescription" : "riso",
            "newWeight" : 5,
            "newVolume" : 2,
            "newNotes" : "basmati",
            "newPrice" : 2,
            "newAvailableQuantity" : 2
        }

        let res = await agent.put("/api/sku/1/position")
            .send({
                "position": "800234543412"
            })

        res = await agent.put(`/api/sku/1`)
            .send(mod);
        res.should.have.status(200)

        let position = await positionDao.getPositionById("800234543412")
        position.occupiedWeight.should.equal(mod.newAvailableQuantity*mod.newWeight)
        position.occupiedVolume.should.equal(mod.newAvailableQuantity*mod.newVolume)
    })

    it("test max position capability", async function () {
        await positionDao.deleteTable();
        await positionDao.createTable();

        await positionDao.insertNewPosition({
            "positionID":"800234543412",
            "aisleID": "8002",
            "row": "3454",
            "col": "3412",
            "maxWeight": 10,
            "maxVolume": 10
        })

        let mod = {
            "newDescription" : "riso",
            "newWeight" : 5,
            "newVolume" : 2,
            "newNotes" : "basmati",
            "newPrice" : 2,
            "newAvailableQuantity" : 3
        }

        let res = await agent.put("/api/sku/1/position")
            .send({
                "position": "800234543412"
            })

        res = await agent.put(`/api/sku/1`)
            .send(mod);
        res.should.have.status(422)

        mod.newWeight = 2
        mod.newVolume = 5
        
        res = await agent.put(`/api/sku/1`)
            .send(mod);
        res.should.have.status(422)

        let position = await positionDao.getPositionById("800234543412")
        position.occupiedWeight.should.equal(mockSKU.availableQuantity*mockSKU.weight)
        position.occupiedVolume.should.equal(mockSKU.availableQuantity*mockSKU.volume)
    })

});

describe('Scenario 1-2 Modify SKU location', () => {
    beforeEach( async function () {
        await skuDao.deleteTable();
        await skuDao.createTable();
        
        await skuDao.insertNewSKU(mockSKU);

        await positionDao.deleteTable();
        await positionDao.createTable();

        await positionDao.insertNewPosition({
            "positionID":"800234543412",
            "aisleID": "8002",
            "row": "3454",
            "col": "3412",
            "maxWeight": 10,
            "maxVolume": 10
        })
    })

    putSKUPosition("test correct", 200, 1, "800234543412");
    putSKUPosition("invalid sku id", 404, -1, "800234543412");
    putSKUPosition("test invalid position", 422, 1, "8002345434123");
    putSKUPosition("test not existing position", 404, 1, "800234543413");
    putSKUPosition(" test not existing sku id", 404, 2, "800234543412");

    it("test position no capable to satify volume and weight", async function() {
        await positionDao.deleteTable();
        await positionDao.createTable();

        await positionDao.insertNewPosition({
            "positionID":"800234543412",
            "aisleID": "8002",
            "row": "3454",
            "col": "3412",
            "maxWeight": 5,
            "maxVolume": 5
        })

        let mod = {
            "position" : "800234543412"
        }

        let res = await agent.put(`/api/sku/1/position`)
            .send(mod);
        
        res.should.have.status(422);

    })

    it("test tring to set as position ad position already signed", async function() {

        let mod = {
            "position" : "800234543412"
        }

        let other = {
            "description" : "riso",
            "weight" : 5,
            "volume" : 2,
            "notes" : "basmati",
            "price" : 2,
            "availableQuantity" : 2
        }
        await skuDao.insertNewSKU(other);

        let res = await agent.put(`/api/sku/1/position`)
            .send(mod);
        
        res.should.have.status(200);

        res = await agent.put(`/api/sku/2/position`)
            .send(mod);
        
        res.should.have.status(422);

    })
});

function newSKU(title, expectedHTTPStatus, description, weight, volume, notes, price, availableQuantity){
    it(title, async function () {
        // Creation of request body
        let sku = {
            description: description,
            weight : weight,
            volume : volume,
            notes : notes,
            price : price,
            availableQuantity : availableQuantity
        }
        // send the request
        let res = await agent.post('/api/sku')
            .send(sku)
        res.should.have.status(expectedHTTPStatus)

        sku = await skuDao.getSKUById(1);
        if(sku != undefined ){
            sku.id.should.equal(1)
            sku.description.should.equal(description);
            sku.weight.should.equal(weight);
            sku.volume.should.equal(volume);
            sku.notes.should.equal(notes);
            sku.price.should.equal(price);
            sku.availableQuantity.should.equal(availableQuantity);
        }
    })
}

function putSKU(title, expectedHTTPStatus, id, description, weight, volume, notes, price, availableQuantity){
    it(title, async function () {
        let mod = {
            "newDescription" : description,
            "newWeight" : weight,
            "newVolume" : volume,
            "newNotes" : notes,
            "newPrice" : price,
            "newAvailableQuantity" : availableQuantity
        }
        // send the request
        let oldSKU = await skuDao.getSKUById(id);

        let res = await agent.put(`/api/sku/${id}`)
            .send(mod);
        res.should.have.status(expectedHTTPStatus)

        let sku = await skuDao.getSKUById(id);
        
        if(sku != undefined && sku.position != undefined && res.status == 200){
            let position = await positionDao.getPositionById(sku.position)
            position.occupiedWeight.should.equal(availableQuantity*weight)
            position.occupiedVolume.should.equal(availableQuantity*volume)
        }else if(sku != undefined && sku.position != undefined){
            let position = await positionDao.getPositionById(sku.position)
            position.occupiedWeight.should.equal(oldSKU.availableQuantity*oldSKU.weight)
            position.occupiedVolume.should.equal(oldSKU.availableQuantity*oldSKU.volume)
        }
        if(sku != undefined && res.status == 200){
            sku.id.should.equal(1)
            sku.description.should.equal(description != undefined ? description : oldSKU.description);
            sku.weight.should.equal(weight != undefined ? weight : oldSKU.weight);
            sku.volume.should.equal(volume != undefined ? volume : oldSKU.volume);
            sku.notes.should.equal(notes != undefined ? notes : oldSKU.notes);
            sku.price.should.equal(price != undefined ? price : oldSKU.price);
            sku.availableQuantity.should.equal(availableQuantity != undefined ? availableQuantity : oldSKU.availableQuantity);
        }else if(sku != undefined){
            sku.id.should.equal(1)
            sku.description.should.equal(oldSKU.description);
            sku.weight.should.equal(oldSKU.weight);
            sku.volume.should.equal(oldSKU.volume);
            sku.notes.should.equal(oldSKU.notes);
            sku.price.should.equal(oldSKU.price);
            sku.availableQuantity.should.equal(oldSKU.availableQuantity);
        }
    })
}

function putSKUPosition(title, expectedHTTPStatus, id, position){
    it(title, async function (){
        let mod = {
            "position" : position
        }

        let res = await agent.put(`/api/sku/${id}/position`)
            .send(mod);
        
        res.should.have.status(expectedHTTPStatus);
    })
}