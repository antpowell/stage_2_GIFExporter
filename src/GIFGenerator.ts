import { EncodedImage } from './EncodedImage';
///<reference path = '../JS/LZWEncoder.js'/>

export class GIFGenerator {
	stream: EncodedImage = new EncodedImage();
	byteCount: number = 0;
	width: number;
	height: number;
	encodedImage: EncodedImage = new EncodedImage();
	frameIndexedPixels: number[];
	frameCount: number = 0;
	GCT: string[];

	constructor(width: number, height: number, GCT: string[]) {
		this.width = width;
		this.height = height;
		this.GCT = GCT;
		console.log(`Generator now running...`);
	}

	init() {
		this.headerGenerator();
		this.LSDGenerator();
		this.GCTWriter();
		this.AppExtGenerator();
	}

	generateFrame(indexedPixels: number[], frameCount?: number) {
		this.frameIndexedPixels = indexedPixels;
		this.frameCount += 1;
		console.log(`generating frame ${this.frameCount}`);
		this.GCEGenerator();
		this.imgDescGenerator();
		this.imgDataGenerator();
	}

	download(filename: string) {
		this.TrailerGenerator();

		console.log('downloading');
		console.log(this.stream);

		const download = document.createElement('a');
		download.download = filename;
		download.href = URL.createObjectURL(
			new Blob([new Uint8Array(this.stream.get())], {
				type: 'image/gif',
			})
		);
		download.click();
	}

	headerGenerator() {
		this.stream.writeUTF('GIF89a'); /* GIF Header */
	}

	LSDGenerator() {
		this.stream.writeLittleEndian(this.width); /* Canvas Width */
		this.stream.writeLittleEndian(this.height); /* Canvas Height */
		this.stream.write(0xf7); /* Packed Field */
		this.stream.write(0); /* Background Color Index */
		this.stream.write(0); /* Pixel Aspect Ration */
	}

	GCEGenerator() {
		this.stream.write(0x21); /* Extension Introducer */
		this.stream.write(0xf9); /* Graphic Control Label */
		this.stream.write(0x4); /* Byte Size */
		this.stream.write(0x4); /* Packed Field */
		this.stream.writeLittleEndian(0x9); /* Delay Time */
		this.stream.write(0x0); /* Transparent Color Index */
		this.stream.write(0x0); /* Block Terminator */
	}

	imgDescGenerator() {
		this.stream.write(0x2c); /* Image Seperator Always 2C */
		this.stream.writeLittleEndian(0x0); /* Image Left */
		this.stream.writeLittleEndian(0x0); /* Image Top */
		this.stream.writeLittleEndian(this.width); /* Image Width */
		this.stream.writeLittleEndian(this.height); /* Image Height */
		this.stream.write(0x0); /* Block Terminator */
	}

	AppExtGenerator() {
		this.stream.write(0x21); /* extension introducer */
		this.stream.write(0xff); /* app extension label */
		this.stream.write(11); /* block size */
		this.stream.writeUTF('NETSCAPE' + '2.0'); /* app id + auth code */
		this.stream.write(3); /* sub-block size */
		this.stream.write(1); /* loop sub-block id */
		this.stream.writeLittleEndian(
			0
		); /* loop count (extra iterations, 0=repeat forever) */
		this.stream.write(0); /* Block Terminator */
	}

	TrailerGenerator() {
		this.stream.write(0x3b); /* Trailer Marker */
		console.log(`Generator now finished.`);
	}

	GCTWriter() {
		let count = 0;

		this.GCT.forEach(color => {
			count += 3;
			this.stream.writeColor(color);
		});

		for (let i = count; i < 3 * 256; i++) {
			this.stream.write(0);
		}
	}

	imgDataGenerator() {
		const encoder = new LZWEncoder(
			this.width,
			this.height,
			this.frameIndexedPixels,
			8
		);
		encoder.encode(this.stream);
		console.log(`completed frame ${this.frameCount}`);
	}

	LCTGenerator() {}

	PlainTextExtGenerator() {}

	CommentExtGenerator() {}

	writeLittleEndian(num: number) {
		this.stream.write(num & 0xff);
		this.stream.write((num >> 8) & 0xff);
	}
}
