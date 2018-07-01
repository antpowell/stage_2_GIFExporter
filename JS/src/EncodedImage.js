var EncodedImage = /** @class */ (function () {
    function EncodedImage() {
        this.data = [];
    }
    EncodedImage.prototype.get = function () {
        return this.data;
    };
    EncodedImage.prototype.write = function (byte) {
        this.data.push(byte);
    };
    EncodedImage.prototype.writeArray = function (array, arraySize) {
        for (var i = 0; i < arraySize; i++) {
            this.write(array[i]);
        }
    };
    EncodedImage.prototype.writeUTF = function (UTF) {
        for (var i = 0; i < UTF.length; i++) {
            this.write(UTF.charCodeAt(i));
        }
    };
    EncodedImage.prototype.writeColor = function (color) {
        for (var i = 0; i < color.length; i += 2) {
            var intValue = parseInt(color[i] + color[i + 1], 16);
            this.write(intValue);
        }
    };
    EncodedImage.prototype.writeLittleEndian = function (num) {
        this.write(num & 0xff);
        this.write((num >> 8) & 0xff);
    };
    return EncodedImage;
}());
//# sourceMappingURL=EncodedImage.js.map