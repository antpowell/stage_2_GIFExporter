"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var GIFGenerator_1 = require("./../GIFGenerator");
var chai_1 = require("chai");
require("mocha");
describe('GIFGenerator()', function () {
    var colorObj = ['ffffff00', '00000000', '0f0f0f00', 'f0f0f000'];
    // console.log(GCT);
    var width = 25;
    var height = 25;
    var gifGenerator = new GIFGenerator_1.GIFGenerator(width, height, colorObj);
    describe('constructor', function () {
        it('should set width, height and GCT', function () {
            // const results = () => {
            // 	gifGenerator.init();
            // 	gifGenerator.getAnimatedGIFBlob();
            // };
            gifGenerator.init();
            chai_1.expect(gifGenerator.getAnimatedGIFBlob()).to.contain(25);
            // expect(gifGenerator.init());
        });
    });
});
//# sourceMappingURL=gif.generator.spec.js.map