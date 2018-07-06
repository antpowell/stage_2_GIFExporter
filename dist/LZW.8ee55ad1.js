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
})({12:[function(require,module,exports) {
"use strict";
/**
 * This class handles LZW encoding
 * Adapted from Jef Poskanzer's Java port by way of J. M. G. Elliott.
 * @author Kevin Weiner (original Java version - kweiner@fmsware.com)
 * @author Thibault Imbert (AS3 version - bytearray.org)
 * @author Kevin Kwok (JavaScript version - https://github.com/antimatter15/jsgif)
 * @author Anthony Powell (TypeScript version)
 * @version 0.1 AS3 implementation
 */

Object.defineProperty(exports, "__esModule", { value: true });
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
},{}],40:[function(require,module,exports) {
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
  var ws = new WebSocket(protocol + '://' + hostname + ':' + '62125' + '/');
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
},{}]},{},[40,12], null)
//# sourceMappingURL=/LZW.8ee55ad1.map