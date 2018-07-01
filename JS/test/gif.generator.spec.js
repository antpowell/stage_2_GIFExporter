import { GIFGenerator } from './../GIFGenerator';
import { expect } from 'chai';
import 'mocha';
describe('GIFGenerator()', function () {
    var colorObj = ['ffffff00', '00000000', '0f0f0f00', 'f0f0f000'];
    // console.log(GCT);
    var width = 25;
    var height = 25;
    var gifGenerator = new GIFGenerator(width, height, colorObj);
    describe('constructor', function () {
        it('should set width, height and GCT', function () {
            // const results = () => {
            // 	gifGenerator.init();
            // 	gifGenerator.getAnimatedGIFBlob();
            // };
            gifGenerator.init();
            expect(gifGenerator.getAnimatedGIFBlob()).to.contain(25);
            // expect(gifGenerator.init());
        });
    });
});
//# sourceMappingURL=gif.generator.spec.js.map