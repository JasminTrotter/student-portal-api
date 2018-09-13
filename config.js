'use strict';
exports.PORT = process.env.PORT || 8080;
exports.CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'https://student-portal-balletbody.herokuapp.com/';
exports.DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost/student-portal';
exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'mongodb://localhost/student-portal-test';
exports.JWT_SECRET = process.env.JWT_SECRET || 'RandomString';
exports.JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';
exports.API_BASE_URL= process.env.REACT_APP_API_BASE_URL || "http://localhost:3000/api";