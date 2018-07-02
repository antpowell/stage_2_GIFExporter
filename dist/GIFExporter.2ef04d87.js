// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

// eslint-disable-next-line no-global-assign
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  return newRequire;
})({9:[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var EncodedImage = /** @class */function () {
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
        this.write(num >> 8 & 0xff);
    };
    return EncodedImage;
}();
exports.EncodedImage = EncodedImage;
},{}],11:[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var EncodedImage_1 = require("./EncodedImage");
///<reference path = 'JS/LZWEncoder.js'/>
var GIFGenerator = /** @class */function () {
    function GIFGenerator(width, height, GCT) {
        this.stream = new EncodedImage_1.EncodedImage();
        this.byteCount = 0;
        this.encodedImage = new EncodedImage_1.EncodedImage();
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
            type: 'image/gif'
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
    GIFGenerator.prototype.LCTGenerator = function () {};
    GIFGenerator.prototype.PlainTextExtGenerator = function () {};
    GIFGenerator.prototype.CommentExtGenerator = function () {};
    GIFGenerator.prototype.writeLittleEndian = function (num) {
        this.stream.write(num & 0xff);
        this.stream.write(num >> 8 & 0xff);
    };
    return GIFGenerator;
}();
exports.GIFGenerator = GIFGenerator;
},{"./EncodedImage":9}],44:[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var ColorTableGenerator = /** @class */function () {
    function ColorTableGenerator() {
        this._colorTable = [];
        this._distribution = 51;
        this._colorLookup = {};
    }
    ColorTableGenerator.prototype.generate = function () {
        var count = 0;
        for (var red = 0; red < 256; red += this._distribution) {
            for (var green = 0; green < 256; green += this._distribution) {
                for (var blue = 0; blue < 256; blue += this._distribution) {
                    var pixel = this.pad(red) + this.pad(green) + this.pad(blue);
                    this._colorTable.push(pixel);
                    this._colorLookup[pixel] = count;
                    count++;
                }
            }
        }
        return {
            _colorLookup: this._colorLookup,
            _colorTable: this._colorTable
        };
    };
    ColorTableGenerator.prototype.pad = function (color) {
        if (color < 16) {
            return "0" + color.toString(16);
        } else {
            return color.toString(16);
        }
    };
    return ColorTableGenerator;
}();
exports.ColorTableGenerator = ColorTableGenerator;
},{}],12:[function(require,module,exports) {
"use strict";

var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) {
            try {
                step(generator.next(value));
            } catch (e) {
                reject(e);
            }
        }
        function rejected(value) {
            try {
                step(generator["throw"](value));
            } catch (e) {
                reject(e);
            }
        }
        function step(result) {
            result.done ? resolve(result.value) : new P(function (resolve) {
                resolve(result.value);
            }).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = this && this.__generator || function (thisArg, body) {
    var _ = { label: 0, sent: function sent() {
            if (t[0] & 1) throw t[1];return t[1];
        }, trys: [], ops: [] },
        f,
        y,
        t,
        g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function () {
        return this;
    }), g;
    function verb(n) {
        return function (v) {
            return step([n, v]);
        };
    }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) {
            try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0:case 1:
                        t = op;break;
                    case 4:
                        _.label++;return { value: op[1], done: false };
                    case 5:
                        _.label++;y = op[1];op = [0];continue;
                    case 7:
                        op = _.ops.pop();_.trys.pop();continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                            _ = 0;continue;
                        }
                        if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                            _.label = op[1];break;
                        }
                        if (op[0] === 6 && _.label < t[1]) {
                            _.label = t[1];t = op;break;
                        }
                        if (t && _.label < t[2]) {
                            _.label = t[2];_.ops.push(op);break;
                        }
                        if (t[2]) _.ops.pop();
                        _.trys.pop();continue;
                }
                op = body.call(thisArg, _);
            } catch (e) {
                op = [6, e];y = 0;
            } finally {
                f = t = 0;
            }
        }if (op[0] & 5) throw op[1];return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var GIFGenerator_1 = require("./GIFGenerator");
