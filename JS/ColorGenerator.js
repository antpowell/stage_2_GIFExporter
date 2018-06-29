var ColorTableGenerator = /** @class */ (function () {
    function ColorTableGenerator() {
        this._colorTable = [];
        this._distribution = 51;
        this._colorLookup = {};
    }
    ColorTableGenerator.prototype.generate = function () {
        var count = 0;
        for (var red = 0; red < 256; red += this._distribution) {
            for (var green = 0; green < 256; green += this._distribution) {
                for (var blue = 0; blue < 256; blue += this._distribution) {
                    var pixel = this.pad(red) + this.pad(green) + this.pad(blue);
                    this._colorTable.push(pixel);
                    this._colorLookup[pixel] = count;
                    count++;
                }
            }
        }
        return {
            _colorLookup: this._colorLookup,
            _colorTable: this._colorTable,
        };
    };
    ColorTableGenerator.prototype.pad = function (color) {
        if (color < 16) {
            return "0" + color.toString(16);
        }
        else {
            return color.toString(16);
        }
    };
    return ColorTableGenerator;
}());
//# sourceMappingURL=ColorGenerator.js.map