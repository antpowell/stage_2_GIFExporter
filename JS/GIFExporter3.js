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
var GIFExporter3 = /** @class */ (function () {
    function GIFExporter3(engine, options) {
        this._blobURLs = [];
        this._blobCount = 0;
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
    GIFExporter3.prototype.start = function () {
        var _this = this;
        console.log('​GIFExporter3 -> start -> ');
        return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getSnapShotDataFromCanvas()];
                    case 1:
                        _a.sent();
                        // this._ctx = this.setupCanvas();
                        // await this.getBlobs();
                        // await this.setupImgs();
                        console.log('setupImg complete');
                        // const imgDataCollection = await this.collectImageData(
                        // 	imgs as HTMLImageElement[],
                        // 	this._ctx
                        // );
                        return [4 /*yield*/, this.processFrames(this._imageDataCollection)];
                    case 2:
                        // const imgDataCollection = await this.collectImageData(
                        // 	imgs as HTMLImageElement[],
                        // 	this._ctx
                        // );
                        _a.sent();
                        console.log("finished", this._imageDataCollection);
                        resolve();
                        return [2 /*return*/];
                }
            });
        }); });
    };
    GIFExporter3.prototype.stop = function () {
        console.log('​GIFExporter3 -> stop -> ');
        clearInterval(this._intervalRef);
    };
    GIFExporter3.prototype.download = function () {
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
    GIFExporter3.prototype.getBlobs = function () {
        var _this = this;
        console.log('​GIFExporter3 -> privategetBlobs -> ');
        return new Promise(function (resolve, reject) {
            _this._intervalRef = setInterval(function () {
                _this.engineBlobToURL();
            }, _this._delay);
            setTimeout(function () {
                _this.stop();
                resolve();
            }, _this._duration);
        });
    };
    GIFExporter3.prototype.engineBlobToURL = function () {
        var _this = this;
        this._blobCount++;
        this.ToBlob(this._canvas, function (blob) {
            console.log('getting blob ', _this._blobCount);
            _this._blobURLs.push(URL.createObjectURL(blob));
        });
    };
    GIFExporter3.prototype.setupCanvas = function () {
        console.log('​GIFExporter3 -> privatesetupCanvas -> ');
        var canvas2 = document.createElement('canvas');
        canvas2.setAttribute('width', this._width.toString());
        canvas2.setAttribute('height', this._height.toString());
        var ctx = canvas2.getContext('2d');
        return ctx;
    };
    GIFExporter3.prototype.setupImgs = function () {
        var _this = this;
        console.log('​GIFExporter3 -> privatesetupImgs -> ');
        return new Promise(function (resolve, reject) {
            console.log("Creating images");
            var imgs = [];
            var count = _this._blobCount;
            _this._blobURLs.forEach(function (url) {
                console.log("working on image", url);
                var img = new Image();
                img.width = 200;
                img.height = 200;
                img.onload = function () { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, this.collectImageDataOnLoad(img)];
                            case 1:
                                _a.sent();
                                // imgs.push(img);
                                console.log('count', count);
                                if (--count === 1)
                                    resolve();
                                return [2 /*return*/];
                        }
                    });
                }); };
                img.src = url;
            });
        });
    };
    GIFExporter3.prototype.collectImageData = function (imgs, ctx) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var imgDataCollection = [];
            var count = imgs.length;
            imgs.forEach(function (img) {
                ctx.drawImage(img, 0, 0, _this._width, _this._height);
                imgDataCollection.push(ctx.getImageData(0, 0, _this._width, _this._height).data);
                console.log("image data collection", imgDataCollection);
                ctx.clearRect(0, 0, _this._width, _this._height);
                if (--count === 0)
                    resolve(imgDataCollection);
            });
        });
    };
    GIFExporter3.prototype.collectImageDataOnLoad = function (img) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            console.log('collecting data');
            var gl = _this._canvas.getContext('webgl2') || _this._canvas.getContext('webgl');
            console.log(gl);
            var pixels = new Uint8Array(gl.drawingBufferWidth * gl.drawingBufferHeight * 4);
            gl.readPixels(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
            console.log(pixels);
            // console.log(`collecting data on `, img);
            // this._ctx.drawImage(img, 0, 0, this._width, this._height);
            // this._imageDataCollection.push(
            // 	this._ctx.getImageData(0, 0, this._width, this._height)
            // );
            resolve();
        });
    };
    GIFExporter3.prototype.getSnapShotDataFromCanvas = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this._intervalRef = setInterval(function () {
                // console.log('getting data from canvas');
                var gl = _this._canvas.getContext('webgl2') ||
                    _this._canvas.getContext('webgl');
                // console.log(gl);
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
    GIFExporter3.prototype.processFrames = function (imageDataCollection) {
        var _this = this;
        console.log('​GIFExporter3 -> privateprocessFrames -> ');
        new Promise(function (resolve, reject) {
            var count = imageDataCollection.length;
            imageDataCollection.forEach(function (imgData) { return __awaiter(_this, void 0, void 0, function () {
                var rgbData, indexedData;
                return __generator(this, function (_a) {
                    rgbData = this.removeAlpha(imgData);
                    indexedData = this.mapPixelIndex(rgbData);
                    this._gifGenerator.generateFrame(indexedData);
                    if (--count === 0)
                        resolve();
                    return [2 /*return*/];
                });
            }); });
        });
    };
    GIFExporter3.prototype.removeAlpha = function (colorArray) {
        var RGBPixelData = [];
        for (var i = 0; i < colorArray.length; i += 4) {
            var pixel = this.pad(this.snapColor(colorArray[i])) +
                this.pad(this.snapColor(colorArray[i + 1])) +
                this.pad(this.snapColor(colorArray[i + 2]));
            RGBPixelData.push(pixel);
        }
        return RGBPixelData;
    };
    GIFExporter3.prototype.pad = function (color) {
        if (color < 16) {
            return "0" + color.toString(16);
        }
        else {
            return color.toString(16);
        }
    };
    GIFExporter3.prototype.snapColor = function (color) {
        if (color % 51 > Math.floor(51 / 2)) {
            color += 51 - (color % 51);
        }
        else {
            color -= color % 51;
        }
        return color;
    };
    GIFExporter3.prototype.mapPixelIndex = function (rgbData) {
        var _this = this;
        var indexedPixels = [];
        rgbData.forEach(function (pixel) {
            indexedPixels.push(_this._colorLookUpTable[pixel]);
        });
        return indexedPixels;
    };
    GIFExporter3.prototype.ToBlob = function (canvas, successCallback, mimeType) {
        // We need HTMLCanvasElement.toBlob for HD screenshots
        if (mimeType === void 0) { mimeType = 'image/png'; }
        if (!canvas.toBlob) {
            //  low performance polyfill based on toDataURL (https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob)
            canvas.toBlob = function (callback, type, quality) {
                var _this = this;
                setTimeout(function () {
                    var binStr = atob(_this.toDataURL(type, quality).split(',')[1]), len = binStr.length, arr = new Uint8Array(len);
                    for (var i = 0; i < len; i++) {
                        arr[i] = binStr.charCodeAt(i);
                    }
                    callback(new Blob([arr]));
                });
            };
        }
        canvas.toBlob(function (blob) {
            successCallback(blob);
        }, mimeType);
    };
    return GIFExporter3;
}());
/* (function() {
    gl = window.renderCanvas.getContext('webgl2')
    console.log(gl)
    const pixels = new Uint8Array(gl.drawingBufferWidth * gl.drawingBufferHeight *4);
    console.log(pixels)
    gl.readPixels(0,0,gl.drawingBufferWidth, gl.drawingBufferHeight, gl.RGBA, gl.UNSIGNED_BYTE, pixels)
    console.log(pixels)
})(); */
// (function() {
// 	const gl = window.renderCanvas.getContext('webgl2');
// 	const pixels = new Uint8Array(
// 		gl.drawingBufferWidth * gl.drawingBufferHeight * 4
// 	);
// 	console.log(pixels);
// })();
//# sourceMappingURL=GIFExporter3.js.map