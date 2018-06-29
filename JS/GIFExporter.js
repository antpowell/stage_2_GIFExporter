var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var GIFExporter = /** @class */ (function () {
    function GIFExporter(engine, options) {
        this._imageDataCollection = [];
        var colorGenerator = new ColorTableGenerator().generate();
        this._engine = engine;
        this._canvas = engine.getRenderingCanvas();
        this._delay = options.delay;
        this._duration = options.duration;
        this._GCT = options.GCT || colorGenerator._colorTable;
        this._colorLookUpTable = colorGenerator._colorLookup;
        this._width = engine.getRenderWidth();
        this._height = engine.getRenderHeight();
        this._gifGenerator = new GIFGenerator(this._width, this._height, this._GCT);
        this._gifGenerator.init();
    }
    GIFExporter.prototype.start = function () {
        var _this = this;
        console.log('​GIFExporter3 -> start -> ');
        return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getSnapShotDataFromCanvas()];
                    case 1:
                        _a.sent();
                        console.log('setupImg complete');
                        return [4 /*yield*/, this.processFrames(this._imageDataCollection)];
                    case 2:
                        _a.sent();
                        console.log("finished", this._imageDataCollection);
                        resolve();
                        return [2 /*return*/];
                }
            });
        }); });
    };
    GIFExporter.prototype.stop = function () {
        console.log('​GIFExporter3 -> stop -> ');
        clearInterval(this._intervalRef);
    };
    GIFExporter.prototype.download = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('​GIFExporter3 -> download -> ');
                        return [4 /*yield*/, this.start()];
                    case 1:
                        _a.sent();
                        this._gifGenerator.download('testingGE3.gif');
                        return [2 /*return*/];
                }
            });
        });
    };
    GIFExporter.prototype.getSnapShotDataFromCanvas = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this._intervalRef = setInterval(function () {
                var gl = _this._canvas.getContext('webgl2') || _this._canvas.getContext('webgl');
                var pixels = new Uint8Array(gl.drawingBufferWidth * gl.drawingBufferHeight * 4);
                gl.readPixels(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
                _this._imageDataCollection.push(pixels);
            }, _this._delay);
            setTimeout(function () {
                _this.stop();
                resolve();
            }, _this._duration);
        });
    };
    GIFExporter.prototype.processFrames = function (imageDataCollection) {
        var _this = this;
        console.log('​GIFExporter3 -> privateprocessFrames -> ');
        new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var _this = this;
            var count;
            return __generator(this, function (_a) {
                count = imageDataCollection.length;
                imageDataCollection.forEach(function (imgData) { return __awaiter(_this, void 0, void 0, function () {
                    var rgbData, indexedData;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, this.flipFrame(imgData)];
                            case 1:
                                imgData = _a.sent();
                                rgbData = this.removeAlpha(imgData);
                                indexedData = this.mapPixelIndex(rgbData);
                                this._gifGenerator.generateFrame(indexedData);
                                if (--count === 0)
                                    resolve();
                                return [2 /*return*/];
                        }
                    });
                }); });
                return [2 /*return*/];
            });
        }); });
    };
    GIFExporter.prototype.flipFrame = function (frame) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var split = (_this._height / 2) |
                0; /* | 0 faster version of Math.floor for positive numbers */
            var bytesPerRow = _this._width * 4;
            // make a temp buffer to hold one row
            var row = new Uint8Array(_this._width * 4);
            for (var rowIndex = 0; rowIndex < split; ++rowIndex) {
                var topOffset = rowIndex * bytesPerRow;
                var bottomOffset = (_this._height - rowIndex - 1) * bytesPerRow;
                // make copy of a row on the top half
                row.set(frame.subarray(topOffset, topOffset + bytesPerRow));
                // copy a row from the bottom half to the top
                frame.copyWithin(topOffset, bottomOffset, bottomOffset + bytesPerRow);
                // copy the copy of the top half row to the bottom half
                frame.set(row, bottomOffset);
                if (rowIndex < split)
                    resolve(frame);
            }
        });
    };
    GIFExporter.prototype.removeAlpha = function (colorArray) {
        var RGBPixelData = [];
        for (var i = 0; i < colorArray.length; i += 4) {
            var pixel = this.pad(this.snapColor(colorArray[i])) +
                this.pad(this.snapColor(colorArray[i + 1])) +
                this.pad(this.snapColor(colorArray[i + 2]));
            RGBPixelData.push(pixel);
        }
        return RGBPixelData;
    };
    GIFExporter.prototype.pad = function (color) {
        if (color < 16) {
            return "0" + color.toString(16);
        }
        else {
            return color.toString(16);
        }
    };
    GIFExporter.prototype.snapColor = function (color) {
        if (color % 51 > Math.floor(51 / 2)) {
            color += 51 - (color % 51);
        }
        else {
            color -= color % 51;
        }
        return color;
    };
    GIFExporter.prototype.mapPixelIndex = function (rgbData) {
        var _this = this;
        var indexedPixels = [];
        rgbData.forEach(function (pixel) {
            indexedPixels.push(_this._colorLookUpTable[pixel]);
        });
        return indexedPixels;
    };
    return GIFExporter;
}());
//# sourceMappingURL=GIFExporter.js.map