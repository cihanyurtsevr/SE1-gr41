'use strict';
const express = require('express');
const { Warehouse } = require('./src/controllers/Warehouse');
const { StateRestock , StateInternal } = require('./src/models/StateOrders')
const HTTPError = require("./src/controllers/HTTPError");
const { body, validationResult } = require('express-validator');
const {callCtrlCheckErr} = require("./callCtrlCheckErr");

// init Warehouse and Database
Warehouse.getInstance().createTables();

// routers
const skuRouter = require('./routers/sku');
const skuItemRouter = require('./routers/skuitem');
const positionRouter = require('./routers/position');
const testDescriptorRouter = require('./routers/testDescriptor');
const userRouter = require('./routers/user');
const restockOrderRouter = require('./routers/restockOrder');
const returnOrderRouter = require('./routers/returnOrder');
const internalOrderRouter = require('./routers/internalOrder');
const itemRouter = require('./routers/item');


// init express
const app = new express();
const port = 3001;


app.use(express.json());

app.use(['/api/skus', '/api/sku'], skuRouter);
app.use(['/api/skuitems', '/api/skuitem'], skuItemRouter);
app.use(['/api/positions', '/api/position'], positionRouter);
app.use(['/api/testDescriptors', '/api/testDescriptor'], testDescriptorRouter);
app.use(['/api/users'], userRouter);
app.use(['/api/restockOrders', '/api/restockOrder'], restockOrderRouter);
app.use(['/api/returnOrders', '/api/returnOrder'], returnOrderRouter);
app.use(['/api/internalOrders'], internalOrderRouter);
app.use(['/api/items', '/api/item'], itemRouter);

// ---------------------- USER --------------------

//GET /api/userinfo
app.get('/api/userinfo', async (req, res) => {
  const wh = Warehouse.getInstance();

  let ret = await callCtrlCheckErr(wh.UserCtrl.getUserInfo, 200, 500)

  return res.status(ret.status).json(ret.body);
})

//GET /api/suppliers
app.get('/api/suppliers', async (req, res) => {
  const wh = Warehouse.getInstance();

  try{
    if(!wh.hasPermissions("manager"))
      throw HTTPError.E401("wrong permissions")
  }catch (e) {
    return res.status(e.status).json(e.body);
  }

  let ret = await callCtrlCheckErr(wh.UserCtrl.getSuppliers, 200, 500)

  return res.status(ret.status).json(ret.body);
})

//POST /api/newUser
app.post('/api/newUser',[
  body('username').isEmail(),
  body('password').isAlphanumeric().isLength({min: 8}),
  body('name').isAlphanumeric(),
  body('surname').isAlphanumeric()
], async (req, res) => {

  const wh = Warehouse.getInstance();
  const errors = validationResult(req);

  try{
    if(!wh.hasPermissions("manager"))
      throw HTTPError.E401("wrong permissions")

    if(req.body.type === undefined)
      throw HTTPError.E422("Invalid type")

    if (!errors.isEmpty())
      throw HTTPError.E422("Wrong username or password");

  }catch (e) {
    return res.status(e.status).json(e.body);
  }

  let ret = await callCtrlCheckErr(wh.UserCtrl.postNewUser, req.body, 201, 503)

  return res.status(ret.status).json(ret.body);
})

// ---------------------- SESSION -------------------

//POST /api/managerSessions
app.post('/api/managerSessions', [
  body('username').isEmail(),
  body('password').isAlphanumeric().isLength({min: 8})
], async (req, res) => {
  const wh = Warehouse.getInstance();
  const errors = validationResult(req);
  try{
    if (!errors.isEmpty())
      throw HTTPError.E422("Wrong username or password");
  }catch (e){
    return res.status(e.status).json(e.body);
  }

  let ret = await callCtrlCheckErr(wh.UserCtrl.session, req.body.username, req.body.password, "manager", 200, 500);

  return res.status(ret.status).json(ret.body);
})

//POST /api/customerSessions
app.post('/api/customerSessions', [
  body('username').isEmail(),
  body('password').isAlphanumeric().isLength({min: 8})
], async (req, res) => {
  const wh = Warehouse.getInstance();
  const errors = validationResult(req);
  try{
    if (!errors.isEmpty())
      throw HTTPError.E422("Wrong username or password");
  }catch (e){
    return res.status(e.status).json(e.body);
  }

  let ret = await callCtrlCheckErr(wh.UserCtrl.session, req.body.username, req.body.password, "customer", 200, 500);

  return res.status(ret.status).json(ret.body);
})

