export class EncodedImage {
	data: number[] = [];

	constructor() {}

	public get(): number[] {
		return this.data;
	}

	public write(byte: number): void {
		this.data.push(byte);
	}

	public writeArray(array: number[], arraySize: number): void {
		for (let i = 0; i < arraySize; i++) {
			this.write(array[i]);
		}
	}

	public writeUTF(UTF: string): void {
		for (let i = 0; i < UTF.length; i++) {
			this.write(UTF.charCodeAt(i));
		}
	}

	public writeColor(color: string): void {
		for (let i = 0; i < color.length; i += 2) {
			const intValue: number = parseInt(color[i] + color[i + 1], 16);
			this.write(intValue);
		}
	}

	public writeLittleEndian(num: number): void {
		this.write(num & 0xff);
		this.write((num >> 8) & 0xff);
	}

	public reset() {
		this.data = [];
	}
}

/**
 * This class handles LZW encoding
 * Adapted from Jef Poskanzer's Java port by way of J. M. G. Elliott.
 * @author Kevin Weiner (original Java version - kweiner@fmsware.com)
 * @author Thibault Imbert (AS3 version - bytearray.org)
 * @author Kevin Kwok (JavaScript version - https://github.com/antimatter15/jsgif)
 * @author Anthony Powell (TypeScript version)
 * @version 0.1 AS3 implementation
 */

export class LZWEncoder {
	private readonly EOF = 1;

	// GIFCOMPR.C - GIF Image compression routines
	// Lempel-Ziv compression based on 'compress'. GIF modifications by
	// David Rowley (mgardi@watdcsu.waterloo.edu)
	// General DEFINEs

	private readonly BITS = 12;
	private readonly HSIZE = 5003;

	private _imgW: number;
	private _imgH: number;
	private _pixels: number[];
	private _initCodeSize: number;
	private _remaining: number;
	private _curPixel: number;

	// GIF Image compression - modified 'compress'
	// Based on: compress.c - File compression ala IEEE Computer, June 1984.
	// By Authors: Spencer W. Thomas (decvax!harpo!utah-cs!utah-gr!thomas)
	// Jim McKie (decvax!mcvax!jim)
	// Steve Davies (decvax!vax135!petsd!peora!srd)
	// Ken Turkowski (decvax!decwrl!turtlevax!ken)
	// James A. Woods (decvax!ihnp4!ames!jaw)
	// Joe Orost (decvax!vax135!petsd!joe)

	private _n_bits: number; // number of bits/code
	private _maxbits = this.BITS; // user settable max # bits/code
	private _maxcode: number; // maximum code, given n_bits
	private _maxmaxcode = 1 << this.BITS; // should NEVER generate this code
	private _htab: number[] = [];
	private _codetab: number[] = [];
	private _hsize = this.HSIZE; // for dynamic table sizing
	private _free_ent = 0; // first unused entry

	// block compression parameters -- after all codes are used up,
	// and compression rate changes, start over.

	private _clear_flg = false;

	// Algorithm: use open addressing double hashing (no chaining) on the
	// prefix code / next character combination. We do a variant of Knuth's
	// algorithm D (vol. 3, sec. 6.4) along with G. Knott's relatively-prime
	// secondary probe. Here, the modular division first probe is gives way
	// to a faster exclusive-or manipulation. Also do block compression with
	// an adaptive reset, whereby the code table is cleared when the compression
	// ratio decreases, but after the table fills. The variable-length output
	// codes are re-sized at this point, and a special CLEAR code is generated
	// for the decompressor. Late addition: construct the table according to
	// file size for noticeable speed improvement on small files. Please direct
	// questions about this implementation to ames!jaw.

	private _g_init_bits: number;
	private _ClearCode: number;
	private _EOFCode: number;

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

