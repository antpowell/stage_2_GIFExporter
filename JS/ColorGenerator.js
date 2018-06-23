var ColorTableGenerator = /** @class */ (function () {
    function ColorTableGenerator() {
        this._colorTable = [];
        this._distribution = 51;
        this._colorLookup = {};
    }
    ColorTableGenerator.prototype.generate = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var count = 0;
            for (var red = 0; red < 256; red += _this._distribution) {
                for (var green = 0; green < 256; green += _this._distribution) {
                    for (var blue = 0; blue < 256; blue += _this._distribution) {
                        var pixel = _this.pad(red) + _this.pad(green) + _this.pad(blue);
                        _this._colorTable.push(pixel);
                        _this._colorLookup[pixel] = count;
                        count++;
                    }
                }
            }
            console.log(_this._colorTable);
            resolve({
                _colorLookup: _this._colorLookup,
                _colorTable: _this._colorTable,
            });
        });
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