var GIFExporter = /** @class */ (function () {
    /* TODO: Add Options for delay, maxTime, ect. +
        constructor(canvas:BABYLONEngine [, options...])*/
    function GIFExporter(engine, options) {
        var _this = this;
        this._blobURLs = [];
        this._blobCount = 0;
        this._RGBPixelData = [];
        this._indexedPixels = [];
        this._colorLookup = {};
        this._delay = 50;
        this._duration = 5000;
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
        var blobNumber = 0;
        /* Capture blobs at this._delay intervals and place them in an array */
        return new Promise(function (resolve, reject) {
            /**
             * TODO: find a better way of adjusting snapshot interval.
             */
            _this._recIntervalID = setInterval(function () {
                _this.ToBlob(_this._canvas, function (blob) {
                    console.log(blob);
                    _this._blobURLs.push(new iBlobURL(blobNumber, URL.createObjectURL(blob)));
                });
                /* if (HTMLCanvasElement.prototype.toBlob) {
                    this._canvas.toBlob(results => {
                        this._blobURLs.push(
                            new iBlobURL(blobNumber, URL.createObjectURL(results))
                        );
                        blobNumber++;
                    });
                } else {
                    // console.log(this._canvas.toDataURL());
                } */
            }, _this._delay);
            /* Stop capturing blobs and start processing them. */
            setTimeout(function () {
                console.log('​start -> ', 'attempting to stop');
                _this.stop().then(function () {
                    console.log('​stop -> ', 'has completed inside');
                    console.log(_this._blobURLs);
                    resolve();
                });
            }, _this._duration);
        });
    };
    GIFExporter.prototype.stop = function () {
        alert("processing GIF");
        clearInterval(this._recIntervalID);
        // return new Promise((resolve, reject) => {
        // 	clearInterval(this._recIntervalID);
        // 	this.processBlobs().then(() => {
        // 		this.getStitchedBlob().then(() => {
        // 			resolve();
        // 		});
        // 	});
        // 	console.log('​stop -> ', 'has completed outside');
        // 	reject('Capturing has already complete.');
        // });
    };
    /* Should capture URL of each image created by the GIFGenerator as image/png to display to the user.
        This will allow the ability to select what images make up the animated GIF before stitching it together.*/
    GIFExporter.prototype.onStitching = function () { };
    /* run start and instead of giving the user a Blob object it will take that Blob
      and download it to the users device. */
    GIFExporter.prototype.download = function () {
        var _this = this;
        this.getBlobs(this._canvas).then(function () {
            console.log('​GIFExporter -> download -> ', "blob[] filled with " + _this._blobURLs);
            _this.setupCanvas().then(function (canvas) {
                // this.getImageData(canvas);
            });
        });
        this._blobURLs.forEach(function (blob) {
            _this.getImages(blob);
        });
    };
    GIFExporter.prototype.processBlobs = function () {
        var canvasPromises = this._blobURLs.map(this.getImages);
        Promise.all(canvasPromises).then(function (data) { return console.log(data); });
    };
    GIFExporter.prototype.processBlobsInOrder = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var canvas2 = document.createElement('canvas');
            canvas2.setAttribute('width', _this._canvas.width.toString());
            canvas2.setAttribute('height', _this._canvas.height.toString());
            var ctx = canvas2.getContext('2d');
            _this.process(ctx).then(function (_) {
                resolve();
            });
        });
    };
    GIFExporter.prototype.process = function (ctx) {
        var _this = this;
        console.log('​GIFExporter -> privateprocess -> ');
        var newCTXData;
        var allIndexedImages = [];
        return new Promise(function (resolve, reject) {
            var blobURL = _this._blobURLs.shift();
            if (!blobURL) {
                console.log('​img.onload -> ', 'inner completed');
                resolve();
                _this._gifGenerator.download('insideDownload.gif');
                return;
            }
            var img = new Image();
            console.log('​privateprocessBlobs -> url', blobURL._url);
            img.onload = function () {
                console.log(img.src);
                ctx.drawImage(img, 0, 0, _this._canvas.width, _this._canvas.height);
                // read new canvas data
                newCTXData = ctx.getImageData(0, 0, _this._canvas.width, _this._canvas.height).data;
                _this.removeAlpha(newCTXData);
                _this.mapPixelIndex();
                allIndexedImages.push(_this._indexedPixels);
                _this._gifGenerator.generateFrame(_this._indexedPixels).then(function (_) {
                    _this.reset();
                    _this.process(ctx);
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
    GIFExporter.prototype.getImages = function (blob) {
        var url = blob._url;
        return new Promise(function (resolve, reject) {
            var image = new Image();
            image.onload = function () {
                resolve(image);
            };
            image.onerror = function () {
                reject(url + " did not load as an image correctly");
            };
            image.src = url;
        });
    };
    /**
     * ToBlob Edge fix from Babylon.js
     * @param canvas
     * @param successCallback
     * @param mimeType
     */
    GIFExporter.prototype.ToBlob = function (canvas, successCallback, mimeType) {
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
    GIFExporter.prototype.getBlobs = function (canvas) {
        var _this = this;
        /* Get Blob */
        /* create URL for each blob in Blob[] */
        /* return Blob[] */
        return new Promise(function (resolve, reject) {
            console.log('​GIFExporter -> privategetBlobs -> ', "start");
            /**
             * // TODO: find a better way of adjusting snapshot interval.
             */
            _this._recIntervalID = setInterval(function () {
                _this._blobCount++;
                console.log('​GIFExporter -> this._recIntervalID -> ', "iteration " + _this._blobCount);
                console.log(_this._recIntervalID);
                _this.ToBlob(canvas, function (blob) {
                    _this._blobURLs.push(new iBlobURL(_this._blobCount, URL.createObjectURL(blob)));
                });
            }, _this._delay);
            setTimeout(function () {
                _this.stop();
                resolve();
            }, _this._duration);
        });
    };
    GIFExporter.prototype.setupCanvas = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var canvas2 = document.createElement('canvas');
            canvas2.setAttribute('width', _this._canvas.width.toString());
            canvas2.setAttribute('height', _this._canvas.height.toString());
            var ctx = canvas2.getContext('2d');
            resolve(ctx);
        });
    };
    return GIFExporter;
}());
//# sourceMappingURL=GIFExporter.js.map