var ColorTableGenerator_1 = require("./ColorTableGenerator");
var GIFExporter = /** @class */function () {
    function GIFExporter(engine, options) {
        this._imageDataCollection = [];
        var colorGenerator = new ColorTableGenerator_1.ColorTableGenerator().generate();
        this._engine = engine;
        this._canvas = engine.getRenderingCanvas();
        this._delay = options.delay;
        this._duration = options.duration;
        this._GCT = options.GCT || colorGenerator._colorTable;
        this._colorLookUpTable = colorGenerator._colorLookup;
        this._width = engine.getRenderWidth();
        this._height = engine.getRenderHeight();
        this._gifGenerator = new GIFGenerator_1.GIFGenerator(this._width, this._height, this._GCT);
        this._gifGenerator.init();
    }
    GIFExporter.prototype.start = function () {
        var _this = this;
        console.log('​GIFExporter3 -> start -> ');
        return new Promise(function (resolve, reject) {
            return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            return [4 /*yield*/, this.getSnapShotDataFromCanvas()];
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
            });
        });
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
        new Promise(function (resolve, reject) {
            return __awaiter(_this, void 0, void 0, function () {
                var count;
                var _this = this;
                return __generator(this, function (_a) {
                    count = imageDataCollection.length;
                    imageDataCollection.forEach(function (imgData) {
                        return __awaiter(_this, void 0, void 0, function () {
                            var rgbData, indexedData;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        return [4 /*yield*/, this.flipFrame(imgData)];
                                    case 1:
                                        imgData = _a.sent();
                                        rgbData = this.removeAlpha(imgData);
                                        indexedData = this.mapPixelIndex(rgbData);
                                        this._gifGenerator.generateFrame(indexedData);
                                        if (--count === 0) resolve();
                                        return [2 /*return*/];
                                }
                            });
                        });
                    });
                    return [2 /*return*/];
                });
            });
        });
    };
    GIFExporter.prototype.flipFrame = function (frame) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var split = _this._height / 2 | 0; /* | 0 faster version of Math.floor for positive numbers */
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
                if (rowIndex < split) resolve(frame);
            }
        });
    };
    GIFExporter.prototype.removeAlpha = function (colorArray) {
        var RGBPixelData = [];
        for (var i = 0; i < colorArray.length; i += 4) {
            var pixel = this.pad(this.snapColor(colorArray[i])) + this.pad(this.snapColor(colorArray[i + 1])) + this.pad(this.snapColor(colorArray[i + 2]));
            RGBPixelData.push(pixel);
        }
        return RGBPixelData;
    };
    GIFExporter.prototype.pad = function (color) {
        if (color < 16) {
            return "0" + color.toString(16);
        } else {
            return color.toString(16);
        }
    };
    GIFExporter.prototype.snapColor = function (color) {
        if (color % 51 > Math.floor(51 / 2)) {
            color += 51 - color % 51;
        } else {
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
}();
exports.GIFExporter = GIFExporter;
},{"./GIFGenerator":11,"./ColorTableGenerator":44}],8:[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';

var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };

  module.bundle.hotData = null;
}

module.bundle.Module = Module;

var parent = module.bundle.parent;
if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = '' || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + '53471' + '/');
  ws.onmessage = function (event) {
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      console.clear();

      data.assets.forEach(function (asset) {
        hmrApply(global.parcelRequire, asset);
      });

      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          hmrAccept(global.parcelRequire, asset.id);
        }
      });
    }

    if (data.type === 'reload') {
      ws.close();
      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');

      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);

      removeErrorOverlay();

      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);
  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID;

  // html encode message and stack trace
  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;

  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';

  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];
      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(+k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAccept(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAccept(bundle.parent, id);
  }

  var cached = bundle.cache[id];
  bundle.hotData = {};
  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);

  cached = bundle.cache[id];
  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAccept(global.parcelRequire, id);
  });
}
},{}]},{},[8,12], null)
//# sourceMappingURL=/GIFExporter.2ef04d87.map