//POST /api/supplierSessions
app.post('/api/supplierSessions', [
  body('username').isEmail(),
  body('password').isAlphanumeric().isLength({min: 8})
], async (req, res) => {
  const wh = Warehouse.getInstance();
  const errors = validationResult(req);
  try{
    if (!errors.isEmpty())
      throw HTTPError.E422("Wrong username or password");
  }catch (e){
    return res.status(e.status).json(e.body);
  }

  let ret = await callCtrlCheckErr(wh.UserCtrl.session, req.body.username, req.body.password, "supplier", 200, 500);

  return res.status(ret.status).json(ret.body);
})

//POST /api/clerkSessions
app.post('/api/clerkSessions', [
  body('username').isEmail(),
  body('password').isAlphanumeric().isLength({min: 8})
], async (req, res) => {
  const wh = Warehouse.getInstance();
  const errors = validationResult(req);
  try{
    if (!errors.isEmpty())
      throw HTTPError.E422("Wrong username or password");
  }catch (e){
    return res.status(e.status).json(e.body);
  }

  let ret = await callCtrlCheckErr(wh.UserCtrl.session, req.body.username, req.body.password, "clerk", 200, 500);

  return res.status(ret.status).json(ret.body);
})

//POST /api/qualityEmployeeSessions
app.post('/api/qualityEmployeeSessions',[
  body('username').isEmail(),
  body('password').isAlphanumeric().isLength({min: 8})
], async (req, res) => {
  const wh = Warehouse.getInstance();
  const errors = validationResult(req);
  try{
    if (!errors.isEmpty())
      throw HTTPError.E422("Wrong username or password");
  }catch (e){
    return res.status(e.status).json(e.body);
  }

  let ret = await callCtrlCheckErr(wh.UserCtrl.session, req.body.username, req.body.password, "qualityEmployee", 200, 500);

  return res.status(ret.status).json(ret.body);
})

//POST /api/deliveryEmployeeSessions
app.post('/api/deliveryEmployeeSessions', [
  body('username').isEmail(),
  body('password').isAlphanumeric().isLength({min: 8})
], async (req, res) => {
  const wh = Warehouse.getInstance();
  const errors = validationResult(req);
  try{
    if (!errors.isEmpty())
      throw HTTPError.E422("Wrong username or password");
  }catch (e){
    return res.status(e.status).json(e.body);
  }

  let ret = await callCtrlCheckErr(wh.UserCtrl.session, req.body.username, req.body.password, "deliveryEmployee", 200, 500);

  return res.status(ret.status).json(ret.body);
})

//POST /api/logout
app.post('/api/logout', async (req, res) => {
  const wh = Warehouse.getInstance();

  let ret = await callCtrlCheckErr(wh.UserCtrl.logout, 200, 500);

  return res.status(ret.status).json(ret.body);
})

// ----------------- INTERNAL ORDER --------------------

//GET /api/internalOrdersIssued
app.get('/api/internalOrdersIssued', async (req, res) => {
  const wh = Warehouse.getInstance();
  try{
    if(!wh.hasPermissions("manager", "customer"))
      throw HTTPError.E401("wrong permissions")
  }catch (e) {
    return res.status(e.status).json(e.body);
  }

  let ret = await callCtrlCheckErr(wh.OrderCtrl.getInternalOrders, StateInternal.ISSUED, 200, 500);

  return res.status(ret.status).json(ret.body);
})

//GET /api/internalOrdersAccepted
app.get('/api/internalOrdersAccepted', async (req, res) => {
  const wh = Warehouse.getInstance();
  try{
    if(!wh.hasPermissions("manager", "deliveryEmployee"))
      throw HTTPError.E401("wrong permissions")
  }catch (e) {
    return res.status(e.status).json(e.body);
  }

  let ret = await callCtrlCheckErr(wh.OrderCtrl.getInternalOrders, StateInternal.ACCEPTED, 200, 500);

  return res.status(ret.status).json(ret.body);
})

// ----------------- RESTOCK ORDER --------------------

// GET /api/restockOrdersIssued
app.get('/api/restockOrdersIssued', async (req, res) => {
  const wh = Warehouse.getInstance();
  const OrdCtrl = wh.OrderCtrl;

  try{
    if(!wh.hasPermissions("manager", "supplier"))
      throw HTTPError.E401("wrong permissions")
  }catch (e) {
    return res.status(e.status).json(e.body);
  }

  let ret = await callCtrlCheckErr(OrdCtrl.getRestockOrders, StateRestock.ISSUED, 200, 500);

  return res.status(ret.status).json(ret.body);
})

// ----------------------------------------------------

// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

module.exports = app;