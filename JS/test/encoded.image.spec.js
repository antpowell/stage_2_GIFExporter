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
        it('should push only one number onto data', function () {
            var length = data.length;
            results.write(24);
            chai_1.expect(data.length).to.be.equal(length + 1);
        });
    });
    describe('writeArray()', function () {
        it('given array of size n should add n elements to data property', function () {
            var length = data.length;
            results.writeArray([43, 43, 22], 3);
            chai_1.expect(data.length).to.equal(length + 3);
        });
    });
    describe('writeUTF()', function () {
        it('string argument should only consist of 0-9a-fA-F', function () {
            var errFunc = function () { results.writeUTF('ff3k'); };
            var errFunc2 = function () { results.writeUTF('fM3k'); };
            var passFunc = function () { results.writeUTF('fFA'); };
            chai_1.expect(errFunc).to.throw();
            chai_1.expect(errFunc2).to.throw();
            chai_1.expect(passFunc).to.not.throw();
        });
    });
    describe('writeColor()', function () {
        it('should convert rgb color string value into hex number i.e.(f444ff should add 244, 68, 255 to data)', function () {
            results.writeColor('cc99ff');
            chai_1.expect(data.pop()).to.equal(255);
            chai_1.expect(data.pop()).to.equal(68);
            chai_1.expect(data.pop()).to.equal(244);
        });
        it('should only take strings of length 6', function () {
            var errFunc = function () { results.writeColor('00dd'); };
            var errFunc2 = function () { results.writeColor('00ddffwf'); };
            chai_1.expect(errFunc).to.throw();
            chai_1.expect(errFunc2).to.throw();
        });
        it('string argument should only consist of 0-9a-fA-F', function () {
            var errFunc = function () { results.writeColor('0f0kmk'); };
            chai_1.expect(errFunc).to.throw();
        });
    });
    describe('writeLittleEndian()', function () {
        it('should convert number in little endian formate', function () {
            results.writeLittleEndian(756);
            chai_1.expect(data.pop()).to.equal(2);
            chai_1.expect(data.pop()).to.equal(244);
        });
        it('should add two number to data', function () {
            var length = data.length;
            results.writeLittleEndian(24);
            chai_1.expect(data.length).to.be.equal(length + 2);
        });
        it('if given is not above 256 trailing number should be 0', function () {
            results.writeLittleEndian(155);
            chai_1.expect(data.pop()).to.equal(0);
            chai_1.expect(data.pop()).to.equal(155);
        });
    });
});
//# sourceMappingURL=encoded.image.spec.js.map