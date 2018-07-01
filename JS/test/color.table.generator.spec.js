// import { ColorTableGenerator } from '../ColorGenerator';
import { expect } from 'chai';
import 'mocha';
describe('ColorTableGenerator', function () {
    describe('generate()', function () {
        var results = new ColorTableGenerator().generate();
        it('should create and return a string[]', function () {
            expect(results).to.be('string[]');
        });
        it('colors should be always have a length of 256', function () {
            expect(results).to.have.lengthOf(256);
        });
    });
});
//# sourceMappingURL=color.table.generator.spec.js.map