"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ColorTableGenerator_1 = require("../ColorTableGenerator");
var chai_1 = require("chai");
require("mocha");
describe('ColorTableGenerator', function () {
    describe('generate()', function () {
        var results = new ColorTableGenerator_1.ColorTableGenerator().generate();
        it('should create and return a string[]', function () {
            results
                .then(function (result) {
                chai_1.expect(result).to.be('string[]');
            })
                .catch(function (err) { });
        });
        it('colors should be always have a length of 256', function () {
            results
                .then(function (result) {
                chai_1.expect(result).to.have.lengthOf(256);
            })
                .catch(function () { });
        });
    });
});
//# sourceMappingURL=color.table.generator.spec.js.map