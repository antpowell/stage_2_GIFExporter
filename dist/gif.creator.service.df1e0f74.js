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
})({27:[function(require,module,exports) {
"use strict";
/* ----------------------------------------------NeuQuant START---------------------------------------------------------- */
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
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
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
                if (dist >= bestd) i = netsize;
                // stop iter
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
                if (dist >= bestd) j = -1;
                // stop iter
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
exports.default = NeuQuant;
/* ----------------------------------------------NeuQuant END---------------------------------------------------------- */
/* ----------------------------------------------ColorTableGen START---------------------------------------------------------- */
var ColorTableGenerator = /** @class */function () {
    function ColorTableGenerator(frame) {
        this._colorTable = [];
        this._GCT = [];
        this._distribution = 51;
        this._colorLookup = {};
        this._neuQuant = new NeuQuant(frame, 20);
        this._neuQuant.buildColormap();
        this._colorTable = this._neuQuant.getColormap();
    }
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
                if (index === _this._colorTable.length - 1) resolve([_this._colorLookup, _this._GCT]);
            });
        });
    };
    ColorTableGenerator.prototype.lookupRGB = function (pixel) {
        var R = parseInt(pixel.substr(0, 2), 16);
        var G = parseInt(pixel.substr(2, 2), 16);
        var B = parseInt(pixel.substr(4, 2), 16);
        var pixelIndex = this._neuQuant.lookupRGB(R, G, B);
        return pixelIndex;
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
/* ----------------------------------------------ColorTableGen END---------------------------------------------------------- */
/* ----------------------------------------------EncodedImage START---------------------------------------------------------- */
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
    EncodedImage.prototype.reset = function () {
        this.data = [];
    };
    return EncodedImage;
}();
exports.EncodedImage = EncodedImage;
/* ----------------------------------------------EncodedImage END---------------------------------------------------------- */
/* ----------------------------------------------TypedLZW START---------------------------------------------------------- */
/**
 * This class handles LZW encoding
 * Adapted from Jef Poskanzer's Java port by way of J. M. G. Elliott.
 * @author Kevin Weiner (original Java version - kweiner@fmsware.com)
 * @author Thibault Imbert (AS3 version - bytearray.org)
 * @author Kevin Kwok (JavaScript version - https://github.com/antimatter15/jsgif)
 * @author Anthony Powell (TypeScript version)
 * @version 0.1 AS3 implementation
 */
