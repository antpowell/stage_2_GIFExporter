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
///<reference path = '../JS/LZWEncoder.js'/>
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
},{"./EncodedImage":9}],21:[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = NeuQuant;
/* NeuQuant Neural-Net Quantization Algorithm
 * ------------------------------------------
 *
 * Copyright (c) 1994 Anthony Dekker
 *
 * NEUQUANT Neural-Net quantization algorithm by Anthony Dekker, 1994.
 * See "Kohonen neural networks for optimal colour quantization"
 * in "Network: Computation in Neural Systems" Vol. 5 (1994) pp 351-367.
 * for a discussion of the algorithm.
 * See also  http://members.ozemail.com.au/~dekker/NEUQUANT.HTML
 *
 * Any party obtaining a copy of these files from the author, directly or
 * indirectly, is granted, free of charge, a full and unrestricted irrevocable,
 * world-wide, paid up, royalty-free, nonexclusive right and license to deal
 * in this software and documentation files (the "Software"), including without
 * limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons who receive
 * copies from any such party to do so, with the only requirement being
 * that this copyright notice remain intact.
 *
 * (JavaScript port 2012 by Johan Nordberg)
 */

function toInt(v) {
  return ~~v;
}

var ncycles = 100; // number of learning cycles
var netsize = 256; // number of colors used
var maxnetpos = netsize - 1;

// defs for freq and bias
var netbiasshift = 4; // bias for colour values
var intbiasshift = 16; // bias for fractions
var intbias = 1 << intbiasshift;
var gammashift = 10;
var gamma = 1 << gammashift;
var betashift = 10;
var beta = intbias >> betashift; /* beta = 1/1024 */
var betagamma = intbias << gammashift - betashift;

// defs for decreasing radius factor
var initrad = netsize >> 3; // for 256 cols, radius starts
var radiusbiasshift = 6; // at 32.0 biased by 6 bits
var radiusbias = 1 << radiusbiasshift;
var initradius = initrad * radiusbias; //and decreases by a
var radiusdec = 30; // factor of 1/30 each cycle

// defs for decreasing alpha factor
var alphabiasshift = 10; // alpha starts at 1.0
var initalpha = 1 << alphabiasshift;
var alphadec; // biased by 10 bits

/* radbias and alpharadbias used for radpower calculation */
var radbiasshift = 8;
var radbias = 1 << radbiasshift;
var alpharadbshift = alphabiasshift + radbiasshift;
var alpharadbias = 1 << alpharadbshift;

// four primes near 500 - assume no image has a length so large that it is
// divisible by all four primes
var prime1 = 499;
var prime2 = 491;
var prime3 = 487;
var prime4 = 503;
var minpicturebytes = 3 * prime4;

/*
  Constructor: NeuQuant

  Arguments:

  pixels - array of pixels in RGB format
  samplefac - sampling factor 1 to 30 where lower is better quality

  >
  > pixels = [r, g, b, r, g, b, r, g, b, ..]
  >
*/
function NeuQuant(pixels, samplefac) {
  var network; // int[netsize][4]
  var netindex; // for network lookup - really 256

  // bias and freq arrays for learning
  var bias;
  var freq;
  var radpower;

  /*
    Private Method: init
      sets up arrays
  */
  function init() {
    network = [];
    netindex = [];
    bias = [];
    freq = [];
    radpower = [];

    var i, v;
    for (i = 0; i < netsize; i++) {
      v = (i << netbiasshift + 8) / netsize;
      network[i] = [v, v, v];
      freq[i] = intbias / netsize;
      bias[i] = 0;
    }
  }

  /*
    Private Method: unbiasnet
      unbiases network to give byte values 0..255 and record position i to prepare for sort
  */
  function unbiasnet() {
    for (var i = 0; i < netsize; i++) {
      network[i][0] >>= netbiasshift;
      network[i][1] >>= netbiasshift;
      network[i][2] >>= netbiasshift;
      network[i][3] = i; // record color number
    }
  }

  /*
    Private Method: altersingle
      moves neuron *i* towards biased (b,g,r) by factor *alpha*
  */
  function altersingle(alpha, i, b, g, r) {
    network[i][0] -= alpha * (network[i][0] - b) / initalpha;
    network[i][1] -= alpha * (network[i][1] - g) / initalpha;
    network[i][2] -= alpha * (network[i][2] - r) / initalpha;
  }

  /*
    Private Method: alterneigh
      moves neurons in *radius* around index *i* towards biased (b,g,r) by factor *alpha*
  */
  function alterneigh(radius, i, b, g, r) {
    var lo = Math.abs(i - radius);
    var hi = Math.min(i + radius, netsize);

    var j = i + 1;
    var k = i - 1;
    var m = 1;

    var p, a;
    while (j < hi || k > lo) {
      a = radpower[m++];

      if (j < hi) {
        p = network[j++];
        p[0] -= a * (p[0] - b) / alpharadbias;
        p[1] -= a * (p[1] - g) / alpharadbias;
        p[2] -= a * (p[2] - r) / alpharadbias;
      }

      if (k > lo) {
        p = network[k--];
        p[0] -= a * (p[0] - b) / alpharadbias;
        p[1] -= a * (p[1] - g) / alpharadbias;
        p[2] -= a * (p[2] - r) / alpharadbias;
      }
    }
  }

  /*
    Private Method: contest
      searches for biased BGR values
  */
  function contest(b, g, r) {
    /*
      finds closest neuron (min dist) and updates freq
      finds best neuron (min dist-bias) and returns position
      for frequently chosen neurons, freq[i] is high and bias[i] is negative
      bias[i] = gamma * ((1 / netsize) - freq[i])
    */

    var bestd = ~(1 << 31);
    var bestbiasd = bestd;
    var bestpos = -1;
    var bestbiaspos = bestpos;

    var i, n, dist, biasdist, betafreq;
    for (i = 0; i < netsize; i++) {
      n = network[i];

      dist = Math.abs(n[0] - b) + Math.abs(n[1] - g) + Math.abs(n[2] - r);
      if (dist < bestd) {
        bestd = dist;
        bestpos = i;
      }

      biasdist = dist - (bias[i] >> intbiasshift - netbiasshift);
      if (biasdist < bestbiasd) {
        bestbiasd = biasdist;
        bestbiaspos = i;
      }

      betafreq = freq[i] >> betashift;
      freq[i] -= betafreq;
      bias[i] += betafreq << gammashift;
    }

    freq[bestpos] += beta;
    bias[bestpos] -= betagamma;

    return bestbiaspos;
  }

  /*
    Private Method: inxbuild
      sorts network and builds netindex[0..255]
  */
  function inxbuild() {
    var i,
        j,
        p,
        q,
        smallpos,
        smallval,
        previouscol = 0,
        startpos = 0;
    for (i = 0; i < netsize; i++) {
      p = network[i];
      smallpos = i;
      smallval = p[1]; // index on g
      // find smallest in i..netsize-1
      for (j = i + 1; j < netsize; j++) {
        q = network[j];
        if (q[1] < smallval) {
          // index on g
          smallpos = j;
          smallval = q[1]; // index on g
        }
      }
      q = network[smallpos];
      // swap p (i) and q (smallpos) entries
      if (i != smallpos) {
        j = q[0];
        q[0] = p[0];
        p[0] = j;
        j = q[1];
        q[1] = p[1];
        p[1] = j;
        j = q[2];
        q[2] = p[2];
        p[2] = j;
        j = q[3];
        q[3] = p[3];
        p[3] = j;
      }
      // smallval entry is now in position i

      if (smallval != previouscol) {
        netindex[previouscol] = startpos + i >> 1;
        for (j = previouscol + 1; j < smallval; j++) {
          netindex[j] = i;
        }previouscol = smallval;
        startpos = i;
      }
    }
    netindex[previouscol] = startpos + maxnetpos >> 1;
    for (j = previouscol + 1; j < 256; j++) {
      netindex[j] = maxnetpos;
    } // really 256
  }

  /*
    Private Method: inxsearch
      searches for BGR values 0..255 and returns a color index
  */
  function inxsearch(b, g, r) {
    var a, p, dist;

    var bestd = 1000; // biggest possible dist is 256*3
    var best = -1;

    var i = netindex[g]; // index on g
    var j = i - 1; // start at netindex[g] and work outwards

    while (i < netsize || j >= 0) {
      if (i < netsize) {
        p = network[i];
        dist = p[1] - g; // inx key
        if (dist >= bestd) i = netsize; // stop iter
        else {
            i++;
            if (dist < 0) dist = -dist;
            a = p[0] - b;
            if (a < 0) a = -a;
            dist += a;
            if (dist < bestd) {
              a = p[2] - r;
              if (a < 0) a = -a;
              dist += a;
              if (dist < bestd) {
                bestd = dist;
                best = p[3];
              }
            }
          }
      }
      if (j >= 0) {
        p = network[j];
        dist = g - p[1]; // inx key - reverse dif
        if (dist >= bestd) j = -1; // stop iter
        else {
            j--;
            if (dist < 0) dist = -dist;
            a = p[0] - b;
            if (a < 0) a = -a;
            dist += a;
            if (dist < bestd) {
              a = p[2] - r;
              if (a < 0) a = -a;
              dist += a;
              if (dist < bestd) {
                bestd = dist;
                best = p[3];
              }
            }
          }
      }
    }

    return best;
  }

  /*
    Private Method: learn
      "Main Learning Loop"
  */
  function learn() {
    var i;

    var lengthcount = pixels.length;
    var alphadec = toInt(30 + (samplefac - 1) / 3);
    var samplepixels = toInt(lengthcount / (3 * samplefac));
    var delta = toInt(samplepixels / ncycles);
    var alpha = initalpha;
    var radius = initradius;

    var rad = radius >> radiusbiasshift;

    if (rad <= 1) rad = 0;
    for (i = 0; i < rad; i++) {
      radpower[i] = toInt(alpha * ((rad * rad - i * i) * radbias / (rad * rad)));
    }var step;
    if (lengthcount < minpicturebytes) {
      samplefac = 1;
      step = 3;
    } else if (lengthcount % prime1 !== 0) {
      step = 3 * prime1;
    } else if (lengthcount % prime2 !== 0) {
      step = 3 * prime2;
    } else if (lengthcount % prime3 !== 0) {
      step = 3 * prime3;
    } else {
      step = 3 * prime4;
    }

    var b, g, r, j;
    var pix = 0; // current pixel

    i = 0;
    while (i < samplepixels) {
      b = (pixels[pix] & 0xff) << netbiasshift;
      g = (pixels[pix + 1] & 0xff) << netbiasshift;
      r = (pixels[pix + 2] & 0xff) << netbiasshift;

      j = contest(b, g, r);

      altersingle(alpha, j, b, g, r);
      if (rad !== 0) alterneigh(rad, j, b, g, r); // alter neighbours

      pix += step;
      if (pix >= lengthcount) pix -= lengthcount;

      i++;

      if (delta === 0) delta = 1;
      if (i % delta === 0) {
        alpha -= alpha / alphadec;
        radius -= radius / radiusdec;
        rad = radius >> radiusbiasshift;

        if (rad <= 1) rad = 0;
        for (j = 0; j < rad; j++) {
          radpower[j] = toInt(alpha * ((rad * rad - j * j) * radbias / (rad * rad)));
        }
      }
    }
  }

  /*
    Method: buildColormap
      1. initializes network
    2. trains it
    3. removes misconceptions
    4. builds colorindex
  */
  function buildColormap() {
    init();
    learn();
    unbiasnet();
    inxbuild();
  }
  this.buildColormap = buildColormap;

  /*
    Method: getColormap
      builds colormap from the index
      returns array in the format:
      >
    > [r, g, b, r, g, b, r, g, b, ..]
    >
  */
  function getColormap() {
    var map = [];
    var index = [];

    for (var i = 0; i < netsize; i++) {
      index[network[i][3]] = i;
    }var k = 0;
    for (var l = 0; l < netsize; l++) {
      var j = index[l];
      map[k++] = network[j][0];
      map[k++] = network[j][1];
      map[k++] = network[j][2];
    }
    return map;
  }
  this.getColormap = getColormap;

  /*
    Method: lookupRGB
      looks for the closest *r*, *g*, *b* color in the map and
    returns its index
  */
  this.lookupRGB = inxsearch;
}

// export default NeuQuant;
},{}],44:[function(require,module,exports) {
"use strict";

var __importDefault = this && this.__importDefault || function (mod) {
    return mod && mod.__esModule ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var NeuQuant_1 = __importDefault(require("./js/NeuQuant"));
var ColorTableGenerator = /** @class */function () {
    function ColorTableGenerator(frame) {
        this._colorTable = [];
        this._GCT = [];
        this._distribution = 51;
        this._colorLookup = {};
        this._neuQuant = new NeuQuant_1.default(frame, 10);
        this._neuQuant.buildColormap();
        this._colorTable = this._neuQuant.getColormap();
        console.log(this._colorTable);
    }
    // generate() {
    // 	let count = 0;
    // 	for (let red: number = 0; red < 256; red += this._distribution) {
    // 		for (let green: number = 0; green < 256; green += this._distribution) {
    // 			for (let blue: number = 0; blue < 256; blue += this._distribution) {
    // 				const pixel = this.pad(red) + this.pad(green) + this.pad(blue);
    // 				this._colorTable.push(pixel);
    // 				this._colorLookup[pixel] = count;
    // 				count++;
    // 			}
    // 		}
    // 	}
    // 	return {
    // 		_colorLookup: this._colorLookup,
    // 		_colorTable: this._colorTable
    // 	};
    // }
    ColorTableGenerator.prototype.generate = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var pixel = '';
            var count = 0;
            _this._colorTable.forEach(function (value, index, array) {
                pixel += _this.pad(value);
                if ((index + 1) % 3 === 0) {
                    _this._GCT.push(pixel);
                    _this._colorLookup[pixel] = count;
                    count++;
                    pixel = '';
                }
                if (index === _this._colorTable.length - 1) resolve({
                    _colorLookup: _this._colorLookup,
                    _colorTable: _this._GCT
                });
            });
        });
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
},{"./js/NeuQuant":21}],12:[function(require,module,exports) {
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
        this._engine = engine;
        this._canvas = engine.getRenderingCanvas();
        this._delay = options.delay;
        this._duration = options.duration;
        this._width = engine.getRenderWidth();
        this._height = engine.getRenderHeight();
    }
    GIFExporter.prototype.start = function () {
        var _this = this;
        this.colorSetup();
        console.log('​GIFExporter3 -> start -> ');
        return new Promise(function (resolve, reject) {
            return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            return [4 /*yield*/, this.getSnapShotDataFromCanvas()];
                        case 1:
                            _a.sent();
                            // console.log(this._GCT);
                            this._gifGenerator = new GIFGenerator_1.GIFGenerator(this._width, this._height, this._GCT);
                            this._gifGenerator.init();
                            console.log('setupImg complete');
                            return [4 /*yield*/, this.processFrames(this._imageDataCollection)];
                        case 2:
                            _a.sent();
                            // console.log(`finished`, this._imageDataCollection);
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
        var RGBNumerical = [];
        for (var i = 0; i < colorArray.length; i += 4) {
            var pixel = this.pad(this.snapColor(colorArray[i])) + this.pad(this.snapColor(colorArray[i + 1])) + this.pad(this.snapColor(colorArray[i + 2]));
            RGBPixelData.push(pixel);
            RGBNumerical.push(colorArray[i]);
            RGBNumerical.push(colorArray[i + 1]);
            RGBNumerical.push(colorArray[i + 2]);
        }
        return RGBNumerical;
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
    GIFExporter.prototype.getColorFrame = function () {
        return __awaiter(this, void 0, void 0, function () {
            var gl, pixels, img, RBGData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        gl = this._canvas.getContext('webgl2') || this._canvas.getContext('webgl');
                        pixels = new Uint8Array(gl.drawingBufferWidth * gl.drawingBufferHeight * 4);
                        gl.readPixels(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
                        return [4 /*yield*/, this.flipFrame(pixels)];
                    case 1:
                        img = _a.sent();
                        RBGData = this.removeAlpha(img);
                        // console.log(RBGData);
                        return [2 /*return*/, RBGData];
                }
            });
        });
    };
    GIFExporter.prototype.colorSetup = function () {
        return __awaiter(this, void 0, void 0, function () {
            var RGBFrame, colorGenerator;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        return [4 /*yield*/, this.getColorFrame()];
                    case 1:
                        RGBFrame = _a.sent();
                        return [4 /*yield*/, new ColorTableGenerator_1.ColorTableGenerator(RGBFrame).generate()];
                    case 2:
                        colorGenerator = _a.sent();
                        console.log("colorGenerator", colorGenerator);
                        this._colorLookUpTable = colorGenerator._colorLookup;
                        this._GCT = colorGenerator._colorTable;
                        this._gifGenerator = new GIFGenerator_1.GIFGenerator(this._width, this._height, this._GCT);
                        // console.log(this._GCT);
                        this._gifGenerator.init();
                        return [2 /*return*/];
                }
            });
        });
    };
    return GIFExporter;
}();
exports.GIFExporter = GIFExporter;
},{"./GIFGenerator":11,"./ColorTableGenerator":44}],24:[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var GIFExporter_1 = require("./GIFExporter");
var Game = /** @class */function () {
    function Game(canvasElement) {
        this._canvas = document.getElementById(canvasElement);
        this._engine = new BABYLON.Engine(this._canvas, true, {
            preserveDrawingBuffer: true
        });
        this._gifExporter = new GIFExporter_1.GIFExporter(this._engine, {
            delay: 60,
            duration: 2000
        });
    }
    Game.prototype.createScene = function () {
        // Create a basic BJS Scene object.
        this._scene = new BABYLON.Scene(this._engine);
        // Create a FreeCamera, and set its position to (x:0, y:5, z:-10).
        this._camera = new BABYLON.FreeCamera('camera1', new BABYLON.Vector3(0, 5, -10), this._scene);
        // Target the camera to scene origin.
        this._camera.setTarget(BABYLON.Vector3.Zero());
        // Attach the camera to the canvas.
        this._camera.attachControl(this._canvas, false);
        // Create a basic light, aiming 0,1,0 - meaning, to the sky.
        this._light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0, 1, 0), this._scene);
        // Create a built-in "sphere" shape; with 16 segments and diameter of 2.
        var sphere = BABYLON.MeshBuilder.CreateSphere('sphere', {
            segments: 16,
            diameter: 2
        }, this._scene);
        // Move the sphere upward 1/2 of its height.
        sphere.position.y = 1;
        // Create a built-in "ground" shape.
        var ground = BABYLON.MeshBuilder.CreateGround('ground', {
            width: 6,
            height: 6,
            subdivisions: 2
        }, this._scene);
    };
    Game.prototype.doRender = function () {
        var _this = this;
        // Run the render loop.
        this._engine.runRenderLoop(function () {
            _this._scene.render();
        });
        // The canvas/window resize event handler.
        window.addEventListener('resize', function () {
            _this._engine.resize();
        });
    };
    Game.prototype.downloadGIF = function () {
        this._gifExporter.download();
    };
    Game.prototype.stopGIF = function () {
        this._gifExporter.start();
    };
    return Game;
}();
exports.Game = Game;
window.addEventListener('DOMContentLoaded', function () {
    var recordBtn = document.getElementById('recordBtn');
    var stopBtn = document.getElementById('recStopBtn');
    // Setup GIF generator
    // Create the game using the 'renderCanvas'.
    var game = new Game('renderCanvas');
    // Create the scene.
    game.createScene();
    // Start render loop.
    game.doRender();
    recordBtn.addEventListener('click', function () {
        game.downloadGIF();
    });
    stopBtn.addEventListener('click', function () {
        game.stopGIF();
    });
});
},{"./GIFExporter":12}],9:[function(require,module,exports) {
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
  var ws = new WebSocket(protocol + '://' + hostname + ':' + '63538' + '/');
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
},{}]},{},[9,24], null)
//# sourceMappingURL=/game.bb8bdadb.map