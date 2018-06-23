var GIFExporter = /** @class */ (function () {
    /* TODO: Add Options for delay, maxTime, ect. +
        constructor(canvas:BABYLONEngine [, options...])*/
    function GIFExporter(engine, options) {
        var _this = this;
        this._blobURLs = [];
        this._RGBPixelData = [];
        this._indexedPixels = [];
        this._colorLookup = {};
        this._delay = 50;
        this._duration = 5000;
        this._isCapturing = false;
        this._hasNextBlob = true;
        this._canvas = engine.getRenderingCanvas();
        this._delay = options.delay || 50;
        this._duration = options.duration || 5000;
        this._CTGenerator = options.CTGenerator || new ColorTableGenerator();
        this._CTGenerator.generate().then(function (GCT) {
            _this._GCT = GCT._colorTable;
            _this._colorLookup = GCT._colorLookup;
            _this._gifGenerator = new GIFGenerator(_this._canvas.width, _this._canvas.height, _this._GCT);
            _this._gifGenerator.init();
        });
    }
    GIFExporter.prototype.start = function () {
        var _this = this;
        this._isCapturing = true;
        var blobNumber = 0;
        /* Capture blobs at this._delay intervals and place them in an array */
        return new Promise(function (resolve, reject) {
            _this._recIntervalID = setInterval(function () {
                if (HTMLCanvasElement.prototype.toBlob) {
                    _this._canvas.toBlob(function (results) {
                        console.log(URL.createObjectURL(results));
                        // console.log(
                        // 	'​this._recIntervalID -> ',
                        // 	`pushing:${URL.createObjectURL(
                        // 		results
                        // 	)} to blobNumber: ${blobNumber}`
                        // );
                        // this._blobURLs.push(
                        // 	new iBlobURL(blobNumber, URL.createObjectURL(results))
                        // );
                        // blobNumber++;
                    });
                }
                else {
                    console.log(_this._canvas.toDataURL());
                }
            }, _this._delay);
            /* Stop capturing blobs and start processing them. */
            setTimeout(function () {
                console.log('​start -> ', 'attempting to stop');
                _this.stop().then(function () {
                    _this._isCapturing = false;
                    console.log('​stop -> ', 'has completed inside');
                    console.log(_this._blobURLs);
                    resolve();
                });
            }, _this._duration);
        });
    };
    GIFExporter.prototype.stop = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (_this._isCapturing) {
                clearInterval(_this._recIntervalID);
                _this.processBlobsInOrder().then(function () {
                    _this.getStitchedBlob().then(function () {
                        resolve();
                    });
                });
                console.log('​stop -> ', 'has completed outside');
            }
            else {
                reject('Capturing has already complete.');
            }
        });
    };
    /* Should capture URL of each image created by the GIFGenerator as image/png to display to the user.
        This will allow the ability to select what images make up the animated GIF before stitching it together.*/
    GIFExporter.prototype.onStitching = function () { };
    /* run start and instead of giving the user a Blob object it will take that Blob
      and download it to the users device. */
    GIFExporter.prototype.download = function () {
        var _this = this;
        this.start().then(function (GIFURL) {
            // console.log(GIFURL);
            _this._gifGenerator.download('insideDownload.gif');
        });
    };
    GIFExporter.prototype.processBlobs = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var newCTXData;
            var canvas2 = document.createElement('canvas');
            canvas2.setAttribute('width', canvas.width.toString());
            canvas2.setAttribute('height', canvas.height.toString());
            var ctx = canvas2.getContext('2d');
            _this._blobURLs.forEach(function (blob) {
                var img = new Image();
                console.log('​privateprocessBlobs -> url', blob._id);
                img.onload = function () {
                    console.log(img.src);
                    ctx.drawImage(img, 0, 0, canvas2.width, canvas2.height);
                    // read new canvas data
                    newCTXData = ctx.getImageData(0, 0, canvas2.width, canvas2.height)
                        .data;
                    _this.removeAlpha(newCTXData);
                    _this.mapPixelIndex();
                    _this._gifGenerator.generateFrame(_this._indexedPixels);
                    _this.reset();
                    if (img.src === _this._blobURLs[_this._blobURLs.length - 1]) {
                        console.log('​img.onload -> ', 'inner completed');
                        resolve();
                    }
                };
                img.src = blob._url;
            });
        });
    };
    GIFExporter.prototype.processBlobsInOrder = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var canvas2 = document.createElement('canvas');
            canvas2.setAttribute('width', canvas.width.toString());
            canvas2.setAttribute('height', canvas.height.toString());
            var ctx = canvas2.getContext('2d');
            _this.process(ctx).then(function (_) {
                resolve();
            });
        });
    };
    GIFExporter.prototype.process = function (ctx) {
        var _this = this;
        var newCTXData;
        return new Promise(function (resolve, reject) {
            var blobURL = _this._blobURLs.shift();
            if (!blobURL) {
                console.log('​img.onload -> ', 'inner completed');
                resolve();
                return;
            }
            var img = new Image();
            console.log('​privateprocessBlobs -> url', blobURL._url);
            img.onload = function () {
                "";
                console.log(img.src);
                ctx.drawImage(img, 0, 0, _this._canvas.width, _this._canvas.height);
                // read new canvas data
                newCTXData = ctx.getImageData(0, 0, _this._canvas.width, _this._canvas.height).data;
                _this.removeAlpha(newCTXData);
                _this.mapPixelIndex();
                _this._gifGenerator.generateFrame(_this._indexedPixels).then(function (_) {
                    _this.reset();
                    _this.process();
                });
            };
            img.src = blobURL._url;
        });
    };
    GIFExporter.prototype.getStitchedBlob = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            console.log(_this._blobURLs);
            resolve();
        });
    };
    GIFExporter.prototype.removeAlpha = function (colorArray) {
        this._RGBPixelData.length = 0;
        for (var i = 0; i < colorArray.length; i += 4) {
            var pixel = this.pad(this.snapColor(colorArray[i])) +
                this.pad(this.snapColor(colorArray[i + 1])) +
                this.pad(this.snapColor(colorArray[i + 2]));
            this._RGBPixelData.push(pixel);
        }
    };
    GIFExporter.prototype.pad = function (color) {
        if (color < 16) {
            return "0" + color.toString(16);
        }
        else {
            return color.toString(16);
        }
    };
    GIFExporter.prototype.mapPixelIndex = function () {
        var _this = this;
        this._RGBPixelData.forEach(function (pixel) {
            _this._indexedPixels.push(_this._colorLookup[pixel]);
        });
    };
    GIFExporter.prototype.reset = function () {
        this._RGBPixelData.length = 0;
        this._indexedPixels.length = 0;
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
    return GIFExporter;
}());
//# sourceMappingURL=GIFExporter.js.map