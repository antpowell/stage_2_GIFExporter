/**
 * This class handles LZW encoding
 * Adapted from Jef Poskanzer's Java port by way of J. M. G. Elliott.
 * @author Kevin Weiner (original Java version - kweiner@fmsware.com)
 * @author Thibault Imbert (AS3 version - bytearray.org)
 * @author Kevin Kwok (JavaScript version - https://github.com/antimatter15/jsgif)
 * @version 0.1 AS3 implementation
 */
var LZWEncoder = /** @class */ (function () {
    function LZWEncoder(width, height, pixels, color_depth) {
        this.exports = {};
        this.EOF = -1;
        // GIFCOMPR.C - GIF Image compression routines
        // Lempel-Ziv compression based on 'compress'. GIF modifications by
        // David Rowley (mgardi@watdcsu.waterloo.edu)
        // General DEFINEs
        this.BITS = 12;
        this.HSIZE = 5003; // 80% occupancy
        this.maxbits = this.BITS; // user settable max # bits/code
        this.maxmaxcode = 1 << this.BITS; // should NEVER generate this code
        this.htab = [];
        this.codetab = [];
        this.hsize = this.HSIZE; // for dynamic table sizing
        this.free_ent = 0; // first unused entry
        // block compression parameters -- after all codes are used up,
        // and compression rate changes, start over.
        this.clear_flg = false;
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
        this.cur_accum = 0;
        this.cur_bits = 0;
        this.masks = [
            0x0000,
            0x0001,
            0x0003,
            0x0007,
            0x000f,
            0x001f,
            0x003f,
            0x007f,
            0x00ff,
            0x01ff,
            0x03ff,
            0x07ff,
            0x0fff,
            0x1fff,
            0x3fff,
            0x7fff,
            0xffff,
        ];
        // Define the storage for the packet accumulator
        this.accum = [];
        this.imgW = width;
        this.imgH = height;
        this.pixAry = pixels;
        this.initCodeSize = Math.max(2, color_depth);
    }
    // Add a character to the end of the current packet, and if it is 254
    // characters, flush the packet to disk.
    LZWEncoder.prototype.char_out = function (c, outs) {
        this.accum[this.a_count++] = c;
        if (this.a_count >= 254)
            this.flush_char(outs);
    };
    // Clear out the hash table
    // table clear for block compress
    LZWEncoder.prototype.cl_block = function (outs) {
        this.cl_hash(this.hsize);
        this.free_ent = this.ClearCode + 2;
        this.clear_flg = true;
        this.output(this.ClearCode, outs);
    };
    // reset code table
    LZWEncoder.prototype.cl_hash = function (hsize) {
        for (var i = 0; i < hsize; ++i)
            this.htab[i] = -1;
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
        this.g_init_bits = init_bits;
        // Set up the necessary values
        this.clear_flg = false;
        this.n_bits = this.g_init_bits;
        this.maxcode = this.MAXCODE(this.n_bits);
        this.ClearCode = 1 << (init_bits - 1);
        this.EOFCode = this.ClearCode + 1;
        this.free_ent = this.ClearCode + 2;
        this.a_count = 0; // clear packet
        ent = this.nextPixel();
        hshift = 0;
        for (fcode = this.hsize; fcode < 65536; fcode *= 2)
            ++hshift;
        hshift = 8 - hshift; // set hash code range bound
        hsize_reg = this.hsize;
        this.cl_hash(hsize_reg); // clear hash table
        this.output(this.ClearCode, outs);
        outer_loop: while ((c = this.nextPixel()) != this.EOF) {
            fcode = (c << this.maxbits) + ent;
            i = (c << hshift) ^ ent; // xor hashing
            if (this.htab[i] == fcode) {
                ent = this.codetab[i];
                continue;
            }
            else if (this.htab[i] >= 0) {
                // non-empty slot
                disp = hsize_reg - i; // secondary hash (after G. Knott)
                if (i === 0)
                    disp = 1;
                do {
                    if ((i -= disp) < 0)
                        i += hsize_reg;
                    if (this.htab[i] == fcode) {
                        ent = this.codetab[i];
                        continue outer_loop;
                    }
                } while (this.htab[i] >= 0);
            }
            this.output(ent, outs);
            ent = c;
            if (this.free_ent < this.maxmaxcode) {
                this.codetab[i] = this.free_ent++; // code -> hashtable
                this.htab[i] = fcode;
            }
            else
                this.cl_block(outs);
        }
        // Put out the final code.
        this.output(ent, outs);
        this.output(this.EOFCode, outs);
    };
    // ----------------------------------------------------------------------------
    LZWEncoder.prototype.encode = function (os) {
        // return new Promise((resolve, rejcet) => {
        os.write(this.initCodeSize); // write "initial code size" byte
        this.remaining = this.imgW * this.imgH; // reset navigation variables
        this.curPixel = 0;
        this.compress(this.initCodeSize + 1, os).then(function () {
            os.write(0); // write block terminator
            // resolve();
        }); // compress and write the pixel data
        // });
    };
    // Flush the packet to disk, and reset the accumulator
    LZWEncoder.prototype.flush_char = function (outs) {
        if (this.a_count > 0) {
            outs.write(this.a_count);
            outs.writeArray(this.accum, this.a_count);
            this.a_count = 0;
        }
    };
    LZWEncoder.prototype.MAXCODE = function (n_bits) {
        return (1 << n_bits) - 1;
    };
    // ----------------------------------------------------------------------------
    // Return the next pixel from the image
    // ----------------------------------------------------------------------------
    LZWEncoder.prototype.nextPixel = function () {
        if (this.remaining === 0)
            return this.EOF;
        --this.remaining;
        var pix = this.pixAry[this.curPixel++];
        return pix & 0xff;
    };
    LZWEncoder.prototype.output = function (code, outs) {
        this.cur_accum &= this.masks[this.cur_bits];
        if (this.cur_bits > 0)
            this.cur_accum |= code << this.cur_bits;
        else
            this.cur_accum = code;
        this.cur_bits += this.n_bits;
        while (this.cur_bits >= 8) {
            this.char_out(this.cur_accum & 0xff, outs);
            this.cur_accum >>= 8;
            this.cur_bits -= 8;
        }
        // If the next entry is going to be too big for the code size,
        // then increase it, if possible.
        if (this.free_ent > this.maxcode || this.clear_flg) {
            if (this.clear_flg) {
                this.maxcode = this.MAXCODE((this.n_bits = this.g_init_bits));
                this.clear_flg = false;
            }
            else {
                ++this.n_bits;
                if (this.n_bits == this.maxbits)
                    this.maxcode = this.maxmaxcode;
                else
                    this.maxcode = this.MAXCODE(this.n_bits);
            }
        }
        if (code == this.EOFCode) {
            // At EOF, write the rest of the buffer.
            while (this.cur_bits > 0) {
                this.char_out(this.cur_accum & 0xff, outs);
                this.cur_accum >>= 8;
                this.cur_bits -= 8;
            }
            this.flush_char(outs);
        }
    };
    return LZWEncoder;
}());
//# sourceMappingURL=LZWEncoder2.js.map