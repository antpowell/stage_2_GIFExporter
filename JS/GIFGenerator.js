/// <reference path="JS/LZWEncoder.js"/>
var GIFGenerator = /** @class */ (function () {
    function GIFGenerator(width, height, GCT) {
        this.stream = new EncodedImage();
        this.byteCount = 0;
        this.encodedImage = new EncodedImage();
        this.frameCount = 0;
        this.width = width;
        this.height = height;
        this.GCT = GCT;
        console.log("Generator now running...");
    }
    GIFGenerator.prototype.init = function () {
        this.headerGenerator();
        this.LSDGenerator();
        this.GCTWriter();
        this.AppExtGenerator();
    };
    GIFGenerator.prototype.generateFrame = function (indexedPixels, frameCount) {
        this.frameIndexedPixels = indexedPixels;
        this.frameCount += 1;
        console.log("generating frame " + this.frameCount);
        this.GCEGenerator();
        this.imgDescGenerator();
        this.imgDataGenerator();
    };
    GIFGenerator.prototype.download = function (filename) {
        this.TrailerGenerator();
        console.log('downloading');
        console.log(this.stream);
        var download = document.createElement('a');
        download.download = filename;
        download.href = URL.createObjectURL(new Blob([new Uint8Array(this.stream.get())], {
            type: 'image/gif',
        }));
        download.click();
    };
    GIFGenerator.prototype.headerGenerator = function () {
        this.stream.writeUTF('GIF89a'); /* GIF Header */
    };
    GIFGenerator.prototype.LSDGenerator = function () {
        this.stream.writeLittleEndian(this.width); /* Canvas Width */
        this.stream.writeLittleEndian(this.height); /* Canvas Height */
        this.stream.write(0xf7); /* Packed Field */
        this.stream.write(0); /* Background Color Index */
        this.stream.write(0); /* Pixel Aspect Ration */
    };
    GIFGenerator.prototype.GCEGenerator = function () {
        this.stream.write(0x21); /* Extension Introducer */
        this.stream.write(0xf9); /* Graphic Control Label */
        this.stream.write(0x4); /* Byte Size */
        this.stream.write(0x4); /* Packed Field */
        this.stream.writeLittleEndian(0x32); /* Delay Time */
        this.stream.write(0x0); /* Transparent Color Index */
        this.stream.write(0x0); /* Block Terminator */
    };
    GIFGenerator.prototype.imgDescGenerator = function () {
        this.stream.write(0x2c); /* Image Seperator Always 2C */
        this.stream.writeLittleEndian(0x0); /* Image Left */
        this.stream.writeLittleEndian(0x0); /* Image Top */
        this.stream.writeLittleEndian(this.width); /* Image Width */
        this.stream.writeLittleEndian(this.height); /* Image Height */
        this.stream.write(0x0); /* Block Terminator */
    };
    GIFGenerator.prototype.AppExtGenerator = function () {
        this.stream.write(0x21); /* extension introducer */
        this.stream.write(0xff); /* app extension label */
        this.stream.write(11); /* block size */
        this.stream.writeUTF('NETSCAPE' + '2.0'); /* app id + auth code */
        this.stream.write(3); /* sub-block size */
        this.stream.write(1); /* loop sub-block id */
        this.stream.writeLittleEndian(0); /* loop count (extra iterations, 0=repeat forever) */
        this.stream.write(0); /* Block Terminator */
    };
    GIFGenerator.prototype.TrailerGenerator = function () {
        this.stream.write(0x3b); /* Trailer Marker */
        console.log("Generator now finished.");
    };
    GIFGenerator.prototype.GCTWriter = function () {
        var _this = this;
        var count = 0;
        this.GCT.forEach(function (color) {
            count += 3;
            _this.stream.writeColor(color);
        });
        for (var i = count; i < 3 * 256; i++) {
            this.stream.write(0);
        }
    };
    GIFGenerator.prototype.imgDataGenerator = function () {
        var encoder = new LZWEncoder(this.width, this.height, this.frameIndexedPixels, 8);
        encoder.encode(this.stream);
        console.log("completed frame " + this.frameCount);
    };
    GIFGenerator.prototype.LCTGenerator = function () { };
    GIFGenerator.prototype.PlainTextExtGenerator = function () { };
    GIFGenerator.prototype.CommentExtGenerator = function () { };
    GIFGenerator.prototype.writeLittleEndian = function (num) {
        this.stream.write(num & 0xff);
        this.stream.write((num >> 8) & 0xff);
    };
    return GIFGenerator;
}());
//# sourceMappingURL=GIFGenerator.js.map