"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var EncodedImage_1 = require("../EncodedImage");
var chai_1 = require("chai");
require("mocha");
describe('EncodedImage', function () {
    var results = new EncodedImage_1.EncodedImage();
    var data = results.data;
    describe('get()', function () {
        it('should return data property', function () {
            chai_1.expect(results.get()).to.equal(data);
        });
        it('data should be of an array', function () {
            chai_1.expect(data).to.be.a('array');
        });
        it('data should only contain numbers', function () {
            data.forEach(function (result) {
                chai_1.expect(result).to.be.a('number');
            });
        });
    });
    describe('write()', function () {
        /*
        * ? typescript catches this error should test still be written
        */
        /* it('should only accept a number as an arg', () => {
            expect(results.write('string')).to.throw();
        }); */
        // it('should only add one number to the data property', () => {
        //     expect(results.write(2)).to.increase(data, "length");
        // })
        it('should ', function () {
        });
    });
    describe('writeArray()', function () {
        it('should take 2 and only 2 arguments', function () {
            // expect(results.writeArray([1], 1)).to
        });
    });
    describe('writeUTF()', function () {
        it('should only take a string as an argument', function () {
        });
    });
    describe('writeColor()', function () {
        it('should only take a string  as a argument', function () {
        });
    });
    describe('writeLittleEndian()', function () {
        /* it('should only take a number as a argument', () => {
            expect(results.writeLittleEndian('string')).to.throw();
        }); */
        it('should convert number in little endian formate', function () {
            results.writeLittleEndian(245);
            chai_1.expect(data.pop()).to.equal(0);
            chai_1.expect(data.pop()).to.equal(245);
        });
        it('should add two number to data', function () {
            var oldData = data;
            results.writeLittleEndian(456);
            chai_1.expect(results.writeLittleEndian(456)).to.increase(data, 'length').by(2);
        });
        it('should write least sig byte first', function () {
        });
        it('if given is not above 256 trailing number should be 00', function () {
        });
    });
});
//# sourceMappingURL=encoded.image.spec.js.map