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
})({63:[function(require,module,exports) {
"use strict";
/** NeuQuant Neural-Net Quantization Algorithm
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
 * @author Anthony Powell (TypeScript port 2018)
 */

Object.defineProperty(exports, "__esModule", { value: true });
var NeuQuant = /** @class */function () {
    /*
        Constructor: NeuQuant
      
        Arguments:
      
        pixels - array of pixels in RGB format
        samplefac - sampling factor 1 to 30 where lower is better quality
      
        >
        > pixels = [r, g, b, r, g, b, r, g, b, ..]
        >
    */
    function NeuQuant(pixels, sampleFactor) {
        this._ncycles = 100; // number of learning cycles
        this._netsize = 256; // number of colors used
        this._maxnetpos = this._netsize - 1;
        // defs for freq and bias
        this._netbiasshift = 4; // bias for colour values
        this._intbiasshift = 16; // bias for fractions
        this._intbias = 1 << this._intbiasshift;
        this._gammashift = 10;
        this._gamma = 1 << this._gammashift;
        this._betashift = 10;
        this._beta = this._intbias >> this._betashift; /* beta = 1/1024 */
        this._betagamma = this._intbias << this._gammashift - this._betashift;
        // defs for decreasing radius factor
        this._initrad = this._netsize >> 3; // for 256 cols, radius starts
        this._radiusbiasshift = 6; // at 32.0 biased by 6 bits
        this._radiusbias = 1 << this._radiusbiasshift;
        this._initradius = this._initrad * this._radiusbias; //and decreases by a
        this._radiusdec = 30; // factor of 1/30 each cycle
        // defs for decreasing alpha factor
        this._alphabiasshift = 10; // alpha starts at 1.0
        this._initalpha = 1 << this._alphabiasshift;
        /* radbias and alpharadbias used for radpower calculation */
        this._radbiasshift = 8;
        this._radbias = 1 << this._radbiasshift;
        this._alpharadbshift = this._alphabiasshift + this._radbiasshift;
        this._alpharadbias = 1 << this._alpharadbshift;
        // four primes near 500 - assume no image has a length so large that it is
        // divisible by all four primes
        this._prime1 = 499;
        this._prime2 = 491;
        this._prime3 = 487;
        this._prime4 = 503;
        this._minpicturebytes = 3 * this._prime4;
        this._network = [];
        this._netindex = [];
        this._bias = [];
        this._freq = [];
        this._radpower = [];
        this._pixels = [];
        this._pixels = pixels;
        this._sampleFactor = sampleFactor;
        this.buildColorMap();
    }
    NeuQuant.prototype.toInt = function (v) {
        return ~~v;
    };
    /**
     * Private Method: init
     * sets up arrays
     */
    NeuQuant.prototype.initColorMapSize = function () {
        var i, v;
        for (i = 0; i < this._netsize; i++) {
            v = (i << this._netbiasshift + 8) / this._netsize;
            this._network[i] = [v, v, v];
            this._freq[i] = this._intbias / this._netsize;
            this._bias[i] = 0;
        }
    };
    /**
     * Private Meothd: unbiasnet
     * unbiases network to give byte values 0...255 and record position
     * i to prepare for sort
     */
    NeuQuant.prototype.unbiasnet = function () {
        for (var index = 0; index < this._netsize; index++) {
            this._network[index][0] >>= this._netbiasshift;
            this._network[index][1] >>= this._netbiasshift;
            this._network[index][2] >>= this._netbiasshift;
            this._network[index][3] >>= index; /* index of color */
        }
    };
    /**
     * Private Method: altersingle
     * moves neuron *i* towards biased(r,g,b) by factor *alpha*
     * @param r
     * @param g
     * @param b
     * @param alpha
     * @param index
     */
    NeuQuant.prototype.altersingle = function (r, g, b, alpha, index) {
        this._network[index][0] -= alpha * (this._network[index][0] - b) / this._initalpha;
        this._network[index][1] -= alpha * (this._network[index][1] - g) / this._initalpha;
        this._network[index][2] -= alpha * (this._network[index][2] - r) / this._initalpha;
    };
    /**
     * Private Method: alterneigh
     * moves neurons in *radius* around index *i* towards biased (b,g,r) by factor *alpha*
     */
    NeuQuant.prototype.alterneigh = function (r, g, b, radius, index) {
        var low = Math.abs(index - radius);
        var hi = Math.min(index + radius, this._netsize);
        var j = index + 1;
        var k = index - 1;
        var m = 1;
        var p, a;
        while (j < hi || k > low) {
            a = this._radpower[m++];
            if (j < hi) {
                p = this._network[j++];
                p[0] -= a * (p[0] - b) / this._alphabiasshift;
                p[1] -= a * (p[1] - g) / this._alphabiasshift;
                p[2] -= a * (p[2] - r) / this._alphabiasshift;
            }
            if (k > low) {
                p = this._network[k--];
                p[0] -= a * (p[0] - b) / this._alphabiasshift;
                p[1] -= a * (p[1] - g) / this._alphabiasshift;
                p[2] -= a * (p[2] - r) / this._alphabiasshift;
            }
        }
    };
    /**
     * Private Method: Contest
     * searches for biased RGB values
     * @param r
     * @param g
     * @param b
     */
    NeuQuant.prototype.contest = function (r, g, b) {
        /**
         * finds closest neuron (min distance) and updates freq
         * finds best neuron (min distance-bias) and returns position
         * for frequently chosen neurons, freq[i]  is high and bias[i] is
         * negative bias[i] = gamma * ((1 / netsize) - freq[i])
         */
        var bestd = ~(1 << 31);
        var bestbiasd = bestd;
        var bestpos = -1;
        var bestbiaspos = bestpos;
        var n, distance, biasdist, betafreq;
        for (var index = 0; index < this._netsize; index++) {
            n = this._network[index];
            distance = Math.abs(n[0] - b) + Math.abs(n[1] - g) + Math.abs(n[2] - r);
            if (distance < bestd) {
                bestd = distance;
                bestpos = index;
            }
            biasdist = distance - (this._bias[index] >> this._intbiasshift - this._netbiasshift);
            if (biasdist < bestbiasd) {
                bestbiasd = biasdist;
                bestbiaspos = index;
            }
            betafreq = this._freq[index] >> this._betashift;
            this._freq[index] -= betafreq;
            this._bias[index] += betafreq << this._gammashift;
            this._freq[bestpos] += this._beta;
            this._bias[bestpos] -= this._betagamma;
            return bestbiaspos;
        }
    };
    /**
     * Private Method: inxbuild
     * sorts network and builds netindex[0...255]
     */
    NeuQuant.prototype.inxbuild = function () {
        var _a, _b, _c;
        var j,
            p,
            q,
            smallpos,
            smallval,
            previouscol = 0,
            startpos = 0;
        for (var index = 0; index < this._netsize; index++) {
            p = this._network[index];
            smallpos = index;
            smallval = p[1]; /* index on g */
            /* find smallest in i ...netsize -1 */
            for (j = index + 1; j < this._netsize; j++) {
                q = this._network[j];
                if (q[1] < smallval) {
                    smallpos = j;
                    smallval = q[1];
                }
            }
            q = this._network[smallpos];
            /* swap p[i] and q[smallpos] entries */
            if (index != smallpos) {
                _a = [p[0], q[0]], q[0] = _a[0], p[0] = _a[1];
                _b = [p[1], q[1]], q[1] = _b[0], p[1] = _b[1];
                _c = [p[2], q[2]], q[2] = _c[0], p[2] = _c[1];
            }
            /* smallval entry is now in position i */
            if (smallval != previouscol) {
                this._netindex[previouscol] = startpos + index >> 1;
                for (j = previouscol + 1; j < smallval; j++) {
                    this._netindex[j] = index;
                    previouscol = smallval;
                    startpos = index;
                }
            }
            this._netindex[previouscol] = startpos + this._maxnetpos >> 1;
            for (j = previouscol + 1; j < 256; j++) {
                this._netindex[j] = this._maxnetpos; /* really 256 */
            }
        }
    };
    /**
     * Private Method: inxsearch
     * searches for BGR values 0 ... 255 and return a color index
     * @param r
     * @param g
     * @param b
     */
    NeuQuant.prototype.getPixelIndex = function (r, g, b) {
        var a, p, dist;
        var bestd = 1000; /* biggest possible dist is 256*3 */
        var best = -1;
        var i = this._netindex[g]; /* index on g */
        var j = i - 1; /* start a netindex[g] and work outwards */
        while (i < this._netsize || j >= 0) {
            if (i < this._netsize) {
                p = this._network[i];
                dist = p[1] - g; /* index key */
                if (dist >= bestd) i = this._netsize;
                /* stop iter */else {
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
                p = this._network[j];
                dist = g - p[1]; /* index key - reverse dif */
                if (dist >= bestd) j = -1;
                /* stop iter */else {
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
    };
    /**
     * Private Method: learn
     * Main learning loop
     */
    NeuQuant.prototype.learn = function () {
        console.log("NeuQuant learning started");
        var i;
        var lengthcount = this._pixels.length;
        var alphadec = this.toInt(30 + (this._sampleFactor - 1) / 3);
        var samplepixels = this.toInt(lengthcount / (3 * this._sampleFactor));
        var delta = this.toInt(samplepixels / this._ncycles);
        var alpha = this._initalpha;
        var radius = this._initradius;
        var rad = radius >> this._radiusbiasshift;
        if (rad <= 1) rad = 0;
        for (i = 0; i < rad; i++) {
            this._radpower[i] = this.toInt(alpha * ((rad * rad - i * i) * this._radbias / (rad * rad)));
        }var step;
        if (lengthcount < this._minpicturebytes) {
            this._sampleFactor = 1;
            step = 3;
        } else if (lengthcount % this._prime1 !== 0) {
            step = 3 * this._prime1;
        } else if (lengthcount % this._prime2 !== 0) {
            step = 3 * this._prime2;
        } else if (lengthcount % this._prime3 !== 0) {
            step = 3 * this._prime3;
        } else {
            step = 3 * this._prime4;
        }
        var b, g, r, j;
        var pix = 0; // current pixel
        i = 0;
        while (i < samplepixels) {
            b = (this._pixels[pix] & 0xff) << this._netbiasshift;
            g = (this._pixels[pix + 1] & 0xff) << this._netbiasshift;
            r = (this._pixels[pix + 2] & 0xff) << this._netbiasshift;
            j = this.contest(b, g, r);
            console.log(j);
            this.altersingle(b, g, r, alpha, j);
            if (rad !== 0) this.alterneigh(b, g, r, rad, j); // alter neighbours
            pix += step;
            if (pix >= lengthcount) pix -= lengthcount;
            i++;
            if (delta === 0) delta = 1;
            if (i % delta === 0) {
                alpha -= alpha / alphadec;
                radius -= radius / this._radiusdec;
                rad = radius >> this._radiusbiasshift;
                if (rad <= 1) rad = 0;
                for (j = 0; j < rad; j++) {
                    this._radpower[j] = this.toInt(alpha * ((rad * rad - j * j) * this._radbias / (rad * rad)));
                }
            }
        }
    };
    /**
     *
     * Method: getColormap
     * builds colormap from the index
     * returns array in the format:
     *
     *  [r, g, b, r, g, b, r, g, b, ..]
     *
     */
    NeuQuant.prototype.getColormap = function () {
        var map = [];
        var index = [];
        for (var i = 0; i < this._netsize; i++) {
            index[this._network[i][3]] = i;
        }var k = 0;
        for (var l = 0; l < this._netsize; l++) {
            var j = index[l];
            map[k++] = this._network[j][0];
            map[k++] = this._network[j][1];
            map[k++] = this._network[j][2];
        }
        return map;
    };
    NeuQuant.prototype.buildColorMap = function () {
        this.initColorMapSize();
        this.learn();
        this.unbiasnet();
        this.inxbuild();
    };
    return NeuQuant;
}();
exports.NeuQuant = NeuQuant;
},{}],44:[function(require,module,exports) {
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
  var ws = new WebSocket(protocol + '://' + hostname + ':' + '60287' + '/');
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
},{}]},{},[44,63], null)
//# sourceMappingURL=/NeuQuant.81cf871b.map