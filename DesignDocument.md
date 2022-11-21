# Design Document 


Authors: Michele Cerra, Cihan Yurtsever, Francesco Dell'Agata, Matteo Panigati

Date: 23.04.2022

Version: 0.1.0


# Contents

- [Design Document](#design-document)
- [Contents](#contents)
- [Instructions](#instructions)
- [High level design](#high-level-design)
- [Low level design](#low-level-design)
- [Verification traceability matrix](#verification-traceability-matrix)
- [Verification sequence diagrams](#verification-sequence-diagrams)
- [Sequence Diagram 1-2 : Modify SKU location](#sequence-diagram-1-2--modify-sku-location)
- [Sequence Diagram 2-1 : Create position](#sequence-diagram-2-1--create-position)
- [Sequence Diagram 3-2 : Restock Order of SKU S issued by supplier](#sequence-diagram-3-2--restock-order-of-sku-s-issued-by-supplier)
- [Sequence Diagram 5-1-1 : Record restock order arrival](#sequence-diagram-5-1-1--record-restock-order-arrival)
- [Sequence Diagram 5-2-3 : Record negative and positive test results of all SKU items of a RestockOrder](#sequence-diagram-5-2-3--record-negative-and-positive-test-results-of-all-sku-items-of-a-restockorder)
- [Sequence Diagram 5-3-3 : Stock some SKU items of a RO](#sequence-diagram-5-3-3--stock-some-sku-items-of-a-ro)
- [Sequence Diagram 6-2 : Return order of any SKU items](#sequence-diagram-6-2--return-order-of-any-sku-items)
- [Sequence Diagram 9-1 : Internal Order IO accepted](#sequence-diagram-9-1--internal-order-io-accepted)
- [Sequence Diagram 10-1 : Internal Order IO Completed](#sequence-diagram-10-1--internal-order-io-completed)
- [Sequence Diagram 11-1 : Create Item I](#sequence-diagram-11-1--create-item-i)
- [Sequence Diagram 12-1 : Create test description](#sequence-diagram-12-1--create-test-description)

# Instructions

The design must satisfy the Official Requirements document, notably functional and non functional requirements, and be consistent with the APIs

# High level design 

The architectural pattern used is the client-server model. So client can access to the server only through  browser, using a device.

The server is composed by: 

- the frontend, which is developed with web technologies (JavaScript, HTML, Css) and is in charge of collecting user inputs to send requests to the backend

- the backend

Together, they implement a layered style: Presentation layer (front end), Application logic and data layer (back end).
Together, they implement also an MVC pattern, with the V on the front end and the MC on the back end. Because the application must present cosistend data, and the data may change at runtime.

![Package Diagram](./design/PackageDiagram.jpg)


# Low level design
Design pattern used:
  1) Warehouse : Singleton, Façade
  2) DatabaseHelper : Singleton


```plantuml
@startuml classDiagram

class EZWHServer {
    + main()
}


class Express {
}

class callCtrlCheckErr{
}


package "Controllers" #DDDDDD{

class HTTPError{
}
class Warehouse {
    - {static} whSingle : Warehouse
    + SKUCtrl : SKUController
    + UserCtrl : UserController
    + ItemCtrl : ItemController
    + TestCtrl : TestController
    + OrderCtrl : OrderController
    __
    + constructor()
    + {static} getInstance() : Warehouse
    + createTables()
    + hasPermissions(...args)
}

class SKUController {
    - wh : Warehouse
    - SKUDao : SKU
    - SKUItemDao : SKUItem
    __
    + constructor(wh, SKUDao, SKUITemDao)
    + createTables()
    ..
    + getSKUs() 
    + getSKUById(skuid) 
    + postSKU(newSKU)
    + putSKU(oldSkuId, skuMod)
    + putSKUPosition(skuId, positionId)
    + deleteSKU(skuId)
    ..
    + getSKUItems()
    + getSKUItemsBySKUId(skuId) 
    + getSKUItem(RFID)
    + postSKUItem(newSkuItem) 
    + putSKUItem(RFID, skuMod)
    + deleteSKUItem(RFID)
    ..
    + getSKUItemsByInternalOrderId(internalOrderId)
    + getSKUItemsByRestockOrderId(restockOrderId)
    + getSKUItemsByReturnOrderId(returnOrderId)
    + setIntOrd(RFID, intOrdId)
    + setRestockOrd(RFID, restockOrdId, itemId)
    + setReturnOrd(RFID, returnOrderId)
}

class TestController {
    - wh : Warehouse
    - TestDescriptorDao : TestDescriptor
    - TestResultDao : TestResult
    __
    + constructor(wh, TestDescriptorDao, TestResultDao)
    + createTables()
    ..
    + getTestResults(rfid)
    + getTestResultById(rfid, id)
    + postTestResult(newTestResult)
    + putTestResult(rfid, id, testMod) 
    + deleteTestResult(rfid, id)
    ..
    + getTestDescriptors()
    + getTestDescriptor(id)
    + getTestDescriptorBySKUId(idSKU)
    + postTestDescriptor(newTestDescriptor)
    + putTestDescriptor(id, testMod)
    + deleteTestDescriptor(id)
}

class UserController {
    - wh : Warehouse
    - isLogged : Boolean
    - currUser : User
    - userDao : User
    __
    + constructor()
    + createTables()
    .. 
    + getSuppliers()
    + getUsers()
    + getUser()
    - getUserByEmailType(email, type)
    - checkType(type : String)
    + postNewUser(newUser)
    + putUser(email, userMod)
    + deleteUser(email, type)
    ..
    + getUserInfo()
    + session(email, password, type)
    + logout()
}

class ItemController {
    - wh : Warehouse
    - ItemDao : Item
    - PositionDao : Position
    __
    + constructor(wh,ItemDao,PositionDao)
    + createTables()
    ..
    + getItems()
    + getItem(id)
    + getItemsBySupplId(supplierId)
    + getItemBySKUIdAndSupplId(skuId, supplierId)
    + postItem(newid)
    + putItem(id, itemMod)
    + deleteItem(id)
    ..
    + getPositions()
    + getPosition(positionID)
    + postPosition(newPosition)
    + putPosition(positionID, posMod)
    + putPositionChangeID(positionID, posMod)
    + deletePosition(positionID)
}

class OrderController {
    - wh : Warehouse
    - restockOrdDato : RestockOrder
    - internalOrdDao : InternalOrder
    - returnOrdDao : ReturnOrder
    __
    + constructor(wh, restockOrderDao, returnOrderDao, internalOrderDao)
    + createTable()
    ..
    + getTransportNote(id)
    + postTransportNote(transportNote)
    ..
    - mapAndFillRestOrder(restockOrders, state)
    + getRestockOrders(state = undefined)
    + getRestockOrder(id)
    + getRestockOrderReturnItems(id)
    + postRestockOrder(newRestOrd)
    + putRestockOrderState(id, newState)
    + putRestockOrderSKUItems(id, skuItems)
    + putRestockOrderTranspNote(id, transpNote)
    + deleteRestockOrder(id)
    ..
    - mapAndFillReturnOrder(returnOrders)
    + getReturnOrders()
    + getReturnOrder(id)
    + postReturnOrder(newReturnOrder)
    + deleteReturnOrder(id)
    ..  
    - mapAndFillIntOrder(internalOrders, state)
    + getInternalOrders(state = undefined)
    + getInternalOrder(id)
    + postInternalOrder(newIntOrd)
    + putInternalOrder(id, body)
    + deleteInternalOrder(id)
}

}
package "Database" <<Database>> {
class DatabaseHelper {
    + db
    ..
    + constructor(pathSQLite)
    __
    + queryDBAll(sql, data=[])
    + queryDBRun(sql, data=[])
}
class Sqlite {
    + run() : void
    + all() : void
}
}
package "DAO" {
    
    class SKU {
        - Id : Integer
        - description : String
        - weight : Double
        - volume : Double
        - notes : String
        - position : String
        - availableQuantity : Integer
        - price : Double
        __
        + createTable() : void
        + deleteTable() : void
        + buildSKU(rows) : SKU
        + getSKUs() : Array<Sku>
        + getSKUById(id) : SKU
        + insertNewSKU(newSKU) : void
        + updateSKU(SKU) : void
        + updateSKUPosition(SKUid, positionId) : void 
        + deleteSKU(SKUid) : void
    }

    class SKUItem {
        - RFID : String
        - SKUId : Integer
        - itemId : Integer
        - available : Boolean
        - dateOfStock : String
        - restockOrderId : Integer
        - returnOrderId : Integer
        - internalOrderId : Integer
        __
        + buildSkuItem(rows) : SKUItem
        + createTable() : void
        + deleteTable() : void
        + getSKuItems() : Array<SKUItem>
        + getSKUItemById(SKUid) : SKUItem
        + getSKUItemByRFID(RFID) : SKUItem
        + getSKUItemByInternalOrderID(internalOrderId) : SKUItem
        + getSKUItemByRestockOrderID(RestockOrderId) : SKUItem
        + getSKUItemByReturnOrderID(ReturnOrderId) : SKUItem 
        + insertNewSkuItem(SKUItem) : void
        + insertInternalOrderID(RFID, internalOrderId) : SKUItem
        + insertRestockOrderID(RFID, RestockOrderId, itemId) : SKUItem
        + insertReturnOrderID(RFID, ReturnOrderId) : SKUItem
        + updateSKUItem(SKUmod, RFID) : void
        + deleteSKUItem(RFID) : void
        + deleteSKUItemData() : void
    }


    class Item {
        - Id : Intenger
        - description : String
        - price : Double
        - SKUId : Integer
        - supplierId : Integer
        __
        + buildItem(rows) : Item
        + deleteTable() : void
        + createTable() : void
        + getItems() : Array<Item>
        + getItem(id) : Item
        + getItemBYSUpplId(supplierId) : Item
        + getItemBySKUIdAndSupplId(skuid, supplierId) : Item
        + insertNewItem(newid) : void
        + updateItem(itemMod, id) : void
        + deleteItem(id) : void
        + deleteItemData() : void
    }

    class Position {
        - positionID : String
        - aisleID : String
        - row : String
        - col : String
        - maxWeight : Double
        - maxVolume : Double
        - occupiedWeight : Double
        - occupiedVolume : Double
        __
        + buildPosition(rows) : Position
        + createTable() : void
        + deleteTable(): void
        + getPositions() : Array<Positions>
        + getPositionById(positionID) : Position
        + insertNewPosition(newPosition) : void
        + updatePosition(posMod, positionId) : void
        + updatePositionById(posMod, positionID) : void
        + deletePosition(positionID) : void
        + deletePositionData() : void
    }
    class User {
        - userId : Integer
        - name : String
        - surname : String
        - email : String
        - password : String
        - type : String
        __
        + buildUser(rows) : User
        + createTable() : void
        + deleteTable() : void
        + getSUppliers() : Array<User>
        + getUsers() : Array<User>
        + getUSerById(id) : User
        + getUserByEmailType(email, type) : User
        + insertNewUser(newUser) : void
        + insertOrIgnoreNewUser(name, surname, email, password, type) : void
        + updateUser(email, userMod) : void
        + deleteUser(email, type) : void
        + logIn(email, password, type) : User
    }
    enum StateRestock {
        ISSUED
        DELIVERY
        DELIVERED
        TESTED
        COMPLETEDRETURN
        COMPLETED
    }


    class RestockOrder{
        - Id : Integer
        - issueDate : String
        - state : StateRestock
        - supplierId : Integer
        - transportNote : Integer
        - products : Array
        - skuItems : Array
        __
        + buildRestockOrder(rows) : RestockOrder
        + createTableRestockOrder() : void
        + deleteTableRestockOrder() : void
        + getRestockOrder() : Array<RestockOrder>
        + getRestockOrderById(id) : RestockOrder
        + insertNewRestockOrder(newRestOrder) : void
        + updateRestockOrderStatus(id, state) : void
        + updateRestockOrderTransportNote(id, transportNote) : void
        + deleteRestockOrder(id) : void
    }
    class JoinRstkOrdSKU{
        - restockOrderId : Integer
        - SKUId : Integer
        - itemId : Integer
        - description : String
        - price : Double
        - qty : Integer
        __
        + buildJoin(rows) : JoinRstkOrdSKU
        + createTableJoinRstkOrdSKU() : void
        + deleteTableJoinRstkOrdSKU() : void
        + getJoinByRstkOrdId(restockOrderId) : JoinRstkOrdSKU
        + insertJoin(restockOrdId, SKUId, itemId, description, price, qty) : void
        + deleteJoin(restockOrderId) : void
        + deleteJoinTable() : void
        + deleteRestockOrderData() : void
    }

    class TransportNote{
        - id
        - deliveryState
        __
        + buildTransportNote(rows) : TransportNote
        + createTableTransportNote() : void
        + deleteTableTransportNote() : void
        + getTransportNoteById(id) : TransportNote
        + insertTransportNote(transportNote) : void
    }
    
    class ReturnOrder{
        - id : Integer
        - returnDate : String
        - restockOrderId : Integer
        __
        + buildReturnOrder(rows) : ReturnOrder
        + createTable() : void
        + deleteTable() : void
        + getReturnOrders() : Array<ReturnOrder>
        + getReturnOrderById(id) : ReturnOrder
        + insertReturnOrder(newReturnOrder) : void
        + deleteReturnOrder(id) : void
    }
    enum StateInternal {
        ISSUED
        ACCEPTED
        REFUSED
        CANCELED
        COMPLETED
    }
    class InternalOrder{
        - id : Integer
        - issueDate : String
        - state : StateInternal
        - customerId : Integer
        __
        + buildInternalOrder(rows) : InternalOrder
        + createTable() : void
        + deleteTable() : void
        + getInternalOrders() : Array<InternalOrder>
        + getInternalOrderById(id) : InternalOrder
        + insertInternalOrder(newIntOrd) : void
        + updateInternalOrder(id, state) : void
        + deleteInternalOrder(id) : void 
    }

    class JoinIntOrdSKU{
        - internalOrderId : Integer
        - SKUId : Integer
        - description : String
        - price : Double
        - qty : Integer
        __
        + buildJoin(rows) : JoinIntOrdKU
        + createTableJoinINtOrdSKU() : void
        + deleteTableJoinINtOrdSKU() : void
        + getJoinByInterOrdeId(internalOrderId) : JoinIntOrdSKU
        + insertJoin(internalOrderId, SKUId, description, price, qty) : void
        + deleteJoin(internalOrderId) : void
        + deleteJoinTable() : void
    }
    class TestDescriptor{
        - id : Integer
        - name : String
        - procedureDescription : String
        - idSKU : Integer
        __
        + createTable()
        + deleteTable()
        - buildTestDescriptor(rows)
        ..
        + getTestDescriptors()
        + getTestDescriptorById(id)
        + getTestDescriptorBySKUId(SKUId)
        + insertTestDescriptor(newTestDescriptor)
        + updateTestDescriptor(testMod)
        + deleteTestDescriptor(id)
        + deleteTestDescriptorData()
    }
    class TestResult{
        - id : Integer
        - idTestDescriptor : Integer
        - rfid : String
        - Date : String
        - Result : Boolean
        __
        + createTable()
        + deleteTable()
        - buildTestResult()
        __
        ~ getTestResults(rfid)
        ~ getTestResultById(rfid,id)
        ~ insertTestResult(newTestResult)
        ~ updateTestResult(rfid, id, testMod)
        ~ deleteTestResult(rfid, id)
        ~ deleteTestResultData()
    }
}




'left to right direction
'top to bottom direction


'Controllers -down- DAO
'DAO -down- DatabaseHelper

Warehouse o-down- SKUController
Warehouse o-down- TestController
Warehouse o-down- UserController
Warehouse o-down- ItemController
Warehouse o-down- OrderController

SKUController -down- SKU
SKUController -down- SKUItem
ItemController -down- Item
ItemController -down- Position
UserController -down- User
TestController -down- TestResult
TestController -down- TestDescriptor
OrderController -down- RestockOrder
OrderController -down- ReturnOrder
OrderController -down- InternalOrder
RestockOrder -down- JoinRstkOrdSKU
InternalOrder -down- JoinIntOrdSKU
RestockOrder -down- TransportNote
RestockOrder -down- StateRestock
InternalOrder -down- StateInternal

DAO -- Database


Express -down- EZWHServer

EZWHServer -down- callCtrlCheckErr
callCtrlCheckErr -down- Warehouse
DatabaseHelper *-down- Sqlite

@enduml
```

# Verification traceability matrix


| ID       |  Warehouse | SKU  |SKU Item | User | Database| Item | Position| Test Descriptor| Test Result | Return Order | Restock Order | Internal Order | Transport Note|
| ------------- |-------------|-------------|-------------|-------------|-------------|-------------|-------------|-------------|-------------|-------------| -------------|-------------|-------------|
| FR1       | X |  |  | X | X |  |  |  |  |  |   |   |  |
| FR2       | X | X | X |  | X |  |  |  |  |  |   |   |  |
| FR3       |  X |  |  |  | X | X | X | X | X |  |   |   |  |
| FR4       | X |  |  | X | X |  |  |  |  |  |   |  X |  |
| FR5       | X | X | X | X | X | X |  |  | X | X |  X |   | X |
| FR6       |  X | X | X | X | X |  |  |  |  | X |  X |  X | X |
| FR7       |  X |  |  |  | X | X | X |  |  |  |   |   | X |


# Verification sequence diagrams 
# Sequence Diagram 1-2 : Modify SKU location
```plantuml
@startuml
collections Frontend    as Frontend
participant EZWH        as EZWH
participant Resolver    as Resolver
participant HTTPrequest as HTTPrequest
participant Warehouse   as Warehouse
participant SKU as SKU
participant DatabaseHelper as DatabaseHelper


note over Frontend
The Frontend include GUI e DataInterface
end note
note over Frontend
The first HTTP request
covers the first four points
of the scenario
end note
Frontend -> EZWH  : send HTTP request
activate EZWH 
EZWH -> Resolver : resolve(request : HTTPrequest)
activate Resolver
Resolver -> HTTPrequest : getBody()
activate HTTPrequest
HTTPrequest --> Resolver : Obj
deactivate HTTPrequest
Resolver -> HTTPrequest : getMethod()
activate HTTPrequest
HTTPrequest --> Resolver : Method
deactivate HTTPrequest
note over Resolver  
knowing the method (GET) of the HTTPrequest , 
the right methods of the warehouse will be called
end note
Resolver -> Warehouse : getSKUs(id : Obj.Id)

note over Warehouse
with this query we get the right SKU,
if the query will respond with a null or error, we throw an execption
end note
activate Warehouse
Warehouse -> DatabaseHelper : queryDB(GetQueryTemplate, dataSKU)
activate DatabaseHelper
DatabaseHelper -> Warehouse : Object
deactivate DatabaseHelper
note over Warehouse
Setting position from the available ones
end note
Warehouse -> SKU : setPosition(positionAvailable)
activate SKU
SKU -> Warehouse : void
deactivate SKU
Warehouse -> DatabaseHelper : queryDB(UpdateQueryTemplate, dataPosition)
activate DatabaseHelper
DatabaseHelper -> Warehouse: Object
deactivate DatabaseHelper

Warehouse ->Resolver : {integer, Object}
deactivate Warehouse
Resolver ->EZWH:HTTPresponse
deactivate Resolver
EZWH -> Frontend: send HTTP response
deactivate EZWH
```
# Sequence Diagram 2-1 : Create position
```plantuml
@startuml
collections Frontend    as Frontend
participant EZWH        as EZWH
participant Resolver    as Resolver
participant HTTPrequest as HTTPrequest
participant Warehouse   as Warehouse
participant Position    as Position
participant DatabaseHelper as DatabaseHelper

note over Frontend
The Frontend include GUI e DataInterface
end note
Frontend -> EZWH  : send HTTP request
activate EZWH 
EZWH -> Resolver : resolve(request : HTTPrequest)
activate Resolver
Resolver -> HTTPrequest : getBody()
activate HTTPrequest
HTTPrequest --> Resolver : Obj
deactivate HTTPrequest
Resolver -> HTTPrequest : getMethod()
activate HTTPrequest
HTTPrequest --> Resolver : Method
deactivate HTTPrequest
note over Resolver  
knowing the the method (POST) of the HTTPrequest , 
the right method of the warehouse will be called
end note
Resolver -> Warehouse : postPosition(body : Obj)
activate Warehouse 
Warehouse -> Position  : new Position(Obj.positionID, Obj.aisleID,Obj.maxWeight,Obj.maxVolume)
activate Position
Position --> Warehouse : Position
deactivate Position
Warehouse -> DatabaseHelper : storePosition (Object : Position)
activate DatabaseHelper
DatabaseHelper --> Warehouse : void
deactivate DatabaseHelper
Warehouse --> Resolver : {Integer, Object}
deactivate Warehouse
Resolver --> EZWH : HTTPresponse
deactivate Resolver
EZWH --> Frontend : send HTTP response
deactivate EZWH
```
# Sequence Diagram 3-2 : Restock Order of SKU S issued by supplier
```plantuml
@startuml
collections Frontend    as Frontend
participant EZWH        as EZWH
participant Resolver    as Resolver
participant HTTPrequest as HTTPrequest
participant Warehouse   as Warehouse
participant RestockOrder as RestockOrder
participant DatabaseHelper as DatabaseHelper


note over Frontend
The Frontend include GUI e DataInterface
end note
note over Frontend
The first HTTP request
covers the first four points
of the scenario
end note
Frontend -> EZWH  : send HTTP request
activate EZWH 
EZWH -> Resolver : resolve(request : HTTPrequest)
activate Resolver
Resolver -> HTTPrequest : getBody()
activate HTTPrequest
HTTPrequest --> Resolver : Obj
deactivate HTTPrequest
Resolver -> HTTPrequest : getMethod()
activate HTTPrequest
HTTPrequest --> Resolver : Method
deactivate HTTPrequest
note over Resolver  
knowing the method (GET) of the HTTPrequest , 
the right methods of the warehouse will be called
end note
Resolver -> Warehouse : putRestockOrder(newRestockOrder:Object)
activate Warehouse
Warehouse -> RestockOrder: setSupplier(supplier:S)
activate RestockOrder
RestockOrder -> Warehouse : void
deactivate RestockOrder
Warehouse -> RestockOrder : addProduct(Item: item, quantity: M)
activate RestockOrder
RestockOrder -> Warehouse : void
deactivate RestockOrder
Warehouse -> RestockOrder : setState(newState: ISSUED)
activate RestockOrder
RestockOrder -> Warehouse : void
deactivate RestockOrder 
Warehouse -> DatabaseHelper : queryDB(InsertQueryTemplate, dataRestockOrder)
activate DatabaseHelper
DatabaseHelper -> Warehouse: object
deactivate DatabaseHelper

Warehouse ->Resolver : {integer, Object}
deactivate Warehouse
Resolver ->EZWH:HTTPresponse
deactivate Resolver
EZWH -> Frontend: send HTTP response
deactivate EZWH
```
# Sequence Diagram 5-1-1 : Record restock order arrival
```plantuml
@startuml
collections Frontend    as Frontend
participant EZWH        as EZWH
participant Resolver    as Resolver
participant HTTPrequest as HTTPrequest
participant Warehouse   as Warehouse
participant RestockOrder as RestockOrder
participant DatabaseHelper as DatabaseHelper

note over Frontend
The Frontend include GUI e DataInterface
end note
Frontend -> EZWH  : send HTTP request
activate EZWH 
EZWH -> Resolver : resolve(request : HTTPrequest)
activate Resolver
Resolver -> HTTPrequest : getBody()
activate HTTPrequest
HTTPrequest --> Resolver : Obj
deactivate HTTPrequest
Resolver -> HTTPrequest : getMethod()
activate HTTPrequest
HTTPrequest --> Resolver : Method
deactivate HTTPrequest
note over Resolver  
knowing the method (PUT) of the HTTPrequest , 
the right methods of the warehouse will be called
end note
Resolver -> Warehouse : putRestockOrderSKUItems(id : Obj.Id, body : Object)
activate Warehouse 
note over Warehouse
with this query we get the right RestockOrder,
if the query will respond with a null or error, we throw an execption
end note
Warehouse -> DatabaseHelper  : queryDB(GetQueryTemplate, dataRestockOrder)
activate DatabaseHelper
DatabaseHelper --> Warehouse : {Integer, RestockOrder}
deactivate DatabaseHelper
Warehouse -> RestockOrder : getProducts()
activate RestockOrder
RestockOrder --> Warehouse : Map<Item,idItem>
deactivate RestockOrder
Warehouse -> DatabaseHelper : queryDB(InserTqueryTemplate, Map<Item,idItem>)
activate DatabaseHelper
DatabaseHelper -> Warehouse : Object 
deactivate DatabaseHelper
note over Warehouse
with this query the state of the  RestockOrder 
is changed to delivered
end note 
Warehouse -> DatabaseHelper : queryDB(UpdateQueryTemplate, dataRestockOrder>)
activate DatabaseHelper
DatabaseHelper -> Warehouse : Object
deactivate DatabaseHelper
Warehouse --> Resolver : {Integer, Object}
deactivate Warehouse
Resolver --> EZWH : HTTPresponse
deactivate Resolver
EZWH --> Frontend : send HTTP response
deactivate EZWH
```
# Sequence Diagram 5-2-3 : Record negative and positive test results of all SKU items of a RestockOrder
```plantuml
@startuml
collections Frontend    as Frontend
participant EZWH        as EZWH
participant Resolver    as Resolver
participant HTTPrequest as HTTPrequest
participant Warehouse   as Warehouse
participant RestockOrder as RestockOrder
participant SKUItem as SKUItem
participant DatabaseHelper as DatabaseHelper


note over Frontend
The Frontend include GUI e DataInterface
end note
note over Frontend
The first HTTP request
covers the first four points
of the scenario
end note
Frontend -> EZWH  : send HTTP request
activate EZWH 
EZWH -> Resolver : resolve(request : HTTPrequest)
activate Resolver
Resolver -> HTTPrequest : getBody()
activate HTTPrequest
HTTPrequest --> Resolver : Obj
deactivate HTTPrequest
Resolver -> HTTPrequest : getMethod()
activate HTTPrequest
HTTPrequest --> Resolver : Method
deactivate HTTPrequest
note over Resolver  
knowing the method (GET) of the HTTPrequest , 
the right methods of the warehouse will be called
end note
Resolver -> Warehouse : getRestockOrders(id : Obj.Id)
activate Warehouse 
note over Warehouse
with this query we get the right RestockOrder,
if the query will respond with a null or error, we throw an execption
end note
Warehouse -> DatabaseHelper  : queryDB(GetQueryTemplate, dataRestockOrder)
activate DatabaseHelper
DatabaseHelper --> Warehouse : {Integer, RestockOrder}
deactivate DatabaseHelper
note over Warehouse
Getting SKUItems of restock order
end note
Warehouse -> RestockOrder : getSKUItems()
activate RestockOrder
RestockOrder -> Warehouse : Collection <SKUItem>
deactivate RestockOrder
Warehouse -> DatabaseHelper : queryDB(GetQueryTemplate, dataSKUItems)
activate DatabaseHelper
DatabaseHelper -> Warehouse : Object
deactivate DatabaseHelper
Warehouse -> SKUItem : addTestResult(testResult: test)
activate SKUItem
SKUItem -> Warehouse: void
note over Warehouse
Updating test result of SKUItems
end note
deactivate SKUItem
Warehouse -> DatabaseHelper : queryDB(UpdateQueryTemplate, dataTestResult)
activate DatabaseHelper
DatabaseHelper -> Warehouse: Object
deactivate DatabaseHelper
note over Warehouse
updating restock order as tested
end note
Warehouse -> DatabaseHelper : queryDB(UpdateQueryTemplate, dataRestockOrder)
activate DatabaseHelper
DatabaseHelper -> Warehouse : Object
deactivate DatabaseHelper
Warehouse ->Resolver : {integer, Object}
deactivate Warehouse
Resolver ->EZWH:HTTPresponse
deactivate Resolver
EZWH -> Frontend: send HTTP response
deactivate EZWH


```
# Sequence Diagram 5-3-3 : Stock some SKU items of a RO
```plantuml
@startuml

collections Frontend    as Frontend
participant EZWH        as EZWH
participant Resolver    as Resolver
participant HTTPrequest as HTTPrequest
participant Warehouse   as Warehouse
participant DatabaseHelper as DatabaseHelper

note over Frontend
The Frontend include GUI e DataInterface
end note
Frontend -> EZWH  : send HTTP request
activate EZWH 
    EZWH -> Resolver : resolve(request : HTTPrequest)
    activate Resolver
        Resolver -> HTTPrequest : getAttributes()
        activate HTTPrequest
            HTTPrequest --> Resolver : Object
        deactivate HTTPrequest
        note over Resolver  
        knowing the method (PUT) of the HTTPrequest , 
        the right methods of the warehouse will be called
        end note
        Resolver -> Warehouse : getInstance()
        activate Warehouse 
            Warehouse -> Resolver : instance : Warehouse
            Resolver -> Warehouse : putRestockOrder(id : Integer, body : Object)
            Warehouse -> DatabaseHelper : getInstance()
            activate DatabaseHelper
                DatabaseHelper --> Warehouse : instance : DatabaseHelper
                note over Warehouse
                    Take the RestockOrder by id
                end note
                Warehouse -> DatabaseHelper : queryDB(sql : String, data : Collection<>)
                DatabaseHelper --> Warehouse : ro : RestockOrder
            deactivate DatabaseHelper

            Warehouse -> RestockOrder : ro.getSKUs()
            activate RestockOrder
                RestockOrder --> Warehouse : Map<SKU, Integer>
            deactivate RestockOrder
            
            note over Warehouse
                For each SKU we have to update the position and the avalableQuantity
            end note

            loop for each SKUitem skuItem

                Warehouse -> SKUItem : skuItem.getPosition()
                activate SKUItem
                    SKUItem --> Warehouse : pos : Position
                deactivate SKUItem

                note over Warehouse
                    with this query we update the position
                end note 
                Warehouse -> DatabaseHelper : queryDB(UpdateQueryTemplate, [pos, qty]>)
                activate DatabaseHelper
                DatabaseHelper -> Warehouse : Object
                deactivate DatabaseHelper

                note over Warehouse
                   with this query we update the SKU availableQuantity
                end note 
                Warehouse -> DatabaseHelper : queryDB(UpdateQueryTemplate, [sku, qty]>)
                activate DatabaseHelper
                DatabaseHelper -> Warehouse : Object
                deactivate DatabaseHelper

            end

            Warehouse -> RestockOrder : ro.setState(StateRestock.COMPLETEDRETURN)
            activate RestockOrder 
                RestockOrder --> Warehouse : void
            deactivate RestockOrder

            Warehouse --> Resolver : Object
        deactivate Warehouse

        Resolver --> EZWH : HTTPresponse
    deactivate Resolver
    EZWH --> Frontend : send HTTP response
deactivate EZWH
```
# Sequence Diagram 6-2 : Return order of any SKU items
```plantuml
@startuml
collections Frontend    as Frontend
participant EZWH        as EZWH
participant Resolver    as Resolver
participant HTTPrequest as HTTPrequest
participant Warehouse   as Warehouse
participant RestockOrder as RestockOrder
participant DatabaseHelper as DatabaseHelper

note over Frontend
The Frontend include GUI e DataInterface
end note
note over Frontend
The first HTTP request
covers the first four points
of the scenario
end note
Frontend -> EZWH  : send HTTP request
activate EZWH 
EZWH -> Resolver : resolve(request : HTTPrequest)
activate Resolver
Resolver -> HTTPrequest : getBody()
activate HTTPrequest
HTTPrequest --> Resolver : Obj
deactivate HTTPrequest
Resolver -> HTTPrequest : getMethod()
activate HTTPrequest
HTTPrequest --> Resolver : Method
deactivate HTTPrequest
note over Resolver  
knowing the method (GET) of the HTTPrequest , 
the right methods of the warehouse will be called
end note
Resolver -> Warehouse : getRestockOrders(id : Obj.Id)
activate Warehouse 
note over Warehouse
with this query we get the right RestockOrder,
if the query will respond with a null or error, we throw an execption
end note
Warehouse -> DatabaseHelper  : queryDB(GetQueryTemplate, dataRestockOrder)
activate DatabaseHelper
DatabaseHelper --> Warehouse : {Integer, RestockOrder}
deactivate DatabaseHelper
Warehouse --> Resolver : {Integer, Object}
deactivate Warehouse
Resolver --> EZWH : HTTPresponse
deactivate Resolver
note over Frontend
The second HTTP request
covers the remaining points
of the scenario
end note
EZWH --> Frontend : send HTTP response
deactivate EZWH
Frontend -> EZWH  : send HTTP request
activate EZWH 
EZWH -> Resolver : resolve(request : HTTPrequest)
activate Resolver
Resolver -> HTTPrequest : getBody()
activate HTTPrequest
HTTPrequest --> Resolver : Obj
deactivate HTTPrequest
Resolver -> HTTPrequest : getMethod()
activate HTTPrequest
HTTPrequest --> Resolver : Method
deactivate HTTPrequest
note over Resolver  
knowing the method (GET) of the HTTPrequest , 
the right methods of the warehouse will be called
end note
Resolver -> Warehouse : postReturnOrder(newReturnOrder : Obj)
activate Warehouse 
Warehouse -> DatabaseHelper  : queryDB(postQueryTemplate, dataReturnkOrder)
activate DatabaseHelper
DatabaseHelper --> Warehouse : Object
deactivate DatabaseHelper
note over Warehouse
with this query the state of the  SKUitems 
is changed to delivered
end note
Warehouse -> DatabaseHelper  : queryDB(updateQueryTemplate, dataSKUItems)
activate DatabaseHelper
DatabaseHelper --> Warehouse : Object
deactivate DatabaseHelper
note over Warehouse
with this query the availability of the  SKUitems 
decreased
end note
Warehouse -> DatabaseHelper  : queryDB(updateQueryTemplate, dataSKUItems)
activate DatabaseHelper
DatabaseHelper --> Warehouse : Object
deactivate DatabaseHelper
note over Warehouse
with this query the position of the  SKUitems 
is increased
end note
Warehouse -> DatabaseHelper  : queryDB(updateQueryTemplate, dataPosition)
activate DatabaseHelper
DatabaseHelper --> Warehouse : Object
deactivate DatabaseHelper
Warehouse --> Resolver : {Integer, Object}
deactivate Warehouse
Resolver --> EZWH : HTTPresponse
deactivate Resolver
EZWH --> Frontend : send HTTP response
deactivate EZWH
```
# Sequence Diagram 9-1 : Internal Order IO accepted
```plantuml
@startuml

collections Frontend    as Frontend

note over Frontend
    Customer
end note
Frontend -> EZWH  : send HTTP request
activate EZWH 
    EZWH -> Resolver : resolve(request : HTTPrequest)
    activate Resolver
        Resolver -> HTTPrequest : getAttributes()
        activate HTTPrequest
            HTTPrequest --> Resolver : Object
        deactivate HTTPrequest
        note over Resolver  
        knowing the method (PUT) of the HTTPrequest , 
        the right methods of the warehouse will be called
        end note
        Resolver -> Warehouse : getInstance()
        activate Warehouse 
            Warehouse --> Resolver : instance : Warehouse
            Resolver -> Warehouse : postInternalOrder(newIO : Object)

            Warehouse -> InternalOrder : new InternalOrder(newIO.issueDate, newIO.products, newIO.customerID, StateInternal.ISSUED)
            activate InternalOrder
                InternalOrder --> Warehouse : io : InternalOrder
            deactivate InternalOrder
            Warehouse -> InternalOrder : io.getSKUs()
            activate InternalOrder
                InternalOrder --> Warehouse : Map<SKU,Integer>
            deactivate InternalOrder
            loop for each sku : SKU
                Warehouse -> SKU : getPosition()
                activate SKU
                    SKU --> Warehouse : pos : Position
                deactivate SKU

                note over Warehouse
                    with this query we update the position
                end note 
                Warehouse -> DatabaseHelper : queryDB(UpdateQueryTemplate, [pos, qty]>)
                activate DatabaseHelper
                DatabaseHelper -> Warehouse : Object
                deactivate DatabaseHelper

                note over Warehouse
                   with this query we update the SKU availableQuantity
                end note 
                Warehouse -> DatabaseHelper : queryDB(UpdateQueryTemplate, [sku, qty]>)
                activate DatabaseHelper
                DatabaseHelper -> Warehouse : Object
                deactivate DatabaseHelper
            end
            note over Warehouse
                with this query we store the InternalOrder
            end note 
            Warehouse -> DatabaseHelper : queryDB(InsertDataTemplate, data : Collection<>)
            activate DatabaseHelper
                DatabaseHelper --> Warehouse : Object
            deactivate DatabaseHelper
            Warehouse --> Resolver : Object
        deactivate Warehouse
        Resolver --> EZWH : HTTPresponse
    deactivate Resolver
    EZWH --> Frontend : send HTTP response
deactivate EZWH

note over Frontend
Manager
end note
Frontend -> EZWH  : send HTTP request
activate EZWH 
    EZWH -> Resolver : resolve(request : HTTPrequest)
    activate Resolver
        Resolver -> HTTPrequest : getAttributes()
        activate HTTPrequest
            HTTPrequest --> Resolver : Object
        deactivate HTTPrequest
        
        Resolver -> Warehouse : getInstance()
        activate Warehouse 
            Warehouse --> Resolver : instance : Warehouse
            Resolver -> Warehouse : putInternalOrder(id : Integer, body : Object)
            note over Warehouse
                with this query we update the InternalOrder
            end note 
            Warehouse -> DatabaseHelper : queryDB(UpdateDataTemplate, data : Collection<>)
            activate DatabaseHelper
                DatabaseHelper --> Warehouse : Object
            deactivate DatabaseHelper
            Warehouse --> Resolver : Object
        deactivate Warehouse
        Resolver --> EZWH : HTTPresponse
    deactivate Resolver
    EZWH --> Frontend : send HTTP response
deactivate EZWH
```
# Sequence Diagram 10-1 : Internal Order IO Completed
```plantuml
@startuml
collections Frontend    as Frontend
participant EZWH        as EZWH
participant Resolver    as Resolver
participant HTTPrequest as HTTPrequest
participant Warehouse   as Warehouse
participant InternalOrder
participant SKUItem as SKUItem
participant DatabaseHelper as DatabaseHelper


note over Frontend
The Frontend include GUI e DataInterface
end note
note over Frontend
The first HTTP request
covers the first four points
of the scenario
end note
Frontend -> EZWH  : send HTTP request
activate EZWH 
EZWH -> Resolver : resolve(request : HTTPrequest)
activate Resolver
Resolver -> HTTPrequest : getBody()
activate HTTPrequest
HTTPrequest --> Resolver : Obj
deactivate HTTPrequest
Resolver -> HTTPrequest : getMethod()
activate HTTPrequest
HTTPrequest --> Resolver : Method
deactivate HTTPrequest
note over Resolver  
knowing the method (GET) of the HTTPrequest , 
the right methods of the warehouse will be called
end note
Resolver -> Warehouse : getInternalOrders(id : Obj.Id)
activate Warehouse 
note over Warehouse
with this query we get the right InternalOrder,
if the query will respond with a null or error, we throw an execption
end note
Warehouse -> DatabaseHelper : queryDB(GetQueryTemplate, dataInternalOrder)
activate DatabaseHelper
DatabaseHelper -> Warehouse : Object
deactivate DatabaseHelper
Warehouse -> InternalOrder : getSKUItems()
activate InternalOrder
InternalOrder ->Warehouse : Collection <SKUItems>
deactivate InternalOrder
Warehouse -> DatabaseHelper : queryDB(GetQueryTemplate, dataSKUItems)
activate DatabaseHelper 
DatabaseHelper -> Warehouse : Object
deactivate DatabaseHelper
note over Warehouse
Setting as note available
end note
Warehouse -> SKUItem : setAvailable(0)
activate SKUItem
SKUItem -> Warehouse : void
deactivate SKUItem
Warehouse -> DatabaseHelper: queryDB(UpdateQueryTemplate, dataSKUItems)
activate DatabaseHelper
DatabaseHelper -> Warehouse: Object
deactivate DatabaseHelper
note over Warehouse
Setting internal order state as completed
end note
Warehouse -> DatabaseHelper : queryDB(UpdateQueryTemplate, dataInternalOrder)
activate DatabaseHelper
DatabaseHelper -> Warehouse : Object
deactivate DatabaseHelper
Warehouse ->Resolver : {integer, Object}
deactivate Warehouse
Resolver ->EZWH:HTTPresponse
deactivate Resolver
EZWH -> Frontend: send HTTP response
deactivate EZWH

```
# Sequence Diagram 11-1 : Create Item I
```plantuml
@startuml
title Sequence Diagram 11-1 : Create Item I
collections Frontend    as Frontend

note over Frontend
The Frontend include GUI e DataInterface
end note
Frontend -> EZWH  : send HTTP request
activate EZWH 
    EZWH -> Resolver : resolve(request : HTTPrequest)
    activate Resolver
        Resolver -> HTTPrequest : getAttributes()
        activate HTTPrequest
            HTTPrequest --> Resolver : Object
        deactivate HTTPrequest
        note over Resolver  
        knowing the method (PUT) of the HTTPrequest , 
        the right methods of the warehouse will be called
        end note
        Resolver -> Warehouse : getInstance()
        activate Warehouse 
            Warehouse --> Resolver : instance : Warehouse
            Resolver -> Warehouse : postItem(newItem : Object)

            Warehouse -> InternalOrder : new Item(item.description, item.price, item.SKUId, item.supplierId)
            activate InternalOrder
                InternalOrder --> Warehouse : item : Item
            deactivate InternalOrder
            Warehouse -> DatabaseHelper : queryDB(insertQueryTemplate, data : Collection<>)
            activate DatabaseHelper
                DatabaseHelper --> Warehouse : Object
            deactivate DatabaseHelper
            Warehouse --> Resolver : Object
        deactivate Warehouse
        Resolver --> EZWH : HTTPresponse
    deactivate Resolver
    EZWH --> Frontend : send HTTP response
deactivate EZWH
```
# Sequence Diagram 12-1 : Create test description
```plantuml
@startuml
collections Frontend    as Frontend
participant EZWH        as EZWH
participant Resolver    as Resolver
participant HTTPrequest as HTTPrequest
participant Warehouse   as Warehouse
participant TestDescriptor    as TestDescriptor
participant DatabaseHelper as DatabaseHelper

note over Frontend
The Frontend include GUI e DataInterface
end note
Frontend -> EZWH  : send HTTP request
activate EZWH 
EZWH -> Resolver : resolve(request : HTTPrequest)
activate Resolver
Resolver -> HTTPrequest : getBody()
activate HTTPrequest
HTTPrequest --> Resolver : Body
deactivate HTTPrequest
Resolver -> HTTPrequest : getMethod()
activate HTTPrequest
HTTPrequest --> Resolver : Method
deactivate HTTPrequest
note over Resolver  
knowing the the method (POST) of the HTTPrequest , 
the right method of the warehouse will be called
end note
Resolver -> Warehouse : postTestDescriptor(newTestDescriptor : Obj)
activate Warehouse 
Warehouse -> TestDescriptor  : new TestDescriptor(Obj.name, Obj.procedureDescription)
activate TestDescriptor
TestDescriptor --> Warehouse : TestDescriptor
deactivate TestDescriptor
Warehouse -> DatabaseHelper : queryDB(InsertqueryTemplate, dataTestDescriptor)
activate DatabaseHelper
DatabaseHelper --> Warehouse : TestDescriptor
deactivate DatabaseHelper
Warehouse --> Resolver : {Integer, Object}
deactivate Warehouse
Resolver --> EZWH : HTTPresponse
deactivate Resolver
EZWH --> Frontend : send HTTP response
deactivate EZWH
```

 The method queryDB(sql:String, data : Collection<>) is composed by a string (sql), which is a template query that is filled with the parameter contained in the collection (data).
 The method return an Object that could be contain the requested values or an error.

 example:

 sql = "SELECT ? FROM ?" <br>
 data = [*, POSITION]<br>
 query = "SELECT * FROM POSITION"<br>