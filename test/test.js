/**
 *   Single entry point for all test.
 */

var test = require('tape');
var xin = require('../src/xin.js');
var xin = require('../src/modules.js');

var testEvent = require('./eventTest');
test('Basic events', testEvent);

var testModules = require('./moduleTest');
test('Modules', testModules);
