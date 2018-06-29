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
var GIFGenerator = /** @class */ (function () {
    function GIFGenerator(width, height, GCT) {
        this._stream = new EncodedImage();
        this.encodedImage = new EncodedImage();
        this._frameCount = 0;
        this._width = width;
        this._height = height;
        this._GCT = GCT;
        console.log("Generator now running...");
    }
    GIFGenerator.prototype.init = function () {
        this.headerGenerator();
        this.LSDGenerator();
        this.GCTWriter();
        this.AppExtGenerator();
    };
    GIFGenerator.prototype.generateFrame = function (indexedPixels) {
        var _this = this;
        return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this._frameIndexedPixels = indexedPixels;
                        this._frameCount += 1;
                        this.GCEGenerator();
                        this.imgDescGenerator();
                        console.log("generating frame " + this._frameCount);
                        return [4 /*yield*/, this.imgDataGenerator()];
                    case 1:
                        _a.sent();
                        resolve();
                        return [2 /*return*/];
                }
            });
        }); });
    };
    GIFGenerator.prototype.download = function (filename) {
        this.TrailerGenerator();
        console.log('downloading');
        console.log(this._stream);
        var download = document.createElement('a');
        download.download = filename;
        download.href = URL.createObjectURL(new Blob([new Uint8Array(this._stream.get())], {
            type: 'image/gif',
        }));
        download.click();
    };
    GIFGenerator.prototype.getAnimatedGIFBlob = function () {
        // return this._stream.get();
        return new Blob([new Uint8Array(this._stream.get())], {
            type: 'image/gif',
        });
    };
    GIFGenerator.prototype.headerGenerator = function () {
        this._stream.writeUTF('GIF89a'); /* GIF Header */
    };
    GIFGenerator.prototype.LSDGenerator = function () {
        this._stream.writeLittleEndian(this._width); /* Canvas Width */
        this._stream.writeLittleEndian(this._height); /* Canvas Height */
        this._stream.write(0xf7); /* Packed Field */
        this._stream.write(0); /* Background Color Index */
        this._stream.write(0); /* Pixel Aspect Ration */
    };
    GIFGenerator.prototype.GCEGenerator = function () {
        this._stream.write(0x21); /* Extension Introducer */
        this._stream.write(0xf9); /* Graphic Control Label */
        this._stream.write(0x4); /* Byte Size */
        this._stream.write(0x4); /* Packed Field */
        this._stream.writeLittleEndian(0x32); /* Delay Time */
        this._stream.write(0x0); /* Transparent Color Index */
        this._stream.write(0x0); /* Block Terminator */
    };
    GIFGenerator.prototype.imgDescGenerator = function () {
        this._stream.write(0x2c); /* Image Seperator Always 2C */
        this._stream.writeLittleEndian(0x0); /* Image Left */
        this._stream.writeLittleEndian(0x0); /* Image Top */
        this._stream.writeLittleEndian(this._width); /* Image Width */
        this._stream.writeLittleEndian(this._height); /* Image Height */
        this._stream.write(0x0); /* Block Terminator */
    };
    GIFGenerator.prototype.AppExtGenerator = function () {
        this._stream.write(0x21); /* extension introducer */
        this._stream.write(0xff); /* app extension label */
        this._stream.write(11); /* block size */
        this._stream.writeUTF('NETSCAPE' + '2.0'); /* app id + auth code */
        this._stream.write(3); /* sub-block size */
        this._stream.write(1); /* loop sub-block id */
        this._stream.writeLittleEndian(0); /* loop count (extra iterations, 0=repeat forever) */
        this._stream.write(0); /* Block Terminator */
    };
    GIFGenerator.prototype.TrailerGenerator = function () {
        this._stream.write(0x3b); /* Trailer Marker */
        console.log("Generator now finished.");
    };
    GIFGenerator.prototype.GCTWriter = function () {
        var _this = this;
        var count = 0;
        this._GCT.forEach(function (color) {
            count += 3;
            _this._stream.writeColor(color);
        });
        for (var i = count; i < 3 * 256; i++) {
            this._stream.write(0);
        }
    };
    GIFGenerator.prototype.imgDataGenerator = function () {
        var _this = this;
        return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var encoder;
            return __generator(this, function (_a) {
                encoder = new LZWEncoder(this._width, this._height, this._frameIndexedPixels, 8);
                encoder.encode(this._stream);
                console.log("completed frame " + this._frameCount);
                resolve();
                return [2 /*return*/];
            });
        }); });
    };
    GIFGenerator.prototype.LCTGenerator = function () { };
    GIFGenerator.prototype.PlainTextExtGenerator = function () { };
    GIFGenerator.prototype.CommentExtGenerator = function () { };
    return GIFGenerator;
}());
//# sourceMappingURL=GIFGenerator2.js.map