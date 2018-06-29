var GIFExporter2 = /** @class */ (function () {
    function GIFExporter2(engine, options) {
        this._blobURLs = [];
        this._blobCount = 0;
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
    GIFExporter2.prototype.start = function () {
        var _this = this;
        console.log('​GIFExporter2 -> start -> ');
        return new Promise(function (resolve, reject) {
            var writingContext = _this.setupCanvas();
            _this.getBlobs()
                .then(_this.setupImgs)
                .then(function (imgs) {
                return _this.collectImageData(imgs, writingContext);
            })
                .then(_this.processFrames)
                .then(function () {
                console.log("finished");
            });
        });
    };
    GIFExporter2.prototype.stop = function () {
        console.log('​GIFExporter2 -> stop -> ');
        clearInterval(this._intervalRef);
    };
    GIFExporter2.prototype.download = function () {
        console.log('​GIFExporter2 -> download -> ');
        this.start();
    };
    GIFExporter2.prototype.getBlobs = function () {
        var _this = this;
        console.log('​GIFExporter2 -> privategetBlobs -> ');
        return new Promise(function (resolve, reject) {
            _this._intervalRef = setInterval(_this.engineBlobToURL, _this._delay);
            setTimeout(function () {
                stop();
                resolve();
            }, _this._duration);
        });
    };
    GIFExporter2.prototype.engineBlobToURL = function () {
        var _this = this;
        console.log('​GIFExporter2 -> privateengineBlobToURL -> ');
        this._blobCount++;
        this.ToBlob(this._canvas, function (blob) {
            _this._blobURLs.push(URL.createObjectURL(blob));
            console.log('​GIFExporter2 -> privateengineBlobToURL -> this._blobURLs', _this._blobURLs);
        });
    };
    GIFExporter2.prototype.setupCanvas = function () {
        console.log('​GIFExporter2 -> privatesetupCanvas -> ');
        var canvas2 = document.createElement('canvas');
        canvas2.setAttribute('width', this._width.toString());
        canvas2.setAttribute('height', this._height.toString());
        var ctx = canvas2.getContext('2d');
        return ctx;
    };
    GIFExporter2.prototype.setupImgs = function () {
        var _this = this;
        console.log('​GIFExporter2 -> privatesetupImgs -> ');
        return new Promise(function (resolve, reject) {
            var imgs = [];
            var count = _this._blobCount;
            _this._blobURLs.forEach(function (url) {
                var img = new Image();
                img.src = url;
                img.onload = function () {
                    imgs.push(img);
                    if (--count === 0)
                        resolve(imgs);
                };
            });
        });
    };
    GIFExporter2.prototype.collectImageData = function (imgs, ctx) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var imgDataCollection = [];
            var count = imgs.length;
            imgs.forEach(function (img) {
                ctx.drawImage(img, 0, 0, _this._width, _this._height);
                imgDataCollection.push(ctx.getImageData(0, 0, _this._width, _this._height));
                if (--count === 0)
                    resolve(imgDataCollection);
            });
        });
    };
    GIFExporter2.prototype.processFrames = function (imageDataCollection) {
        var _this = this;
        console.log('​GIFExporter2 -> privateprocessFrames -> ');
        new Promise(function (resolve, reject) {
            var count = imageDataCollection.length;
            imageDataCollection.forEach(function (imgData) {
                var rgbData = _this.removeAlpha(imgData.data);
                var indexedData = _this.mapPixelIndex(rgbData);
                _this._gifGenerator.generateFrame(indexedData);
                if (--count === 0)
                    resolve();
            });
        });
    };
    GIFExporter2.prototype.removeAlpha = function (colorArray) {
        console.log('​GIFExporter2 -> privateremoveAlpha -> ');
        var RGBPixelData = [];
        for (var i = 0; i < colorArray.length; i += 4) {
            var pixel = this.pad(this.snapColor(colorArray[i])) +
                this.pad(this.snapColor(colorArray[i + 1])) +
                this.pad(this.snapColor(colorArray[i + 2]));
            RGBPixelData.push(pixel);
        }
        return RGBPixelData;
    };
    GIFExporter2.prototype.pad = function (color) {
        console.log('​GIFExporter2 -> privatepad -> ');
        if (color < 16) {
            return "0" + color.toString(16);
        }
        else {
            return color.toString(16);
        }
    };
    GIFExporter2.prototype.snapColor = function (color) {
        console.log('​GIFExporter2 -> privatesnapColor -> ');
        if (color % 51 > Math.floor(51 / 2)) {
            color += 51 - (color % 51);
        }
        else {
            color -= color % 51;
        }
        return color;
    };
    GIFExporter2.prototype.mapPixelIndex = function (rgbData) {
        var _this = this;
        console.log('​GIFExporter2 -> privatemapPixelIndex -> ');
        var indexedPixels = [];
        rgbData.forEach(function (pixel) {
            indexedPixels.push(_this._colorLookUpTable[pixel]);
        });
        return indexedPixels;
    };
    GIFExporter2.prototype.ToBlob = function (canvas, successCallback, mimeType) {
        if (mimeType === void 0) { mimeType = 'image/png'; }
        console.log('​GIFExporter2 -> ToBlob ');
        // We need HTMLCanvasElement.toBlob for HD screenshots
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
    return GIFExporter2;
}());
//# sourceMappingURL=GIFExporter2.js.map