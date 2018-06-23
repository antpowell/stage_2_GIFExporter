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
        return new Promise(function (resolve, reject) {
            _this._frameIndexedPixels = indexedPixels;
            _this._frameCount += 1;
            console.log("generating frame " + _this._frameCount);
            _this.GCEGenerator();
            _this.imgDescGenerator();
            _this.imgDataGenerator().then(function (_) { return resolve(); });
        });
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
        return new Promise(function (resolve, reject) {
            var encoder = new LZWEncoder(_this._width, _this._height, _this._frameIndexedPixels, 8);
            encoder.encode(_this._stream).then(function () {
                console.log("completed frame " + _this._frameCount);
                resolve();
            });
        });
    };
    GIFGenerator.prototype.LCTGenerator = function () { };
    GIFGenerator.prototype.PlainTextExtGenerator = function () { };
    GIFGenerator.prototype.CommentExtGenerator = function () { };
    return GIFGenerator;
}());
//# sourceMappingURL=GIFGenerator.js.map