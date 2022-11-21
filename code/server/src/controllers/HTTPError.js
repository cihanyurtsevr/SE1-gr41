'use strict'

const E401 = (msg) => { return { status: 401, body: {}, message: msg };}
const E404 = (msg) => { return { status: 404, body: {}, message: msg };}
const E409 = (msg) => { return { status: 409, body: {}, message: msg };}
const E422 = (msg) => { return { status: 422, body: {}, message: msg };}
const E500 = (msg) => { return { status: 500, body: {}, message: msg };}
const E503 = (msg) => { return { status: 503, body: {}, message: msg };}

exports.E401 = E401;
exports.E404 = E404;
exports.E409 = E409;
exports.E422 = E422;
exports.E500 = E500;
exports.E503 = E503;