	private _cur_accum = 0;
	private _cur_bits = 0;
	private _masks = [
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

	// Number of characters so far in this 'packet'
	private _a_count: number;

	// Define the storage for the packet accumulator
	private _accum: number[] = [];

	constructor(width: number, height: number, pixels: number[], colorDepth: number) {
		this._imgW = width;
		this._imgH = height;
		this._pixels = pixels;
		this._initCodeSize = Math.max(2, colorDepth);
	}

	// Add a character to the end of the current packet, and if it is 254
	// characters, flush the packet to disk.
	private writeCharToPacket(c: number, outs: EncodedImage): void {
		this._accum[this._a_count++] = c;
		if (this._a_count >= 254) this.flush_char(outs);
	}

	// Clear out the hash table
	// table clear for block compress

	private cl_block(outs: EncodedImage): void {
		this.cl_hash(this._hsize);
		this._free_ent = this._ClearCode + 2;
		this._clear_flg = true;
		this.output(this._ClearCode, outs);
	}

	// reset code table
	private cl_hash(hsize: number): void {
		for (let i = 0; i < hsize; ++i) this._htab[i] = -1;
	}

	private compress(init_bits: number, outs: EncodedImage) {
		let fcode;
		let i; /* = 0 */
		let c;
		let ent;
		let disp;
		let hsize_reg;
		let hshift;

		// Set up the globals: g_init_bits - initial number of bits
		this._g_init_bits = init_bits;

		// Set up the necessary values
		this._clear_flg = false;
		this._n_bits = this._g_init_bits;
		this._maxcode = this.MAXCODE(this._n_bits);

		this._ClearCode = 1 << (init_bits - 1);
		this._EOFCode = this._ClearCode + 1;
		this._free_ent = this._ClearCode + 2;

		this._a_count = 0; // clear packet

		ent = this.nextPixel();

		hshift = 0;
		for (fcode = this._hsize; fcode < 65536; fcode *= 2) ++hshift;
		hshift = 8 - hshift; // set hash code range bound

		hsize_reg = this._hsize;
		this.cl_hash(hsize_reg); // clear hash table

		this.output(this._ClearCode, outs);

		outer_loop: while ((c = this.nextPixel()) != this.EOF) {
			fcode = (c << this._maxbits) + ent;
			i = (c << hshift) ^ ent; // xor hashing

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
	}

	// ----------------------------------------------------------------------------
	public encode(os: EncodedImage) {
		os.write(this._initCodeSize); // write "initial code size" byte
		this._remaining = this._imgW * this._imgH; // reset navigation variables
		this._curPixel = 0;
		this.compress(this._initCodeSize + 1, os); // compress and write the pixel data
		os.write(0); // write block terminator
	}

	// Flush the packet to disk, and reset the accumulator
	private flush_char(outs: EncodedImage) {
		if (this._a_count > 0) {
			outs.write(this._a_count);
			outs.writeArray(this._accum, this._a_count);
			this._a_count = 0;
		}
	}

	private MAXCODE(n_bits: number) {
		return (1 << n_bits) - 1;
	}

	// ----------------------------------------------------------------------------
	// Return the next pixel from the image
	// ----------------------------------------------------------------------------

	private nextPixel() {
		if (this._remaining === 0) return this.EOF;
		--this._remaining;
		let pix = this._pixels[this._curPixel++];
		return pix & 0xff;
	}

	private output(code: number, outs: EncodedImage) {
		this._cur_accum &= this._masks[this._cur_bits];

		if (this._cur_bits > 0) this._cur_accum |= code << this._cur_bits;
		else this._cur_accum = code;

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
				this._maxcode = this.MAXCODE((this._n_bits = this._g_init_bits));
				this._clear_flg = false;
			} else {
				++this._n_bits;
				if (this._n_bits == this._maxbits) this._maxcode = this._maxmaxcode;
				else this._maxcode = this.MAXCODE(this._n_bits);
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
	}
}

export class GIFGenerator {
	private stream: EncodedImage = new EncodedImage();
	private width: number;
	private height: number;
	private frameIndexedPixels: number[];
	private frameCount: number = 0;
	private GCT: string[];

	constructor() {
		console.log(`Generator now running...`);
	}

	public init(width: number, height: number, GCT: string[]): void {
		this.reset();
		this.width = width;
		this.height = height;
		this.GCT = GCT;
		this.writeHeader();
		this.writeLogicalScreenDescriptor();
		this.writeGlobalColorTable();
		this.writeApplicationExtension();
	}

	public generateFrame(indexedPixels: number[]): void {
		this.frameIndexedPixels = indexedPixels;
		this.frameCount += 1;
		console.log(`generating frame ${this.frameCount}`);
		this.writeGraphicControlExtension();
		this.writeImageDescriptor();
		this.writeImageData();
	}

	public getStream(): number[] {
		this.writeTrailer();
		return this.stream.get();
	}

	private writeHeader(): void {
		this.stream.writeUTF('GIF89a'); /* GIF Header */
	}

	private writeLogicalScreenDescriptor(): void {
		this.stream.writeLittleEndian(this.width); /* Canvas Width */
		this.stream.writeLittleEndian(this.height); /* Canvas Height */
		this.stream.write(0xf7); /* Packed Field */
		this.stream.write(0); /* Background Color Index */
		this.stream.write(0); /* Pixel Aspect Ration */
	}

	private writeGraphicControlExtension(): void {
		this.stream.write(0x21); /* Extension Introducer */
		this.stream.write(0xf9); /* Graphic Control Label */
		this.stream.write(0x4); /* Byte Size */
		this.stream.write(0x4); /* Packed Field */
		this.stream.writeLittleEndian(0x9); /* Delay Time */
		this.stream.write(0x0); /* Transparent Color Index */
		this.stream.write(0x0); /* Block Terminator */
	}

	private writeImageDescriptor(): void {
		this.stream.write(0x2c); /* Image Seperator Always 2C */
		this.stream.writeLittleEndian(0x0); /* Image Left */
		this.stream.writeLittleEndian(0x0); /* Image Top */
		this.stream.writeLittleEndian(this.width); /* Image Width */
		this.stream.writeLittleEndian(this.height); /* Image Height */
		this.stream.write(0x0); /* Block Terminator */
	}

	private writeApplicationExtension(): void {
		this.stream.write(0x21); /* extension introducer */
		this.stream.write(0xff); /* app extension label */
		this.stream.write(11); /* block size */
		this.stream.writeUTF('NETSCAPE' + '2.0'); /* app id + auth code */
		this.stream.write(3); /* sub-block size */
		this.stream.write(1); /* loop sub-block id */
		this.stream.writeLittleEndian(0); /* loop count (extra iterations, 0=repeat forever) */
		this.stream.write(0); /* Block Terminator */
	}

	private writeTrailer(): void {
		this.stream.write(0x3b); /* Trailer Marker */
		console.log(`Generator now finished.`);
		this.frameCount = 0; /* Reset frame count for next GIF */
	}

	private writeGlobalColorTable(): void {
		let count = 0;

		this.GCT.forEach(color => {
			count += 3;
			this.stream.writeColor(color);
		});

		for (let i = count; i < 3 * 256; i++) {
			this.stream.write(0);
		}
	}

	private async writeImageData(): Promise<void> {
		const encoder = new LZWEncoder(this.width, this.height, this.frameIndexedPixels, 8);
		encoder.encode(this.stream);
		console.log(`completed frame ${this.frameCount}`);
	}

	private writeLocalColorTable(): void {}

	private writePlainTextExtension(): void {}

	private writeCommentExtension(): void {}

	private reset() {
		this.stream.reset();
		this.frameCount = 0;
	}
}

let gifGenerator: GIFGenerator = new GIFGenerator();
const ctx: Worker = self as any;

addEventListener('message', ev => {
	console.log(ev.data);
});
addEventListener('message', workHandler);

function init(width: number, height: number, GCT: string[]): void {
	console.log('initilizing');

	gifGenerator.init(width, height, GCT);
	ctx.postMessage({ status: 'initComplete' });
}

function addFrames(frames: number[][]): void {
	console.log('stitching frames');

	frames.forEach(frame => {
		gifGenerator.generateFrame(frame);
	});
	ctx.postMessage({ status: 'generateFramesComplete' });
}

function getStream() {
	console.log('getting data');
	ctx.postMessage({ status: 'getStreamComplete', data: gifGenerator.getStream() });
}

function workHandler(data: MessageEvent) {
	const { job, params } = data.data;

	switch (job) {
		case 'init':
			const { width, height, globalColorTable } = params;
			init(width, height, globalColorTable);
			break;
		case 'generateFrame':
			const { frames } = params;
			addFrames(frames);
			break;
		case 'getStream':
			getStream();
			break;
	}
}