var LZWEncoder = /** @class */function () {
    function LZWEncoder(width, height, pixels, colorDepth) {
        this.EOF = 1;
        // GIFCOMPR.C - GIF Image compression routines
        // Lempel-Ziv compression based on 'compress'. GIF modifications by
        // David Rowley (mgardi@watdcsu.waterloo.edu)
        // General DEFINEs
        this.BITS = 12;
        this.HSIZE = 5003;
        this._maxbits = this.BITS; // user settable max # bits/code
        this._maxmaxcode = 1 << this.BITS; // should NEVER generate this code
        this._htab = [];
        this._codetab = [];
        this._hsize = this.HSIZE; // for dynamic table sizing
        this._free_ent = 0; // first unused entry
        // block compression parameters -- after all codes are used up,
        // and compression rate changes, start over.
        this._clear_flg = false;
        // output
        // Output the given code.
        // Inputs:
        // code: A n_bits-bit integer. If == -1, then EOF. This assumes
        // that n_bits =< wordsize - 1.
        // Outputs:
        // Outputs code to the file.
        // Assumptions:
        // Chars are 8 bits long.
        // Algorithm:
        // Maintain a BITS character long buffer (so that 8 codes will
        // fit in it exactly). Use the VAX insv instruction to insert each
        // code in turn. When the buffer fills up empty it and start over.
        this._cur_accum = 0;
        this._cur_bits = 0;
        this._masks = [0x0000, 0x0001, 0x0003, 0x0007, 0x000f, 0x001f, 0x003f, 0x007f, 0x00ff, 0x01ff, 0x03ff, 0x07ff, 0x0fff, 0x1fff, 0x3fff, 0x7fff, 0xffff];
        // Define the storage for the packet accumulator
        this._accum = [];
        this._imgW = width;
        this._imgH = height;
        this._pixels = pixels;
        this._initCodeSize = Math.max(2, colorDepth);
    }
    // Add a character to the end of the current packet, and if it is 254
    // characters, flush the packet to disk.
    LZWEncoder.prototype.writeCharToPacket = function (c, outs) {
        this._accum[this._a_count++] = c;
        if (this._a_count >= 254) this.flush_char(outs);
    };
    // Clear out the hash table
    // table clear for block compress
    LZWEncoder.prototype.cl_block = function (outs) {
        this.cl_hash(this._hsize);
        this._free_ent = this._ClearCode + 2;
        this._clear_flg = true;
        this.output(this._ClearCode, outs);
    };
    // reset code table
    LZWEncoder.prototype.cl_hash = function (hsize) {
        for (var i = 0; i < hsize; ++i) {
            this._htab[i] = -1;
        }
    };
    LZWEncoder.prototype.compress = function (init_bits, outs) {
        var fcode;
        var i; /* = 0 */
        var c;
        var ent;
        var disp;
        var hsize_reg;
        var hshift;
        // Set up the globals: g_init_bits - initial number of bits
        this._g_init_bits = init_bits;
        // Set up the necessary values
        this._clear_flg = false;
        this._n_bits = this._g_init_bits;
        this._maxcode = this.MAXCODE(this._n_bits);
        this._ClearCode = 1 << init_bits - 1;
        this._EOFCode = this._ClearCode + 1;
        this._free_ent = this._ClearCode + 2;
        this._a_count = 0; // clear packet
        ent = this.nextPixel();
        hshift = 0;
        for (fcode = this._hsize; fcode < 65536; fcode *= 2) {
            ++hshift;
        }hshift = 8 - hshift; // set hash code range bound
        hsize_reg = this._hsize;
        this.cl_hash(hsize_reg); // clear hash table
        this.output(this._ClearCode, outs);
        outer_loop: while ((c = this.nextPixel()) != this.EOF) {
            fcode = (c << this._maxbits) + ent;
            i = c << hshift ^ ent; // xor hashing
            if (this._htab[i] == fcode) {
                ent = this._codetab[i];
                continue;
            } else if (this._htab[i] >= 0) {
                // non-empty slot
                disp = hsize_reg - i; // secondary hash (after G. Knott)
                if (i === 0) disp = 1;
                do {
                    if ((i -= disp) < 0) i += hsize_reg;
                    if (this._htab[i] == fcode) {
                        ent = this._codetab[i];
                        continue outer_loop;
                    }
                } while (this._htab[i] >= 0);
            }
            this.output(ent, outs);
            ent = c;
            if (this._free_ent < this._maxmaxcode) {
                this._codetab[i] = this._free_ent++; // code -> hashtable
                this._htab[i] = fcode;
            } else this.cl_block(outs);
        }
        // Put out the final code.
        this.output(ent, outs);
        this.output(this._EOFCode, outs);
    };
    // ----------------------------------------------------------------------------
    LZWEncoder.prototype.encode = function (os) {
        os.write(this._initCodeSize); // write "initial code size" byte
        this._remaining = this._imgW * this._imgH; // reset navigation variables
        this._curPixel = 0;
        this.compress(this._initCodeSize + 1, os); // compress and write the pixel data
        os.write(0); // write block terminator
    };
    // Flush the packet to disk, and reset the accumulator
    LZWEncoder.prototype.flush_char = function (outs) {
        if (this._a_count > 0) {
            outs.write(this._a_count);
            outs.writeArray(this._accum, this._a_count);
            this._a_count = 0;
        }
    };
    LZWEncoder.prototype.MAXCODE = function (n_bits) {
        return (1 << n_bits) - 1;
    };
    // ----------------------------------------------------------------------------
    // Return the next pixel from the image
    // ----------------------------------------------------------------------------
    LZWEncoder.prototype.nextPixel = function () {
        if (this._remaining === 0) return this.EOF;
        --this._remaining;
        var pix = this._pixels[this._curPixel++];
        return pix & 0xff;
    };
    LZWEncoder.prototype.output = function (code, outs) {
        this._cur_accum &= this._masks[this._cur_bits];
        if (this._cur_bits > 0) this._cur_accum |= code << this._cur_bits;else this._cur_accum = code;
        this._cur_bits += this._n_bits;
        while (this._cur_bits >= 8) {
            this.writeCharToPacket(this._cur_accum & 0xff, outs);
            this._cur_accum >>= 8;
            this._cur_bits -= 8;
        }
        // If the next entry is going to be too big for the code size,
        // then increase it, if possible.
        if (this._free_ent > this._maxcode || this._clear_flg) {
            if (this._clear_flg) {
                this._maxcode = this.MAXCODE(this._n_bits = this._g_init_bits);
                this._clear_flg = false;
            } else {
                ++this._n_bits;
                if (this._n_bits == this._maxbits) this._maxcode = this._maxmaxcode;else this._maxcode = this.MAXCODE(this._n_bits);
            }
        }
        if (code == this._EOFCode) {
            // At EOF, write the rest of the buffer.
            while (this._cur_bits > 0) {
                this.writeCharToPacket(this._cur_accum & 0xff, outs);
                this._cur_accum >>= 8;
                this._cur_bits -= 8;
            }
            this.flush_char(outs);
        }
    };
    return LZWEncoder;
}();
exports.LZWEncoder = LZWEncoder;
/* ----------------------------------------------TypedLZW END---------------------------------------------------------- */
/* ----------------------------------------------GIFGen START---------------------------------------------------------- */
var GIFGenerator = /** @class */function () {
    function GIFGenerator() {
        this.stream = new EncodedImage();
        this.frameCount = 0;
        console.log("Generator now running...");
    }
    GIFGenerator.prototype.init = function (width, height, GCT) {
        this.reset();
        this.width = width;
        this.height = height;
        this.GCT = GCT;
        this.writeHeader();
        this.writeLogicalScreenDescriptor();
        this.writeGlobalColorTable();
        this.writeApplicationExtension();
    };
    GIFGenerator.prototype.generateFrame = function (indexedPixels) {
        this.frameIndexedPixels = indexedPixels;
        this.frameCount += 1;
        console.log("generating frame " + this.frameCount);
        this.writeGraphicControlExtension();
        this.writeImageDescriptor();
        this.writeImageData();
    };
    GIFGenerator.prototype.getStream = function () {
        this.writeTrailer();
        return this.stream.get();
    };
    GIFGenerator.prototype.writeHeader = function () {
        this.stream.writeUTF('GIF89a'); /* GIF Header */
    };
    GIFGenerator.prototype.writeLogicalScreenDescriptor = function () {
        this.stream.writeLittleEndian(this.width); /* Canvas Width */
        this.stream.writeLittleEndian(this.height); /* Canvas Height */
        this.stream.write(0xf7); /* Packed Field */
        this.stream.write(0); /* Background Color Index */
        this.stream.write(0); /* Pixel Aspect Ration */
    };
    GIFGenerator.prototype.writeGraphicControlExtension = function () {
        this.stream.write(0x21); /* Extension Introducer */
        this.stream.write(0xf9); /* Graphic Control Label */
        this.stream.write(0x4); /* Byte Size */
        this.stream.write(0x4); /* Packed Field */
        this.stream.writeLittleEndian(0x9); /* Delay Time */
        this.stream.write(0x0); /* Transparent Color Index */
        this.stream.write(0x0); /* Block Terminator */
    };
    GIFGenerator.prototype.writeImageDescriptor = function () {
        this.stream.write(0x2c); /* Image Seperator Always 2C */
        this.stream.writeLittleEndian(0x0); /* Image Left */
        this.stream.writeLittleEndian(0x0); /* Image Top */
        this.stream.writeLittleEndian(this.width); /* Image Width */
        this.stream.writeLittleEndian(this.height); /* Image Height */
        this.stream.write(0x0); /* Block Terminator */
    };
    GIFGenerator.prototype.writeApplicationExtension = function () {
        this.stream.write(0x21); /* extension introducer */
        this.stream.write(0xff); /* app extension label */
        this.stream.write(11); /* block size */
        this.stream.writeUTF('NETSCAPE' + '2.0'); /* app id + auth code */
        this.stream.write(3); /* sub-block size */
        this.stream.write(1); /* loop sub-block id */
        this.stream.writeLittleEndian(0); /* loop count (extra iterations, 0=repeat forever) */
        this.stream.write(0); /* Block Terminator */
    };
    GIFGenerator.prototype.writeTrailer = function () {
        this.stream.write(0x3b); /* Trailer Marker */
        console.log("Generator now finished.");
        this.frameCount = 0; /* Reset frame count for next GIF */
    };
    GIFGenerator.prototype.writeGlobalColorTable = function () {
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
    GIFGenerator.prototype.writeImageData = function () {
        return __awaiter(this, void 0, Promise, function () {
            var encoder;
            return __generator(this, function (_a) {
                encoder = new LZWEncoder(this.width, this.height, this.frameIndexedPixels, 8);
                encoder.encode(this.stream);
                console.log("completed frame " + this.frameCount);
                return [2 /*return*/];
            });
        });
    };
    GIFGenerator.prototype.writeLocalColorTable = function () {};
    GIFGenerator.prototype.writePlainTextExtension = function () {};
    GIFGenerator.prototype.writeCommentExtension = function () {};
    GIFGenerator.prototype.reset = function () {
        this.stream.reset();
        this.frameCount = 0;
    };
    return GIFGenerator;
}();
exports.GIFGenerator = GIFGenerator;
/* ----------------------------------------------GIFGen END---------------------------------------------------------- */
var ctx = self;
var _colorTableGen;
addEventListener('message', function (ev) {
    console.log(ev.data);
});
var gifGenerator = new GIFGenerator();
onmessage = function onmessage(_a) {
    var _b = _a.data,
        job = _b.job,
        params = _b.params;
    return __awaiter(_this, void 0, void 0, function () {
        var frames, width, height, colorLookup, _c, numericalRGBFrames, stringRGBFrames, gifData;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (!(job === 'createGIF')) return [3 /*break*/, 3];
                    frames = params.frames, width = params.width, height = params.height;
                    return [4 /*yield*/, createColorTable(frames[0], width, height)];
                case 1:
                    colorLookup = _d.sent();
                    return [4 /*yield*/, processFrames(frames, width, height)];
                case 2:
                    _c = _d.sent(), numericalRGBFrames = _c.numericalRGBFrames, stringRGBFrames = _c.stringRGBFrames;
                    gifData = generateGIF(stringRGBFrames, colorLookup);
                    ctx.postMessage(gifData);
                    _d.label = 3;
                case 3:
                    return [2 /*return*/];
            }
        });
    });
};
function createColorTable(frame, width, height) {
    var _this = this;
    return new Promise(function (resolve, rejct) {
        return __awaiter(_this, void 0, void 0, function () {
            function writeColorTable(globalColorTable, width, height) {
                var _this = this;
                return new Promise(function (resolve, reject) {
                    return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            gifGenerator.init(width, height, globalColorTable);
                            resolve();
                            return [2 /*return*/];
                        });
                    });
                });
            }
            var _a, colorLookup, colorTable;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _colorTableGen = new ColorTableGenerator(frame);
                        return [4 /*yield*/, _colorTableGen.generate()];
                    case 1:
                        _a = _b.sent(), colorLookup = _a[0], colorTable = _a[1];
                        return [4 /*yield*/, writeColorTable(colorTable, width, height)];
                    case 2:
                        _b.sent();
                        resolve(colorLookup);
                        return [2 /*return*/];
                }
            });
        });
    });
}
function processFrames(frames, width, height) {
    var _this = this;
    return new Promise(function (resolve, reject) {
        return __awaiter(_this, void 0, void 0, function () {
            function flipFrames() {
                return new Promise(function (resolve, rejcet) {
                    var numericalRGBFrames = [];
                    var stringRGBFrames = [];
                    frames.forEach(function (frame) {
                        var mid = height / 2 | 0;
                        var rowLen = width * 4;
                        var flipRow = new Uint8Array(rowLen);
                        for (var rowNum = 0; rowNum < mid; ++rowNum) {
                            var topPointer = rowNum * rowLen;
                            var bottomPointer = (height - rowNum - 1) * rowLen;
                            flipRow.set(frame.subarray(topPointer, topPointer + rowLen));
                            frame.copyWithin(topPointer, bottomPointer, bottomPointer + rowLen);
                            frame.set(flipRow, bottomPointer);
                        }
                        var _a = toRGB(frame),
                            numericalRGBData = _a.numericalRGBData,
                            stringRGBData = _a.stringRGBData;
                        numericalRGBFrames.push(numericalRGBData);
                        stringRGBFrames.push(stringRGBData);
                    });
                    resolve({ numericalRGBFrames: numericalRGBFrames, stringRGBFrames: stringRGBFrames });
                });
            }
            function toRGB(frame) {
                var numericalRGBData = frame.filter(function (pixel, index) {
                    return (index + 1) % 4 !== 0;
                });
                var stringRGBData = [];
                var pixel = '';
                numericalRGBData.forEach(function (color, index) {
                    pixel += pad(color);
                    if ((index + 1) % 3 === 0) {
                        stringRGBData.push(pixel);
                        pixel = '';
                    }
                });
                return { numericalRGBData: numericalRGBData, stringRGBData: stringRGBData };
            }
            function pad(color) {
                if (color < 16) {
                    return "0" + color.toString(16);
                } else {
                    return color.toString(16);
                }
            }
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = resolve;
                        return [4 /*yield*/, flipFrames()];
                    case 1:
                        _a.apply(void 0, [_b.sent()]);
                        return [2 /*return*/];
                }
            });
        });
    });
}
function generateGIF(frames, colorLookup) {
    var _this = this;
    return new Promise(function (resolve, reject) {
        return __awaiter(_this, void 0, void 0, function () {
            function mapPixelsToIndex(frames, colorLookup) {
                var _this = this;
                return new Promise(function (resolve, reject) {
                    return __awaiter(_this, void 0, void 0, function () {
                        var indexedFrames;
                        return __generator(this, function (_a) {
                            indexedFrames = [];
                            frames.forEach(function (frame) {
                                var indexedPixels = [];
                                frame.forEach(function (pixel) {
                                    if (colorLookup[pixel]) {
                                        indexedPixels.push(colorLookup[pixel]);
                                    } else {
                                        indexedPixels.push(_colorTableGen.lookupRGB(pixel));
                                    }
                                });
                                indexedFrames.push(indexedPixels);
                            });
                            resolve(indexedFrames);
                            return [2 /*return*/];
                        });
                    });
                });
            }
            var indexedFrames;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        return [4 /*yield*/, mapPixelsToIndex(frames, colorLookup)];
                    case 1:
                        indexedFrames = _a.sent();
                        indexedFrames.forEach(function (frame) {
                            gifGenerator.generateFrame(frame);
                        });
                        resolve(gifGenerator.getStream());
                        return [2 /*return*/];
                }
            });
        });
    });
}
},{}],12:[function(require,module,exports) {
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
  var ws = new WebSocket(protocol + '://' + hostname + ':' + '52731' + '/');
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
},{}]},{},[12,27], null)
//# sourceMappingURL=/gif.creator.service.df1e0f74.map